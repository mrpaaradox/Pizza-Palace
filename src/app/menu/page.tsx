import { prisma } from "@/lib/prisma";
import MenuClient from "./menu-client";

export const dynamic = "force-dynamic";
export const revalidate = 30;

export default async function PublicMenuPage() {
  const categories = await prisma.category.findMany({
    include: {
      products: {
        where: { isAvailable: true },
        orderBy: [
          { isFeatured: "desc" },
          { name: "asc" },
        ],
      },
    },
    orderBy: { name: "asc" },
  });

  const serializedCategories = categories.map((category) => ({
    ...category,
    products: category.products.map((product) => ({
      ...product,
      price: Number(product.price),
    })),
  }));

  return <MenuClient categories={serializedCategories} />;
}
