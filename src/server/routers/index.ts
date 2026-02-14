import { z } from "zod";
import { router, publicProcedure, protectedProcedure, adminProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { createPolarCheckout } from "@/lib/polar";

const PizzaSizeSchema = z.enum(["SMALL", "MEDIUM", "LARGE", "XLARGE"]);
const OrderStatusSchema = z.enum(["PENDING", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]);
const PaymentMethodSchema = z.enum(["ONLINE", "CASH_ON_DELIVERY"]);
const DiscountTypeSchema = z.enum(["PERCENTAGE", "FIXED"]);

export const appRouter = router({
  cart: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const cartItems = await ctx.prisma.cartItem.findMany({
        where: { userId: ctx.user.id },
        include: { product: true },
      });
      return cartItems;
    }),

    add: protectedProcedure
      .input(z.object({
        productId: z.string(),
        quantity: z.number().min(1),
        size: PizzaSizeSchema,
      }))
      .mutation(async ({ ctx, input }) => {
        const { productId, quantity, size } = input;

        const product = await ctx.prisma.product.findUnique({
          where: { id: productId },
        });

        if (!product) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
        }

        const existingItem = await ctx.prisma.cartItem.findFirst({
          where: {
            userId: ctx.user.id,
            productId,
            size,
          },
        });

        if (existingItem) {
          return ctx.prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + quantity },
            include: { product: true },
          });
        }

        return ctx.prisma.cartItem.create({
          data: {
            userId: ctx.user.id,
            productId,
            quantity,
            size,
          },
          include: { product: true },
        });
      }),

    update: protectedProcedure
      .input(z.object({
        itemId: z.string(),
        quantity: z.number().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const { itemId, quantity } = input;

        const existingItem = await ctx.prisma.cartItem.findFirst({
          where: {
            id: itemId,
            userId: ctx.user.id,
          },
        });

        if (!existingItem) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
        }

        return ctx.prisma.cartItem.update({
          where: { id: itemId },
          data: { quantity },
        });
      }),

    remove: protectedProcedure
      .input(z.object({ itemId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { itemId } = input;

        const existingItem = await ctx.prisma.cartItem.findFirst({
          where: {
            id: itemId,
            userId: ctx.user.id,
          },
        });

        if (!existingItem) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
        }

        await ctx.prisma.cartItem.delete({
          where: { id: itemId },
        });

        return { success: true };
      }),
  }),

  orders: router({
    get: protectedProcedure
      .input(z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
      }).optional())
      .query(async ({ ctx, input }) => {
        const page = input?.page ?? 1;
        const limit = input?.limit ?? 10;
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
          ctx.prisma.order.findMany({
            where: { userId: ctx.user.id },
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
                    select: { name: true },
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
          ctx.prisma.order.count({
            where: { userId: ctx.user.id },
          }),
        ]);

        return {
          orders,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
          },
        };
      }),

    create: protectedProcedure
      .input(z.object({
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        postalCode: z.string().optional(),
        notes: z.string().optional(),
        couponId: z.string().optional(),
        paymentMethod: PaymentMethodSchema.default("ONLINE"),
      }))
      .mutation(async ({ ctx, input }) => {
        const { phone, address, city, postalCode, notes, couponId, paymentMethod } = input;

        const cartItems = await ctx.prisma.cartItem.findMany({
          where: { userId: ctx.user.id },
          include: { product: true },
        });

        if (cartItems.length === 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Cart is empty" });
        }

        const user = await ctx.prisma.user.findUnique({
          where: { id: ctx.user.id },
        });

        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }

        const deliveryPhone = phone || user.phone;
        const deliveryAddress = address || user.address;
        const deliveryCity = city || user.city;
        const deliveryPostalCode = postalCode || user.postalCode;

        if (!deliveryPhone || !deliveryAddress || !deliveryCity || !deliveryPostalCode) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Please provide complete delivery information",
          });
        }

        let subtotal = cartItems.reduce(
          (sum, item) => sum + Number(item.product.price) * item.quantity,
          0
        );
        let discount = 0;
        let coupon = null;

        if (couponId) {
          coupon = await ctx.prisma.coupon.findUnique({
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

        if (paymentMethod === "CASH_ON_DELIVERY" && total < 10) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Minimum order amount of $10 required for Cash on Delivery",
          });
        }

        const order = await ctx.prisma.$transaction(async (tx) => {
          const newOrder = await tx.order.create({
            data: {
              userId: ctx.user.id,
              status: "PENDING",
              paymentMethod,
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
            where: { userId: ctx.user.id },
          });

          return {
            ...newOrder,
            paymentMethod,
          };
        });

        if (paymentMethod === "ONLINE") {
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

            await ctx.prisma.order.update({
              where: { id: order.id },
              data: { status: "PENDING" },
            });

            return {
              ...order,
              checkoutUrl: checkout.url,
              checkoutId: checkout.id,
            };
          } catch (polarError) {
            console.error("Polar checkout error:", polarError);
            return {
              ...order,
              checkoutUrl: null,
              error: "Failed to create payment session. Order created but payment pending.",
            };
          }
        }

        return order;
      }),
  }),

  products: router({
    getAll: publicProcedure.query(async ({ ctx }) => {
      const products = await ctx.prisma.product.findMany({
        where: { isAvailable: true },
        include: { category: true },
      });
      return products;
    }),

    getCategories: publicProcedure.query(async ({ ctx }) => {
      const categories = await ctx.prisma.category.findMany({
        orderBy: { name: "asc" },
      });
      return categories;
    }),

    adminGetAll: adminProcedure.query(async ({ ctx }) => {
      const products = await ctx.prisma.product.findMany({
        include: { category: true },
        orderBy: { createdAt: "desc" },
      });
      return products;
    }),

    adminCreate: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        price: z.number().positive(),
        image: z.string().optional(),
        categoryId: z.string().min(1),
        isAvailable: z.boolean().default(true),
        isFeatured: z.boolean().default(false),
        prepTime: z.number().positive().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { name, description, price, image, categoryId, isAvailable, isFeatured, prepTime } = input;

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

        const existingProduct = await ctx.prisma.product.findUnique({
          where: { slug },
        });

        if (existingProduct) {
          throw new TRPCError({ code: "CONFLICT", message: "Product with this name already exists" });
        }

        return ctx.prisma.product.create({
          data: {
            name,
            slug: `${slug}-${Date.now()}`,
            description,
            price,
            image: image || "",
            categoryId,
            isAvailable,
            isFeatured,
            prepTime: prepTime || null,
          },
          include: { category: true },
        });
      }),

    adminUpdate: adminProcedure
      .input(z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        description: z.string().min(1),
        price: z.number().positive(),
        image: z.string().optional(),
        categoryId: z.string().min(1),
        isAvailable: z.boolean().default(true),
        isFeatured: z.boolean().default(false),
        prepTime: z.number().positive().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, name, description, price, image, categoryId, isAvailable, isFeatured, prepTime } = input;

        return ctx.prisma.product.update({
          where: { id },
          data: {
            name,
            description,
            price,
            image: image || "",
            categoryId,
            isAvailable,
            isFeatured,
            prepTime: prepTime || null,
          },
          include: { category: true },
        });
      }),
  }),

  categories: router({
    getAll: publicProcedure.query(async ({ ctx }) => {
      const categories = await ctx.prisma.category.findMany({
        orderBy: { name: "asc" },
      });
      return categories;
    }),

    adminCreate: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { name, description } = input;

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

        const existingCategory = await ctx.prisma.category.findUnique({
          where: { slug },
        });

        if (existingCategory) {
          throw new TRPCError({ code: "CONFLICT", message: "Category already exists" });
        }

        return ctx.prisma.category.create({
          data: {
            name,
            slug,
            description: description || null,
          },
        });
      }),
  }),

  coupons: router({
    validate: protectedProcedure
      .input(z.object({
        code: z.string().min(1),
        subtotal: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { code, subtotal } = input;

        const coupon = await ctx.prisma.coupon.findUnique({
          where: { code: code.toUpperCase() },
        });

        if (!coupon) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Invalid coupon code" });
        }

        if (!coupon.isActive) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "This coupon is no longer active" });
        }

        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "This coupon has expired" });
        }

        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "This coupon has reached its maximum usage limit" });
        }

        if (subtotal && subtotal < Number(coupon.minOrderAmount)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Minimum order amount of $${coupon.minOrderAmount} required for this coupon`,
          });
        }

        let discountAmount = 0;
        if (coupon.discountType === "PERCENTAGE") {
          discountAmount = ((subtotal || 0) * Number(coupon.discountValue)) / 100;
        } else {
          discountAmount = Number(coupon.discountValue);
        }

        return {
          id: coupon.id,
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: Number(coupon.discountValue),
          discountAmount: discountAmount.toFixed(2),
        };
      }),

    adminGetAll: adminProcedure.query(async ({ ctx }) => {
      const coupons = await ctx.prisma.coupon.findMany({
        orderBy: { createdAt: "desc" },
      });
      return coupons;
    }),

    adminCreate: adminProcedure
      .input(z.object({
        code: z.string().min(1),
        description: z.string().optional(),
        discountType: DiscountTypeSchema.default("PERCENTAGE"),
        discountValue: z.number().positive(),
        minOrderAmount: z.number().default(0),
        maxUses: z.number().positive().optional(),
        expiresAt: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { code, description, discountType, discountValue, minOrderAmount, maxUses, expiresAt } = input;

        const existingCoupon = await ctx.prisma.coupon.findUnique({
          where: { code: code.toUpperCase() },
        });

        if (existingCoupon) {
          throw new TRPCError({ code: "CONFLICT", message: "Coupon code already exists" });
        }

        return ctx.prisma.coupon.create({
          data: {
            code: code.toUpperCase(),
            description: description || null,
            discountType,
            discountValue,
            minOrderAmount,
            maxUses: maxUses || null,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            isActive: true,
          },
        });
      }),

    adminUpdate: adminProcedure
      .input(z.object({
        id: z.string().min(1),
        code: z.string().min(1).optional(),
        description: z.string().optional(),
        discountType: DiscountTypeSchema.optional(),
        discountValue: z.number().positive().optional(),
        minOrderAmount: z.number().optional(),
        maxUses: z.number().positive().optional(),
        expiresAt: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;

        const updateData: Record<string, unknown> = {};
        if (data.code) updateData.code = data.code.toUpperCase();
        if (data.description !== undefined) updateData.description = data.description;
        if (data.discountType) updateData.discountType = data.discountType;
        if (data.discountValue !== undefined) updateData.discountValue = data.discountValue;
        if (data.minOrderAmount !== undefined) updateData.minOrderAmount = data.minOrderAmount;
        if (data.maxUses !== undefined) updateData.maxUses = data.maxUses ? data.maxUses : null;
        if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;

        return ctx.prisma.coupon.update({
          where: { id },
          data: updateData,
        });
      }),

    adminDelete: adminProcedure
      .input(z.object({ id: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        await ctx.prisma.coupon.delete({
          where: { id: input.id },
        });
        return { success: true };
      }),
  }),

  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          address: true,
          city: true,
          postalCode: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return user;
    }),

    update: protectedProcedure
      .input(z.object({
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        postalCode: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { phone, address, city, postalCode } = input;

        return ctx.prisma.user.update({
          where: { id: ctx.user.id },
          data: {
            phone: phone || null,
            address: address || null,
            city: city || null,
            postalCode: postalCode || null,
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
            address: true,
            city: true,
            postalCode: true,
          },
        });
      }),
  }),

  admin: router({
    getOrders: adminProcedure.query(async ({ ctx }) => {
      const orders = await ctx.prisma.order.findMany({
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          items: {
            include: {
              product: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return orders;
    }),

    updateOrderStatus: adminProcedure
      .input(z.object({
        orderId: z.string().min(1),
        status: OrderStatusSchema,
      }))
      .mutation(async ({ ctx, input }) => {
        const { orderId, status } = input;

        return ctx.prisma.order.update({
          where: { id: orderId },
          data: { status },
          include: {
            user: { select: { id: true, name: true, email: true } },
            items: { include: { product: { select: { name: true } } } },
          },
        });
      }),

    getUsers: adminProcedure.query(async ({ ctx }) => {
      const users = await ctx.prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          address: true,
          city: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return users;
    }),

    getDashboardData: protectedProcedure.query(async ({ ctx }) => {
      const [products, categories, orders] = await Promise.all([
        ctx.prisma.product.findMany({
          where: { isAvailable: true },
          include: { category: true },
        }),
        ctx.prisma.category.findMany(),
        ctx.prisma.order.findMany({
          where: { status: { not: "CANCELLED" } },
          include: {
            items: { include: { product: { include: { category: true } } } },
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

      return {
        products,
        categories,
        categoryBreakdown,
        trendingProducts,
      };
    }),

    makeAdmin: adminProcedure
      .input(z.object({ userId: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.user.update({
          where: { id: input.userId },
          data: { role: "ADMIN" },
        });
      }),

    getSystemStatus: adminProcedure.query(async ({ ctx }) => {
      const [userCount, orderCount, productCount, categoryCount] = await Promise.all([
        ctx.prisma.user.count(),
        ctx.prisma.order.count(),
        ctx.prisma.product.count(),
        ctx.prisma.category.count(),
      ]);

      return {
        users: userCount,
        orders: orderCount,
        products: productCount,
        categories: categoryCount,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
