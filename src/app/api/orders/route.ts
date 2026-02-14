import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPolarCheckout } from "@/lib/polar";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: session.user.id },
        select: {
          id: true,
          status: true,
          total: true,
          createdAt: true,
          address: true,
          phone: true,
          estimatedDelivery: true,
          items: {
            select: {
              id: true,
              quantity: true,
              price: true,
              size: true,
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
          coupon: {
            select: {
              code: true,
              discountType: true,
              discountValue: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.order.count({
        where: { userId: session.user.id },
      }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { phone, address, city, postalCode, notes, couponId, paymentMethod } = body;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const deliveryPhone = phone || user.phone;
    const deliveryAddress = address || user.address;
    const deliveryCity = city || user.city;
    const deliveryPostalCode = postalCode || user.postalCode;

    if (!deliveryPhone || !deliveryAddress || !deliveryCity || !deliveryPostalCode) {
      return NextResponse.json(
        { error: "Please provide complete delivery information", code: "INCOMPLETE_ADDRESS" },
        { status: 400 }
      );
    }

    let subtotal = cartItems.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );
    let discount = 0;
    let coupon = null;

    if (couponId) {
      coupon = await prisma.coupon.findUnique({
        where: { id: couponId },
      });

      if (coupon && coupon.isActive && (!coupon.expiresAt || new Date(coupon.expiresAt) > new Date())) {
        if (coupon.discountType === "PERCENTAGE") {
          discount = (subtotal * Number(coupon.discountValue)) / 100;
        } else {
          discount = Number(coupon.discountValue);
        }
        subtotal = subtotal - discount;
      }
    }

    const deliveryFee = subtotal >= 25 ? 0 : 5;
    const tax = subtotal * 0.08;
    const total = subtotal + deliveryFee + tax;

    const selectedPaymentMethod = paymentMethod || "ONLINE";

    if (selectedPaymentMethod === "CASH_ON_DELIVERY" && total < 10) {
      return NextResponse.json(
        { error: "Minimum order amount of $10 required for Cash on Delivery", code: "COD_MINIMUM" },
        { status: 400 }
      );
    }

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          status: "PENDING",
          paymentMethod: selectedPaymentMethod,
          subtotal: subtotal + discount,
          deliveryFee,
          tax,
          total,
          discount,
          couponId: coupon?.id || null,
          address: deliveryAddress,
          city: deliveryCity,
          postalCode: deliveryPostalCode,
          phone: deliveryPhone,
          notes: notes || null,
          estimatedDelivery: new Date(Date.now() + 45 * 60 * 1000),
        },
      });

      await tx.orderItem.createMany({
        data: cartItems.map((item) => ({
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
          size: item.size,
        })),
      });

      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      await tx.cartItem.deleteMany({
        where: { userId: session.user.id },
      });

      return {
        ...newOrder,
        paymentMethod: selectedPaymentMethod,
      };
    });

    if (selectedPaymentMethod === "ONLINE") {
      try {
        const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
        
        const checkout = await createPolarCheckout({
          items: cartItems.map((item) => ({
            name: item.product.name,
            quantity: item.quantity,
            price: Number(item.product.price),
          })),
          customerEmail: user.email,
          customerName: user.name || undefined,
          orderId: order.id,
          successUrl: `${baseUrl}/dashboard/orders?payment=success&orderId=${order.id}`,
          cancelUrl: `${baseUrl}/dashboard/cart?payment=cancelled&orderId=${order.id}`,
        });

        await prisma.order.update({
          where: { id: order.id },
          data: { status: "PENDING" },
        });

        return NextResponse.json({
          ...order,
          checkoutUrl: checkout.url,
          checkoutId: checkout.id,
        });
      } catch (polarError) {
        console.error("Polar checkout error:", polarError);
        return NextResponse.json({
          ...order,
          checkoutUrl: null,
          error: "Failed to create payment session. Order created but payment pending.",
        });
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
