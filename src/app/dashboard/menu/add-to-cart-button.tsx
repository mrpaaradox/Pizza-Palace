"use client";

import { useState, memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Check, Minus, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-context";

type PizzaSize = "SMALL" | "MEDIUM" | "LARGE" | "XLARGE";

const SIZES: { value: PizzaSize; label: string; priceMultiplier: number }[] = [
  { value: "SMALL", label: "Small", priceMultiplier: 0.8 },
  { value: "MEDIUM", label: "Medium", priceMultiplier: 1 },
  { value: "LARGE", label: "Large", priceMultiplier: 1.2 },
  { value: "XLARGE", label: "XL", priceMultiplier: 1.4 },
];

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  basePrice: number;
}

function AddToCartButton({
  productId,
  productName,
  basePrice,
}: AddToCartButtonProps) {
  const { addItem, setItems } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<PizzaSize>("MEDIUM");
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [added, setAdded] = useState(false);

  const currentSize = SIZES.find(s => s.value === selectedSize);
  const currentPrice = basePrice * (currentSize?.priceMultiplier || 1);

  const handleAddToCart = useCallback(async () => {
    const quantityToAdd = quantity;
    const tempId = `temp-${Date.now()}`;
    
    setAdded(true);
    toast.success(`Added ${quantityToAdd}x ${selectedSize} ${productName}!`, {
      description: `$${currentPrice.toFixed(2)}`,
      duration: 2000,
    });

    const tempItem = {
      id: tempId,
      quantity: quantityToAdd,
      size: selectedSize,
      product: {
        id: productId,
        name: productName,
        price: currentPrice,
        image: "",
      },
    };
    
    addItem(tempItem);
    setQuantity(1);
    setSelectedSize("MEDIUM");
    setShowSizeSelector(false);
    setTimeout(() => setAdded(false), 1500);

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity: quantityToAdd,
          size: selectedSize,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add to cart");
      }

      const res = await fetch("/api/cart");
      const cartData = await res.json();
      setItems(cartData);
    } catch (error) {
      toast.error("Failed to add to cart", {
        description: "Please try again.",
      });
    }
  }, [productId, productName, quantity, selectedSize, currentPrice, addItem, setItems]);

  const decreaseQuantity = useCallback(() => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  }, [quantity]);

  const increaseQuantity = useCallback(() => {
    if (quantity < 10) {
      setQuantity((q) => q + 1);
    }
  }, [quantity]);

  return (
    <div className="space-y-2 w-full">
      {/* Size Selector */}
      <div className="relative w-full">
        <button
          type="button"
          onClick={() => setShowSizeSelector(!showSizeSelector)}
          disabled={added}
          className="w-full flex items-center justify-between gap-2 bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50"
          style={{ minWidth: '120px' }}
        >
          <span className="text-gray-900">{currentSize?.label}</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showSizeSelector ? "rotate-180" : ""}`} />
        </button>
        
        {showSizeSelector && (
          <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border rounded-lg shadow-lg overflow-hidden z-10">
            {SIZES.map((size) => (
              <button
                key={size.value}
                type="button"
                onClick={() => {
                  setSelectedSize(size.value);
                  setShowSizeSelector(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  selectedSize === size.value ? "bg-red-50 text-red-600" : "text-gray-900"
                }`}
              >
                <span>{size.label}</span>
                <span className="text-gray-500">${(basePrice * size.priceMultiplier).toFixed(2)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quantity Selector */}
      <div className="flex items-center justify-center gap-1 bg-gray-50 rounded-lg p-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex-shrink-0 hover:bg-gray-200"
          onClick={decreaseQuantity}
          disabled={added || quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-8 flex-shrink-0 text-center font-semibold text-gray-900">
          {quantity}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex-shrink-0 hover:bg-gray-200"
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
          <>Add to Cart</>
        )}
      </Button>
    </div>
  );
}

export default memo(AddToCartButton);
