"use client";

import { useState, memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Check, Minus, ChevronDown, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-context";
import { motion, AnimatePresence } from "motion/react";

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
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<PizzaSize>("MEDIUM");
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [added, setAdded] = useState(false);

  const currentSize = SIZES.find(s => s.value === selectedSize);
  const currentPrice = basePrice * (currentSize?.priceMultiplier || 1);

  const handleAddToCart = useCallback(() => {
    const quantityToAdd = quantity;
    
    setAdded(true);
    toast.success(`Added ${quantityToAdd}x ${currentSize?.label} ${productName}!`, {
      description: `$${currentPrice.toFixed(2)}`,
      duration: 2000,
    });

    const tempItem = {
      id: `temp-${Date.now()}`,
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
  }, [productId, productName, quantity, selectedSize, currentPrice, addItem, currentSize?.label]);

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
    <div className="space-y-3 w-full">
      <div className="flex items-center justify-between gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSizeSelector(!showSizeSelector)}
            disabled={added}
            className="flex items-center justify-between gap-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-sm font-light transition-all disabled:opacity-50 hover:border-[#D4AF37]/30"
          >
            <span className="text-white">{currentSize?.label}</span>
            <span className="text-[#D4AF37] ml-2">${(basePrice * currentSize!.priceMultiplier).toFixed(2)}</span>
            <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${showSizeSelector ? "rotate-180" : ""}`} />
          </button>
          
          <AnimatePresence>
            {showSizeSelector && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-0 right-0 mb-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl overflow-hidden z-20"
              >
                {SIZES.map((size) => (
                  <button
                    key={size.value}
                    type="button"
                    onClick={() => {
                      setSelectedSize(size.value);
                      setShowSizeSelector(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-[#2a2a2a] transition-colors ${
                      selectedSize === size.value ? "bg-[#D4AF37]/10 text-[#D4AF37]" : "text-white"
                    }`}
                  >
                    <span>{size.label}</span>
                    <span className="text-white/50">${(basePrice * size.priceMultiplier).toFixed(2)}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 flex-shrink-0 text-white/60 hover:text-white hover:bg-[#2a2a2a]"
            onClick={decreaseQuantity}
            disabled={added || quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-10 flex-shrink-0 text-center font-light text-white">
            {quantity}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 flex-shrink-0 text-white/60 hover:text-white hover:bg-[#2a2a2a]"
            onClick={increaseQuantity}
            disabled={added || quantity >= 10}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-lg font-light text-white">
          Total: <span className="text-[#D4AF37]">${(currentPrice * quantity).toFixed(2)}</span>
        </span>
        
        <Button
          onClick={handleAddToCart}
          disabled={added}
          size="sm"
          className={`transition-all duration-200 ${
            added
              ? "bg-green-600 hover:bg-green-600 text-white"
              : "bg-[#D4AF37] hover:bg-[#c9a227] text-black font-medium"
          }`}
        >
          {added ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Added!
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default memo(AddToCartButton);
