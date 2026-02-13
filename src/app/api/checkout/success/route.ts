import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const checkoutId = searchParams.get("checkout_id");

    if (!checkoutId) {
      return NextResponse.redirect(new URL("/dashboard/orders?error=no_checkout", request.url));
    }

    // Fetch checkout details from Polar
    const response = await fetch(`https://api.polar.sh/v1/checkouts/${checkoutId}`, {
      headers: {
        Authorization: `Bearer ${process.env.POLAR_ACCESS_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch checkout:", await response.text());
      return NextResponse.redirect(new URL("/dashboard/orders?error=fetch_failed", request.url));
    }

    const checkout = await response.json();

    // Get the order ID from metadata
    const orderId = checkout.metadata?.orderId;

    if (orderId) {
      // Update order status based on checkout status
      if (checkout.status === "confirmed" || checkout.status === "paid") {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "CONFIRMED" },
        });
        return NextResponse.redirect(new URL("/dashboard/orders?payment=success", request.url));
      }
    }

    return NextResponse.redirect(new URL("/dashboard/orders?payment=pending", request.url));
  } catch (error) {
    console.error("Checkout callback error:", error);
    return NextResponse.redirect(new URL("/dashboard/orders?error=unknown", request.url));
  }
}
