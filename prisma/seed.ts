import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

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
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
  },
  {
    name: "Sides",
    slug: "sides",
    description: "Perfect companions to your pizza",
    image: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=800",
  },
  {
    name: "Desserts",
    slug: "desserts",
    description: "Sweet treats to finish your meal",
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800",
  },
  {
    name: "Beverages",
    slug: "beverages",
    description: "Refreshing drinks to quench your thirst",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800",
  },
];

const products = [
  // Classic Pizzas
  {
    name: "Margherita",
    slug: "margherita",
    description: "Fresh mozzarella, tomato sauce, and basil on our signature crust",
    price: 12.99,
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800",
    categorySlug: "classic-pizzas",
    isFeatured: true,
    prepTime: 15,
  },
  {
    name: "Pepperoni",
    slug: "pepperoni",
    description: "Classic pepperoni with mozzarella and tomato sauce",
    price: 14.99,
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800",
    categorySlug: "classic-pizzas",
    isFeatured: true,
    prepTime: 15,
  },
  {
    name: "Cheese",
    slug: "cheese",
    description: "A blend of mozzarella, cheddar, and parmesan cheeses",
    price: 11.99,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
    categorySlug: "classic-pizzas",
    isFeatured: false,
    prepTime: 12,
  },
  {
    name: "Hawaiian",
    slug: "hawaiian",
    description: "Ham and pineapple with mozzarella cheese",
    price: 13.99,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
    categorySlug: "classic-pizzas",
    isFeatured: false,
    prepTime: 15,
  },
  {
    name: "Meat Lovers",
    slug: "meat-lovers",
    description: "Pepperoni, sausage, bacon, and ham with mozzarella",
    price: 16.99,
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800",
    categorySlug: "classic-pizzas",
    isFeatured: true,
    prepTime: 18,
  },
  
  // Specialty Pizzas
  {
    name: "BBQ Chicken",
    slug: "bbq-chicken",
    description: "Grilled chicken, BBQ sauce, red onions, and cilantro",
    price: 15.99,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
    categorySlug: "specialty-pizzas",
    isFeatured: true,
    prepTime: 18,
  },
  {
    name: "Veggie Supreme",
    slug: "veggie-supreme",
    description: "Mushrooms, peppers, onions, olives, and tomatoes",
    price: 14.99,
    image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=800",
    categorySlug: "specialty-pizzas",
    isFeatured: false,
    prepTime: 16,
  },
  {
    name: "Buffalo Chicken",
    slug: "buffalo-chicken",
    description: "Spicy buffalo chicken with ranch drizzle and celery",
    price: 15.99,
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800",
    categorySlug: "specialty-pizzas",
    isFeatured: false,
    prepTime: 18,
  },
  {
    name: "Mediterranean",
    slug: "mediterranean",
    description: "Feta cheese, olives, spinach, tomatoes, and oregano",
    price: 15.99,
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800",
    categorySlug: "specialty-pizzas",
    isFeatured: false,
    prepTime: 16,
  },
  {
    name: "Supreme",
    slug: "supreme",
    description: "Pepperoni, sausage, peppers, onions, and mushrooms",
    price: 16.99,
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800",
    categorySlug: "specialty-pizzas",
    isFeatured: true,
    prepTime: 18,
  },
  
  // Sides
  {
    name: "Garlic Bread",
    slug: "garlic-bread",
    description: "Freshly baked bread with garlic butter and herbs",
    price: 5.99,
    image: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=800",
    categorySlug: "sides",
    isFeatured: false,
    prepTime: 8,
  },
  {
    name: "Cheesy Breadsticks",
    slug: "cheesy-breadsticks",
    description: "Breadsticks loaded with mozzarella and served with marinara",
    price: 7.99,
    image: "https://images.unsplash.com/photo-1573140401552-3fab0b24306f?w=800",
    categorySlug: "sides",
    isFeatured: true,
    prepTime: 10,
  },
  {
    name: "Chicken Wings (8 pcs)",
    slug: "chicken-wings",
    description: "Crispy wings with your choice of sauce",
    price: 9.99,
    image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800",
    categorySlug: "sides",
    isFeatured: false,
    prepTime: 15,
  },
  {
    name: "Caesar Salad",
    slug: "caesar-salad",
    description: "Fresh romaine with Caesar dressing, croutons, and parmesan",
    price: 6.99,
    image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=800",
    categorySlug: "sides",
    isFeatured: false,
    prepTime: 5,
  },
  
  // Desserts
  {
    name: "Chocolate Lava Cake",
    slug: "chocolate-lava-cake",
    description: "Warm chocolate cake with a molten center",
    price: 6.99,
    image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800",
    categorySlug: "desserts",
    isFeatured: true,
    prepTime: 10,
  },
  {
    name: "Cinnamon Sticks",
    slug: "cinnamon-sticks",
    description: "Sweet cinnamon breadsticks with icing dip",
    price: 5.99,
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800",
    categorySlug: "desserts",
    isFeatured: false,
    prepTime: 8,
  },
  {
    name: "Tiramisu",
    slug: "tiramisu",
    description: "Classic Italian coffee-flavored dessert",
    price: 7.99,
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800",
    categorySlug: "desserts",
    isFeatured: false,
    prepTime: 5,
  },
  
  // Beverages
  {
    name: "Soft Drink (2L)",
    slug: "soft-drink-2l",
    description: "Your choice of Coca-Cola, Diet Coke, Sprite, or Fanta",
    price: 3.99,
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800",
    categorySlug: "beverages",
    isFeatured: false,
    prepTime: 2,
  },
  {
    name: "Bottled Water",
    slug: "bottled-water",
    description: "Refreshing spring water",
    price: 1.99,
    image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800",
    categorySlug: "beverages",
    isFeatured: false,
    prepTime: 1,
  },
  {
    name: "Iced Tea",
    slug: "iced-tea",
    description: "Freshly brewed iced tea, sweetened or unsweetened",
    price: 2.99,
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800",
    categorySlug: "beverages",
    isFeatured: false,
    prepTime: 2,
  },
  {
    name: "Lemonade",
    slug: "lemonade",
    description: "Fresh squeezed lemonade",
    price: 2.99,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800",
    categorySlug: "beverages",
    isFeatured: false,
    prepTime: 2,
  },
];

async function main() {
  console.log("🍕 Seeding Pizza Palace database...");

  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  console.log("📁 Creating categories...");
  for (const category of categories) {
    await prisma.category.create({
      data: category,
    });
  }

  console.log("🍕 Creating products...");
  for (const product of products) {
    const category = await prisma.category.findUnique({
      where: { slug: product.categorySlug },
    });
    
    if (category) {
      await prisma.product.create({
        data: {
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          image: product.image,
          categoryId: category.id,
          isFeatured: product.isFeatured || false,
          isAvailable: true,
          prepTime: product.prepTime,
        },
      });
    }
  }

  console.log("✅ Seeding completed!");
  console.log(`📊 Created ${categories.length} categories and ${products.length} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
    await prisma.$disconnect();
  });
