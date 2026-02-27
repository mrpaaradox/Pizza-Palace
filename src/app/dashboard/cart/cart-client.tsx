"use client";

import { useState, useMemo, useCallback, memo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Pizza, ArrowRight, Check, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import UpdateCartItem from "./update-cart-item";
import RemoveCartItem from "./remove-cart-item";
import { useCart } from "@/lib/cart-context";
import { trpc } from "@/lib/trpc";

type PizzaSize = "SMALL" | "MEDIUM" | "LARGE" | "XLARGE";

const SIZE_MULTIPLIERS: Record<PizzaSize, number> = {
  SMALL: 0.8,
  MEDIUM: 1,
  LARGE: 1.2,
  XLARGE: 1.4,
};

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  discountAmount: string | number;
}

interface CartItemProps {
  item: {
    id: string;
    quantity: number;
    size: string;
    product: {
      id: string;
      name: string;
      price: number;
      image: string;
    };
  };
}

function AnimatedSection({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const CartItem = memo(function CartItem({ item }: CartItemProps) {
  const sizeKey = item.size as PizzaSize;
  const multiplier = SIZE_MULTIPLIERS[sizeKey] || 1;
  const itemPrice = Number(item.product.price) * multiplier;

  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#D4AF37]/30 transition-colors">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="w-24 h-24 bg-[#2a2a2a] rounded-lg flex-shrink-0 overflow-hidden relative">
              {item.product.image ? (
                <Image
                  src={item.product.image}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a]">
                  <Pizza className="w-8 h-8 text-[#2a2a2a]" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-light text-white text-lg">{item.product.name}</h3>
                  <p className="text-sm text-white/40 capitalize">Size: {item.size.toLowerCase()}</p>
                </div>
              </div>
              <div className="flex justify-between items-end mt-4">
                <div className="flex items-center gap-2">
                  <UpdateCartItem 
                    itemId={item.id} 
                    currentQuantity={item.quantity}
                  />
                  <RemoveCartItem 
                    itemId={item.id}
                  />
                </div>
                <div className="text-right">
                  <p className="text-lg font-light text-[#D4AF37]">
                    ${(itemPrice * item.quantity).toFixed(2)}
                  </p>
                  <p className="text-sm text-white/40">
                    ${itemPrice.toFixed(2)} each
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
  );
});

export default function CartPageClient() {
  const router = useRouter();
  const { items: cartItems, clearCart } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH_ON_DELIVERY");
  const [isProcessing, setIsProcessing] = useState(false);
  const [freeDeliveryState, setFreeDeliveryState] = useState<"hidden" | "showing" | "hiding">("hidden");

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cartItems]
  );

  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === "PERCENTAGE") {
      return (subtotal * appliedCoupon.discountValue) / 100;
    }
    return appliedCoupon.discountValue;
  }, [appliedCoupon, subtotal]);

  const discountedSubtotal = subtotal - discount;
  const deliveryFee = discountedSubtotal >= 25 ? 0 : 5;
  const isFreeDelivery = deliveryFee === 0 && subtotal > 0;
  const tax = discountedSubtotal * 0.08;
  const total = discountedSubtotal + deliveryFee + tax;

  useEffect(() => {
    const hasShown = localStorage.getItem("freeDeliveryShown");
    if (!isFreeDelivery || subtotal <= 0 || hasShown === "true") return;

    setFreeDeliveryState("showing");
    localStorage.setItem("freeDeliveryShown", "true");
    
    const hideTimer = setTimeout(() => {
      setFreeDeliveryState("hiding");
    }, 2500);
    
    const resetTimer = setTimeout(() => {
      setFreeDeliveryState("hidden");
    }, 3000);
    
    return () => {
      clearTimeout(hideTimer);
      clearTimeout(resetTimer);
    };
  }, [isFreeDelivery, subtotal]);

  const utils = trpc.useUtils();
  const validateCouponMutation = trpc.coupons.validate.useMutation();

  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    try {
      const data = await validateCouponMutation.mutateAsync({
        code: couponCode,
        subtotal,
      });

      setAppliedCoupon(data);
      toast.success(`Coupon applied: ${data.code}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to apply coupon");
    } finally {
      setIsApplyingCoupon(false);
    }
  }, [couponCode, subtotal, validateCouponMutation]);

  const handleRemoveCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCouponCode("");
  }, []);

  const createOrderMutation = trpc.orders.create.useMutation();

  const canUseCOD = total >= 10;

  const handleCheckout = useCallback(async () => {
    if (paymentMethod === "CASH_ON_DELIVERY" && total < 10) {
      toast.error("Minimum order of $10 required for Cash on Delivery");
      return;
    }

    setIsProcessing(true);
    try {
      const orderData = await createOrderMutation.mutateAsync({
        couponId: appliedCoupon?.id || undefined,
        paymentMethod: paymentMethod as "ONLINE" | "CASH_ON_DELIVERY",
      });
      
      clearCart();
      utils.cart.get.invalidate();
      toast.success("Order placed successfully! Pay on delivery.");
      router.push("/dashboard/orders");
      router.refresh();
    } catch (error: any) {
      if (error.message?.includes("delivery information")) {
        toast.error("Please complete your delivery information", {
          description: "Redirecting to profile...",
        });
        router.push("/dashboard/profile");
        return;
      }
      if (error.message?.includes("$10")) {
        toast.error("Minimum order of $10 required for Cash on Delivery");
        return;
      }
      toast.error(error.message || "Failed to place order");
    } finally {
      setIsProcessing(false);
    }
  }, [paymentMethod, total, appliedCoupon, clearCart, router, createOrderMutation, utils]);

  if (cartItems.length === 0) {
    return (
      <div className="space-y-6">
        <AnimatedSection>
          <div>
            <h1 className="text-2xl md:text-3xl font-light text-white">Shopping Cart</h1>
            <p className="text-white/50 mt-1">Review your items before checkout</p>
          </div>
        </AnimatedSection>
        <AnimatedSection delay={1}>
          <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="relative mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-2 border-dashed border-[#2a2a2a] rounded-full w-24 h-24"
                />
                <div className="relative w-20 h-20 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
                  <ShoppingCart className="w-10 h-10 text-[#D4AF37]" />
                </div>
              </div>
              <h2 className="text-xl font-light text-white mb-2">Your cart is empty</h2>
              <p className="text-white/50 mb-6 text-center max-w-md">
                Looks like you haven&apos;t added any items to your cart yet. Browse our menu to find something delicious!
              </p>
              <Link href="/dashboard/menu">
                <Button className="bg-[#D4AF37] hover:bg-[#c9a227] text-black font-medium">
                  Browse Menu
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {freeDeliveryState !== "hidden" && (
        <div className={`fixed inset-0 bg-[#D4AF37]/20 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-none ${
          freeDeliveryState === "showing" ? "animate-in fade-in duration-300" : "animate-out fade-out duration-500"
        }`}>
          <div className={`bg-[#1a1a1a] rounded-2xl shadow-2xl px-8 py-6 border border-[#D4AF37]/30 ${
            freeDeliveryState === "showing" ? "animate-in zoom-in duration-300" : "animate-out zoom-out duration-500"
          }`}>
            <div className="text-center">
              <div className="text-4xl mb-2">🎉</div>
              <div className="text-2xl font-light text-[#D4AF37]">Free Delivery!</div>
              <div className="text-white/50 mt-1">You&apos;ve unlocked free delivery</div>
            </div>
          </div>
        </div>
      )}

      <AnimatedSection>
        <div>
          <h1 className="text-2xl md:text-3xl font-light text-white">Shopping Cart</h1>
          <p className="text-white/50 mt-1">Review your items before checkout</p>
        </div>
      </AnimatedSection>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        <div>
          <Card className="sticky top-6 bg-[#1a1a1a] border-[#2a2a2a]">
            <CardHeader>
              <CardTitle className="text-white font-light">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/70">Apply Coupon</Label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-[#D4AF37]/10 rounded-lg border border-[#D4AF37]/30">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#D4AF37]" />
                      <span className="font-light text-[#D4AF37]">{appliedCoupon.code}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-white/40 hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37]"
                    />
                    <Button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon || !couponCode.trim()}
                      variant="outline"
                      className="border-[#2a2a2a] text-white/60 hover:bg-[#1a1a1a] hover:border-[#D4AF37]/30 hover:text-white"
                    >
                      {isApplyingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                    </Button>
                  </div>
                )}
              </div>

              <Separator className="bg-[#2a2a2a]" />

              <div className="flex justify-between text-sm">
                <span className="text-white/50 font-light">Subtotal</span>
                <span className="font-light text-white">${subtotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-400">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-white/50 font-light">Delivery Fee</span>
                <span className={`font-light transition-all duration-300 ${isFreeDelivery ? "text-[#D4AF37] font-medium" : "text-white"}`}>
                  {deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}
                </span>
              </div>

              {!isFreeDelivery && subtotal > 0 && (
                <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg p-2 text-center">
                  <span className="text-[#D4AF37] text-xs font-light">
                    Add ${(25 - subtotal).toFixed(2)} more for free delivery
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-white/50 font-light">Tax</span>
                <span className="font-light text-white">${tax.toFixed(2)}</span>
              </div>
              <Separator className="bg-[#2a2a2a]" />
              <div className="flex justify-between">
                <span className="font-light text-lg text-white">Total</span>
                <span className="text-xl font-light text-[#D4AF37]">
                  ${total.toFixed(2)}
                </span>
              </div>

              <Separator className="bg-[#2a2a2a]" />

              <div className="space-y-3 overflow-hidden">
                <Label className="text-white/70 font-light">Payment Method</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                >
                  <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white overflow-hidden">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a] overflow-hidden" position="popper" sideOffset={4}>
                    <SelectItem value="CASH_ON_DELIVERY" className="text-white">
                      Cash on Delivery {!canUseCOD && '(min $10)'}
                    </SelectItem>
                  </SelectContent>
                </Select>
                {!canUseCOD && (
                  <p className="text-xs text-[#D4AF37]">
                    Minimum order of $10 required for COD
                  </p>
                )}
              </div>

              <Button
                type="button"
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full bg-[#D4AF37] hover:bg-[#c9a227] text-black font-medium mt-4"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              <Link href="/dashboard/menu">
                <Button variant="outline" className="w-full mt-2 border-[#2a2a2a] text-white/60 hover:bg-[#1a1a1a] hover:border-[#D4AF37]/30 hover:text-white font-light">
                  Continue Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
