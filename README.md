# 🍕 Pizza Palace

A full-stack pizza delivery application built with Next.js, Better Auth, Prisma, and PostgreSQL.

## ✨ Features

### User Features
- **Authentication**: Email/password login with Gmail-only restriction for customers
- **Email Verification**: Automated email verification using Resend
- **Browse Menu**: View pizzas by category with images and descriptions
- **Shopping Cart**: Add items, update quantities, remove items
- **Order Placement**: Complete checkout with delivery details
- **Order Tracking**: View order history and track current orders

### Admin Features
- **Dashboard Overview**: View stats (total orders, customers, revenue)
- **Order Management**: View all orders with filtering and pagination
- **Status Updates**: Update order status (Pending → Confirmed → Preparing → Out for Delivery → Delivered)
- **Customer Management**: View customer details

## 🚀 Tech Stack

- **Framework**: Next.js 16 with App Router
- **Authentication**: Better Auth with email/password
- **Database**: PostgreSQL with Prisma ORM
- **API**: tRPC for type-safe APIs (FE/BE share types)
- **Email**: Resend for email verification
- **Styling**: Tailwind CSS with shadcn/ui components
- **Package Manager**: PNPM

## 📦 Prerequisites

- Node.js 20+
- PNPM
- Docker (for PostgreSQL)
- Resend API key

## 🛠️ Setup Instructions

### 1. Clone and Install

```bash
# Install dependencies
pnpm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pizza_palace?schema=public"

# Better Auth (generate a secure secret)
BETTER_AUTH_SECRET="your-super-secret-key-change-in-production-min-32-characters-long"
BETTER_AUTH_URL="http://localhost:3000"

# Resend Email
RESEND_API_KEY="re_PtgyxhYG_J5g9SKtiKjhgvFEoWTi1agCX"
EMAIL_FROM="noreply@pizzapalace.com"
```

### 3. Start PostgreSQL

```bash
# Start the database
docker-compose up -d
```

### 4. Database Setup

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed the database with pizza data
pnpm db:seed
```

### 5. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Usage

### Creating an Admin User

1. Register a user with any email
2. Access the database and update the user's role to `ADMIN`:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@gmail.com';
```

Or use Prisma Studio:

```bash
pnpm db:studio
```

### Test Accounts

After seeding, you can create customer accounts using Gmail addresses. Admin accounts can use any email domain.

## 🗂️ Project Structure

```
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (routes)/      # Application routes
│   │   ├── admin/         # Admin dashboard
│   │   ├── api/
│   │   │   └── trpc/      # tRPC API endpoint
│   │   ├── dashboard/     # User dashboard
│   │   └── login/        # Auth pages
│   ├── components/        # UI components (shadcn)
│   ├── lib/              # Utilities
│   │   ├── auth.ts       # Better Auth config
│   │   ├── auth-client.ts# Auth client
│   │   ├── trpc.tsx     # tRPC client provider
│   │   ├── db-types.ts  # Database types
│   │   ├── env.ts       # Environment validation
│   │   └── prisma.ts    # Prisma client
│   └── server/           # tRPC server
│       ├── trpc.ts       # tRPC context & procedures
│       └── routers/      # API routers
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── seed.ts          # Seed data
│   └── config.ts        # Prisma config
└── docker-compose.yml    # PostgreSQL setup
```

## 🔌 tRPC API

This project uses tRPC for type-safe APIs. Frontend and backend share types - if you change a router input/output, TypeScript will show errors immediately.

### Available tRPC Procedures

- **Public**: `products.getAll`, `products.getCategories`, `categories.getAll`
- **Protected** (requires login): `cart.get`, `cart.add`, `cart.update`, `cart.remove`, `orders.get`, `orders.create`, `coupons.validate`, `profile.get`, `profile.update`
- **Admin**: `products.adminGetAll`, `products.adminCreate`, `products.adminUpdate`, `categories.adminCreate`, `coupons.adminGetAll`, `coupons.adminCreate`, `coupons.adminUpdate`, `coupons.adminDelete`, `admin.getOrders`, `admin.updateOrderStatus`, `admin.getUsers`, `admin.getDashboardData`, `admin.getSystemStatus`, `admin.makeAdmin`

### Using tRPC in Components

```tsx
import { trpc } from "@/lib/trpc";

// Query
const { data, isLoading } = trpc.products.getAll.useQuery();

// Mutation
const mutation = trpc.cart.add.useMutation({
  onSuccess: () => {
    utils.cart.get.invalidate();
  },
});
mutation.mutate({ productId, quantity, size: "MEDIUM" });
```
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (routes)/        # Application routes
│   │   ├── admin/           # Admin dashboard
│   │   ├── api/             # API routes
│   │   ├── dashboard/       # User dashboard
│   │   └── login/           # Auth pages
│   ├── components/          # UI components (shadcn)
│   ├── lib/                 # Utilities
│   │   ├── auth.ts         # Better Auth config
│   │   ├── auth-client.ts  # Auth client
│   │   ├── db-types.ts     # Database types
│   │   ├── env.ts          # Environment validation
│   │   └── prisma.ts       # Prisma client
│   └── generated/          # Generated Prisma client
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── seed.ts            # Seed data
│   └── config.ts          # Prisma config
└── docker-compose.yml     # PostgreSQL setup
```

## 🔐 Authentication Flow

1. **Registration**: Users sign up with Gmail-only email validation
2. **Email Verification**: Verification email sent via Resend
3. **Login**: Email/password authentication
4. **Session Management**: 7-day sessions with Better Auth
5. **Role-based Access**: Admin vs Customer routes protected

## 🎨 Key Components

### User Flow
- Landing Page → Register/Login → Dashboard → Menu → Cart → Checkout → Orders

### Admin Flow
- Login → Admin Dashboard → Orders (with pagination and status updates)

## 🚦 Order Status Flow

```
PENDING → CONFIRMED → PREPARING → OUT_FOR_DELIVERY → DELIVERED
    ↓
CANCELLED
```

## 📧 Email Configuration

The app uses Resend for transactional emails:
- Welcome/verification emails
- Password reset emails

**Note**: Update the `EMAIL_FROM` in `.env` to your verified domain once domain verification is complete in Resend.

## 🔧 Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Database
pnpm db:generate  # Generate Prisma client
pnpm db:migrate   # Run migrations
pnpm db:seed      # Seed database
pnpm db:studio    # Open Prisma Studio
```

## 🐛 Troubleshooting

### Prisma Client Issues
```bash
# Regenerate client
pnpm db:generate
```

### Database Connection
```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart database
docker-compose down
docker-compose up -d
```

### Reset Database
```bash
# Clear all data and start fresh
docker-compose down -v
docker-compose up -d
pnpm db:migrate
pnpm db:seed
```

## 🚀 Deployment

### Environment Variables for Production

```env
DATABASE_URL="postgresql://user:password@your-neon-db.neon.tech/pizza_palace?sslmode=require"
BETTER_AUTH_SECRET="your-production-secret"
BETTER_AUTH_URL="https://your-domain.com"
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="noreply@yourdomain.com"
```

### Build

```bash
pnpm build
```

## 📄 License

MIT License - feel free to use this project for your own pizza business!

## 🙏 Credits

Built with ❤️ using:
- [Next.js](https://nextjs.org)
- [Better Auth](https://better-auth.com)
- [Prisma](https://prisma.io)
- [shadcn/ui](https://ui.shadcn.com)
- [Resend](https://resend.com)
# Pizza-Palace
