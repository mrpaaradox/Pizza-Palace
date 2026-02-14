"use client";

import { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from "react";
import { trpc } from "@/lib/trpc";

interface CartItem {
  id: string;
  quantity: number;
  size: string;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
  userId?: string;
  productId?: string;
}

interface CartContextType {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const { data: cartData, isLoading } = trpc.cart.get.useQuery(undefined, {
    retry: false,
    staleTime: 0,
  });

  useEffect(() => {
    if (!isLoading && cartData) {
      const normalizedItems = cartData.map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        size: item.size,
        product: {
          id: item.product.id,
          name: item.product.name,
          price: Number(item.product.price),
          image: item.product.image,
        },
      }));
      setItems(normalizedItems);
      setInitialLoadDone(true);
    } else if (!isLoading && !cartData) {
      setInitialLoadDone(true);
    }
  }, [cartData, isLoading]);

  const addItemMutation = trpc.cart.add.useMutation({
    onSuccess: (data: any) => {
      setItems((prev) => {
        const normalizedNewItem = {
          id: data.id,
          quantity: data.quantity,
          size: data.size,
          product: {
            id: data.product.id,
            name: data.product.name,
            price: Number(data.product.price),
            image: data.product.image,
          },
        };
        const existingIndex = prev.findIndex(
          (i) => i.product.id === normalizedNewItem.product.id && i.size === normalizedNewItem.size
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + normalizedNewItem.quantity,
          };
          return updated;
        }
        return [...prev, normalizedNewItem];
      });
    },
  });

  const removeItemMutation = trpc.cart.remove.useMutation({
    onSuccess: () => {
      setItems((prev) => prev.filter((i) => i.id !== removeItemMutation.variables?.itemId));
    },
  });

  const updateItemMutation = trpc.cart.update.useMutation();

  const addItem = useCallback((newItem: CartItem) => {
    addItemMutation.mutate({
      productId: newItem.product.id,
      quantity: newItem.quantity,
      size: newItem.size as "SMALL" | "MEDIUM" | "LARGE" | "XLARGE",
    });
  }, [addItemMutation]);

  const removeItem = useCallback((itemId: string) => {
    removeItemMutation.mutate({ itemId });
  }, [removeItemMutation]);

  const updateItemQuantity = useCallback((itemId: string, quantity: number) => {
    updateItemMutation.mutate({ itemId, quantity });
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
    );
  }, [updateItemMutation]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo(
    () => ({
      items,
      setItems,
      addItem,
      removeItem,
      updateItemQuantity,
      clearCart,
    }),
    [items, addItem, removeItem, updateItemQuantity, clearCart]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
