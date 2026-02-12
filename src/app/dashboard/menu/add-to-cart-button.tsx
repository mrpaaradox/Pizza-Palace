"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Check, Minus } from "lucide-react";
import { toast } from "sonner";

interface AddToCartButtonProps {
  productId: string;
  productName: string;
}

export default function AddToCartButton({ productId, productName }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    // Optimistic UI - show added immediately
    setAdded(true);
    toast.success(`Added ${quantity} to cart!`, {
      description: `${quantity}x ${productName}`,
      duration: 2000,
    });
    
    // Reset quantity after adding
    setQuantity(1);
    
    setTimeout(() => setAdded(false), 1500);

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity: quantity,
          size: "MEDIUM",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add to cart");
      }
    } catch (error) {
      toast.error("Failed to add to cart", {
        description: "Please try again.",
      });
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (quantity < 10) {
      setQuantity(quantity + 1);
    }
  };

  return (
    <div className="space-y-2">
      {/* Quantity Selector */}
      <div className="flex items-center justify-center gap-2 bg-gray-50 rounded-lg p-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-gray-200"
          onClick={decreaseQuantity}
          disabled={added || quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-8 text-center font-semibold text-gray-900">{quantity}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-gray-200"
          onClick={increaseQuantity}
          disabled={added || quantity >= 10}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        disabled={added}
        className={`w-full transition-all duration-200 ${
          added 
            ? "bg-green-500 hover:bg-green-600" 
            : "bg-red-500 hover:bg-red-600 active:scale-[0.98]"
        }`}
      >
        {added ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Added!
          </>
        ) : (
          <>
            <Plus className="w-4 h-4 mr-2" />
            Add to Cart
          </>
        )}
      </Button>
    </div>
  );
}
