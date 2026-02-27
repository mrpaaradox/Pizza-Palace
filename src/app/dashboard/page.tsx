import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./dashboard-client";

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

  const mappedProducts = products.map(p => ({
    ...p,
    price: Number(p.price)
  }));

  return <DashboardClient session={session} products={mappedProducts} />;
}
