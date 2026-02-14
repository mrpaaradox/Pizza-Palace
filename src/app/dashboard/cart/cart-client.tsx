"use client";

import { useState, useMemo, useCallback, memo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Pizza, ArrowRight, Check, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import UpdateCartItem from "./update-cart-item";
import RemoveCartItem from "./remove-cart-item";
import { useCart } from "@/lib/cart-context";

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
  discountAmount: number;
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

const CartItem = memo(function CartItem({ item }: CartItemProps) {
  const sizeKey = item.size as PizzaSize;
  const multiplier = SIZE_MULTIPLIERS[sizeKey] || 1;
  const itemPrice = Number(item.product.price) * multiplier;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
            {item.product.image ? (
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${item.product.image})` }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-red-50">
                <Pizza className="w-8 h-8 text-red-200" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                <p className="text-sm text-gray-500 capitalize">Size: {item.size.toLowerCase()}</p>
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
                <p className="text-lg font-bold text-red-500">
                  ${(itemPrice * item.quantity).toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
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

  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid coupon");
      }

      setAppliedCoupon(data);
      toast.success(`Coupon applied: ${data.code}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to apply coupon");
    } finally {
      setIsApplyingCoupon(false);
    }
  }, [couponCode, subtotal]);

  const handleRemoveCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCouponCode("");
  }, []);

  const canUseCOD = total >= 10;

  const handleCheckout = useCallback(async () => {
    if (paymentMethod === "CASH_ON_DELIVERY" && total < 10) {
      toast.error("Minimum order of $10 required for Cash on Delivery");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          couponId: appliedCoupon?.id || null,
          paymentMethod,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.code === "INCOMPLETE_ADDRESS") {
          toast.error("Please complete your delivery information", {
            description: "Redirecting to profile...",
          });
          router.push("/dashboard/profile");
          return;
        }
        if (errorData.code === "COD_MINIMUM") {
          toast.error("Minimum order of $10 required for Cash on Delivery");
          return;
        }
        throw new Error(errorData.error || "Failed to create order");
      }

      const orderData = await response.json();
      
      clearCart();
      toast.success("Order placed successfully! Pay on delivery.");
      router.push("/dashboard/orders");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to place order");
    } finally {
      setIsProcessing(false);
    }
  }, [paymentMethod, total, appliedCoupon, clearCart, router]);

  if (cartItems.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-1">Review your items before checkout</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              Looks like you haven&apos;t added any items to your cart yet. Browse our menu to find something delicious!
            </p>
            <Link href="/dashboard/menu">
              <Button className="bg-red-500 hover:bg-red-600">
                Browse Menu
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Full Screen Free Delivery Flash */}
      {freeDeliveryState !== "hidden" && (
        <div className={`fixed inset-0 bg-green-500/20 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-none ${
          freeDeliveryState === "showing" ? "animate-in fade-in duration-300" : "animate-out fade-out duration-500"
        }`}>
          <div className={`bg-white rounded-2xl shadow-2xl px-8 py-6 ${
            freeDeliveryState === "showing" ? "animate-in zoom-in duration-300" : "animate-out zoom-out duration-500"
          }`}>
            <div className="text-center">
              <div className="text-4xl mb-2">🎉</div>
              <div className="text-2xl font-bold text-green-600">Free Delivery!</div>
              <div className="text-gray-500 mt-1">You've unlocked free delivery</div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <p className="text-gray-600 mt-1">Review your items before checkout</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Apply Coupon</Label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-green-700">{appliedCoupon.code}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-gray-500 hover:text-red-500"
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
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon || !couponCode.trim()}
                      variant="outline"
                    >
                      {isApplyingCoupon ? "..." : "Apply"}
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Fee</span>
                <span className={`font-medium transition-all duration-300 ${isFreeDelivery ? "text-green-600 font-bold" : ""}`}>
                  {deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}
                </span>
              </div>

              {!isFreeDelivery && subtotal > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 text-center">
                  <span className="text-orange-700 text-xs">
                    Add ${(25 - subtotal).toFixed(2)} more for free delivery
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold text-lg">Total</span>
                <span className="font-bold text-xl text-red-500">
                  ${total.toFixed(2)}
                </span>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Payment Method</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH_ON_DELIVERY">
                      Cash on Delivery {!canUseCOD && '(min $10)'}
                    </SelectItem>
                  </SelectContent>
                </Select>
                {!canUseCOD && (
                  <p className="text-xs text-orange-500">
                    Minimum order of $10 required for COD
                  </p>
                )}
              </div>

              <Button
                type="button"
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full bg-red-500 hover:bg-red-600 mt-4"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
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
                <Button variant="outline" className="w-full mt-2">
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
