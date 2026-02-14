"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/cart-context";

interface UpdateCartItemProps {
  itemId: string;
  currentQuantity: number;
}

export default function UpdateCartItem({ itemId, currentQuantity }: UpdateCartItemProps) {
  const { updateItemQuantity } = useCart();
  const [quantity, setQuantity] = useState(currentQuantity);

  useEffect(() => {
    setQuantity(currentQuantity);
  }, [currentQuantity]);

  const updateQuantity = useCallback((newQuantity: number) => {
    if (newQuantity < 1 || newQuantity === quantity) return;
    setQuantity(newQuantity);
    updateItemQuantity(itemId, newQuantity);
  }, [itemId, quantity, updateItemQuantity]);

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 hover:bg-gray-200 transition-colors"
        onClick={() => updateQuantity(quantity - 1)}
        disabled={quantity <= 1}
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>
      <span className="w-7 text-center text-sm font-semibold">{quantity}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 hover:bg-gray-200 transition-colors"
        onClick={() => updateQuantity(quantity + 1)}
        disabled={quantity >= 10}
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
