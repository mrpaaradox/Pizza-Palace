import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MenuClient from "./menu-client";

export default async function MenuPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

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

  return <MenuClient categories={categories} />;
}
