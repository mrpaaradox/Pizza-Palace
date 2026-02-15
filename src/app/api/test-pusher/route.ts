import { NextRequest, NextResponse } from "next/server";
import { pusherServer, PUSHER_CHANNEL, PUSHER_EVENT } from "@/lib/pusher";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status, userId } = body;

    const update = {
      orderId,
      status,
      userId,
      timestamp: Date.now(),
    };

    await pusherServer.trigger(PUSHER_CHANNEL, PUSHER_EVENT, update);
    
    return NextResponse.json({ success: true, update });
  } catch (error) {
    console.error("[Test] Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
