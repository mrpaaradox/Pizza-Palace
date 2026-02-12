// Database configuration types
export interface DatabaseConfig {
  url: string;
  logging: boolean;
  maxConnections?: number;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Order status type
export type OrderStatus = "PENDING" | "CONFIRMED" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";

// Pizza size type
export type PizzaSize = "SMALL" | "MEDIUM" | "LARGE" | "XLARGE";

// Cart item with product details
export interface CartItemWithProduct {
  id: string;
  quantity: number;
  size: PizzaSize;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
}

// Order with items and user
export interface OrderWithDetails {
  id: string;
  status: OrderStatus;
  total: number;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  notes: string | null;
  estimatedDelivery: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    size: PizzaSize;
    product: {
      id: string;
      name: string;
    };
  }>;
}

// Product with category
export interface ProductWithCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
  isFeatured: boolean;
  prepTime: number | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}
