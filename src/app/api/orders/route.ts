import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch user orders
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST - Create new order from cart
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body for delivery info
    const body = await request.json().catch(() => ({}));
    const { phone, address, city, postalCode, notes } = body;

    // Get cart items
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

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Use provided delivery info or fallback to user's saved info
    const deliveryPhone = phone || user.phone;
    const deliveryAddress = address || user.address;
    const deliveryCity = city || user.city;
    const deliveryPostalCode = postalCode || user.postalCode;

    // Check if we have complete delivery info
    if (!deliveryPhone || !deliveryAddress || !deliveryCity || !deliveryPostalCode) {
      return NextResponse.json(
        { error: "Please provide complete delivery information", code: "INCOMPLETE_ADDRESS" },
        { status: 400 }
      );
    }

    // Calculate total
    const subtotal = cartItems.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );
    const deliveryFee = subtotal >= 25 ? 0 : 5;
    const tax = subtotal * 0.08;
    const total = subtotal + deliveryFee + tax;

    // Create order with items
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          status: "PENDING",
          total,
          address: deliveryAddress,
          city: deliveryCity,
          postalCode: deliveryPostalCode,
          phone: deliveryPhone,
          notes: notes || null,
          estimatedDelivery: new Date(Date.now() + 45 * 60 * 1000), // 45 mins from now
        },
      });

      // Create order items
      await tx.orderItem.createMany({
        data: cartItems.map((item) => ({
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
          size: item.size,
        })),
      });

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { userId: session.user.id },
      });

      return newOrder;
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
