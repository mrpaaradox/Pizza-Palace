import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Pizza } from "lucide-react";
import ProductCarousel from "./product-carousel";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const products = await prisma.product.findMany({
    where: { isAvailable: true },
    include: { category: true },
    orderBy: [
      { isFeatured: "desc" },
      { name: "asc" },
    ],
    take: 20,
  });

  const carouselProducts = products.slice(0, 5).map(p => ({
    ...p,
    price: Number(p.price)
  }));
  const listProducts = products.slice(5).map(p => ({
    ...p,
    price: Number(p.price)
  }));

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">
          Hey {session?.user?.name?.split(" ")[0] || "there"}! 👋
        </h1>
        <p className="text-gray-300 mt-1">
          Ready to order some delicious pizza?
        </p>
      </div>

      <ProductCarousel products={carouselProducts} />

      {listProducts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">More to Explore</h2>
            <Link href="/dashboard/menu" className="text-sm text-red-500 hover:text-red-600 font-medium">
              View Full Menu →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {listProducts.map((product) => (
              <Link key={product.id} href={`/dashboard/menu?product=${product.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group rounded-xl border-0 shadow-md py-0">
                  <div className="h-32 bg-gray-200 relative rounded-t-xl overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                        <Pizza className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-gray-900 text-sm truncate group-hover:text-red-500">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500">{product.category.name}</p>
                    <p className="text-sm font-bold text-red-500 mt-1">
                      ${Number(product.price).toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
