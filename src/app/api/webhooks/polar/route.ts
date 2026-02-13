import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("polar-signature");

    // Verify webhook signature
    if (env.POLAR_WEBHOOK_SECRET) {
      const crypto = await import("crypto");
      const expectedSignature = crypto
        .createHmac("sha256", env.POLAR_WEBHOOK_SECRET)
        .update(body)
        .digest("hex");

      if (signature !== expectedSignature) {
        console.error("Invalid webhook signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const data = JSON.parse(body);
    const event = data.type;
    const checkout = data.data?.object;

    console.log("Polar webhook received:", event);

    // Handle checkout created
    if (event === "checkout.created") {
      console.log("Checkout created:", checkout?.id);
    }

    // Handle checkout updated (payment completed)
    if (event === "checkout.updated" && checkout?.status === "confirmed") {
      const orderId = checkout?.metadata?.orderId;
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "CONFIRMED" },
        });
        console.log("Order confirmed:", orderId);
      }
    }

    // Handle order paid
    if (event === "order.paid") {
      const orderId = checkout?.metadata?.orderId;
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "CONFIRMED" },
        });
        console.log("Order confirmed via order.paid:", orderId);
      }
    }

    // Handle checkout expired
    if (event === "checkout.expired") {
      const orderId = checkout?.metadata?.orderId;
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "CANCELLED" },
        });
        console.log("Order cancelled due to expired checkout:", orderId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
