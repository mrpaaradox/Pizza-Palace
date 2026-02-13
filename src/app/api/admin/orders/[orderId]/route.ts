import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Redis } from "@upstash/redis";

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || "https://vocal-reindeer-41955.upstash.io";
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "AaPjAAIncDIzYjYyNmFlYTdlZDk0YTBhOWUzOGRmNjU5OGM0ZGUwOXAyNDE5NTU";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  console.log("[Admin] PATCH /api/admin/orders called");
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 },
      );
    }

    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true },
    });

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    try {
      const redis = new Redis({
        url: REDIS_URL,
        token: REDIS_TOKEN,
      });
      const update = JSON.stringify({
        orderId,
        status: updatedOrder.status,
        userId: existingOrder?.userId,
        timestamp: Date.now(),
      });
      await redis.lpush(`order-updates:${existingOrder?.userId}`, update);
      await redis.lpush(`order-updates:all`, update);
    } catch (redisError) {
      console.error("Redis error (non-fatal):", redisError);
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 },
    );
  }
}
