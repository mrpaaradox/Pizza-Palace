import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const usersToDelete = await prisma.user.findMany({
      where: {
        deletedAt: {
          not: null,
          lte: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        deletedAt: true,
      },
    });

    if (usersToDelete.length === 0) {
      return NextResponse.json({
        message: "No users to delete",
        deletedCount: 0,
      });
    }

    const deletedUserIds = usersToDelete.map((u) => u.id);

    await prisma.cartItem.deleteMany({
      where: { userId: { in: deletedUserIds } },
    });

    const orderItems = await prisma.orderItem.findMany({
      where: { order: { userId: { in: deletedUserIds } } },
      select: { id: true },
    });
    await prisma.orderItem.deleteMany({
      where: { id: { in: orderItems.map((o) => o.id) } },
    });

    await prisma.order.deleteMany({
      where: { userId: { in: deletedUserIds } },
    });

    await prisma.session.deleteMany({
      where: { userId: { in: deletedUserIds } },
    });

    await prisma.account.deleteMany({
      where: { userId: { in: deletedUserIds } },
    });

    await prisma.verification.deleteMany({
      where: { identifier: { in: usersToDelete.map((u) => u.email) } },
    });

    await prisma.user.deleteMany({
      where: { id: { in: deletedUserIds } },
    });

    return NextResponse.json({
      message: "Users permanently deleted",
      deletedCount: deletedUserIds.length,
      deletedUsers: usersToDelete.map((u) => ({ id: u.id, email: u.email })),
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Failed to delete users" },
      { status: 500 }
    );
  }
}
