import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  {
    name: "Classic Pizzas",
    slug: "classic-pizzas",
    description: "Traditional favorites that never go out of style",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800",
  },
  {
    name: "Specialty Pizzas",
    slug: "specialty-pizzas",
    description: "Unique combinations for adventurous taste buds",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800",
  },
  {
    name: "Beverages",
    slug: "beverages",
    description: "Refreshing drinks to complement your pizza",
    image: "https://images.unsplash.com/photo-1585837575652-267c041d77d4?w=800",
  },
  {
    name: "Sides",
    slug: "sides",
    description: "Perfect accompaniments to your meal",
    image: "https://images.unsplash.com/photo-1608039829572-9c8ee9d14ce6?w=800",
  },
  {
    name: "Desserts",
    slug: "desserts",
    description: "Sweet endings to your pizza feast",
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800",
  },
];

const products = [
  {
    name: "Margherita",
    description: "Classic tomato sauce, mozzarella, fresh basil",
    price: 12.99,
    categorySlug: "classic-pizzas",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800",
  },
  {
    name: "Pepperoni",
    description: "Tomato sauce, mozzarella, pepperoni slices",
    price: 14.99,
    categorySlug: "classic-pizzas",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800",
  },
  {
    name: "Cheese",
    description: "Loaded with extra mozzarella cheese",
    price: 13.99,
    categorySlug: "classic-pizzas",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
  },
  {
    name: "BBQ Chicken",
    description: "BBQ sauce, grilled chicken, red onions, cilantro",
    price: 16.99,
    categorySlug: "specialty-pizzas",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
  },
  {
    name: "Veggie Supreme",
    description: "Bell peppers, mushrooms, onions, olives, tomatoes",
    price: 15.99,
    categorySlug: "specialty-pizzas",
    image: "https://images.unsplash.com/photo-1511689660979-10d2b1aada49?w=800",
  },
  {
    name: "Meat Lovers",
    description: "Pepperoni, sausage, bacon, ham, ground beef",
    price: 18.99,
    categorySlug: "specialty-pizzas",
    image: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=800",
  },
  {
    name: "Hawaiian",
    description: "Ham, pineapple, mozzarella",
    price: 14.99,
    categorySlug: "specialty-pizzas",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
  },
  {
    name: "Cola",
    description: "Refreshing cola drink",
    price: 2.49,
    categorySlug: "beverages",
    image: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=800",
  },
  {
    name: "Lemonade",
    description: "Fresh squeezed lemonade",
    price: 3.49,
    categorySlug: "beverages",
    image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=800",
  },
  {
    name: "Iced Tea",
    description: "Fresh brewed iced tea",
    price: 2.99,
    categorySlug: "beverages",
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800",
  },
  {
    name: "Garlic Bread",
    description: "Crispy bread with garlic butter",
    price: 4.99,
    categorySlug: "sides",
    image: "https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=800",
  },
  {
    name: "Mozzarella Sticks",
    description: "Golden fried mozzarella sticks with marinara",
    price: 6.99,
    categorySlug: "sides",
    image: "https://images.unsplash.com/photo-1548340748-6d2b7d7da280?w=800",
  },
  {
    name: "Buffalo Wings",
    description: "Crispy wings tossed in buffalo sauce",
    price: 8.99,
    categorySlug: "sides",
    image: "https://images.unsplash.com/photo-1529059997568-3d847b1154f0?w=800",
  },
  {
    name: "Chocolate Cake",
    description: "Rich chocolate lava cake",
    price: 6.99,
    categorySlug: "desserts",
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800",
  },
  {
    name: "Cheesecake",
    description: "Creamy New York style cheesecake",
    price: 5.99,
    categorySlug: "desserts",
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800",
  },
];

async function main() {
  console.log("Seeding database...");

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    console.log(`Created category: ${cat.name}`);
  }

  const categoriesData = await prisma.category.findMany();

  for (const product of products) {
    const category = categoriesData.find((c) => c.slug === product.categorySlug);
    await prisma.product.upsert({
      where: { id: product.name.toLowerCase().replace(/ /g, "-") },
      update: {},
      create: {
        id: product.name.toLowerCase().replace(/ /g, "-"),
        name: product.name,
        slug: product.name.toLowerCase().replace(/ /g, "-"),
        description: product.description,
        price: product.price,
        categoryId: category?.id || "",
        image: product.image,
      },
    });
    console.log(`Created product: ${product.name}`);
  }

  console.log("Seeding completed!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
