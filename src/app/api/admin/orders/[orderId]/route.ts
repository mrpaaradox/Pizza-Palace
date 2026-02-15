import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pusherServer, PUSHER_CHANNEL, PUSHER_EVENT } from "@/lib/pusher";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
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

    const update = {
        orderId,
        status: updatedOrder.status,
        userId: existingOrder?.userId,
        timestamp: Date.now(),
      };

      try {
        await pusherServer.trigger(PUSHER_CHANNEL, PUSHER_EVENT, update);
      } catch (pusherError) {
        console.error("[Pusher] ❌ Trigger failed:", pusherError);
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
