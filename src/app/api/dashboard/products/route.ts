import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [products, categories, orders] = await Promise.all([
      prisma.product.findMany({
        where: { isAvailable: true },
        include: { category: true },
      }),
      prisma.category.findMany(),
      prisma.order.findMany({
        where: {
          status: { not: "CANCELLED" },
        },
        include: {
          items: {
            include: {
              product: {
                include: { category: true },
              },
            },
          },
        },
      }),
    ]);

    const categoryBreakdown = categories.map((cat) => ({
      name: cat.name,
      value: products.filter((p) => p.categoryId === cat.id).length,
    })).filter((c) => c.value > 0);

    const productStats: Record<string, { name: string; quantity: number }> = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const productName = item.product?.name || "Unknown";
        if (!productStats[productName]) {
          productStats[productName] = { name: productName, quantity: 0 };
        }
        productStats[productName].quantity += item.quantity;
      });
    });

    const trendingProducts = Object.values(productStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    return NextResponse.json({
      products,
      categories,
      categoryBreakdown,
      trendingProducts,
    });
  } catch (error) {
    console.error("Dashboard products error:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
