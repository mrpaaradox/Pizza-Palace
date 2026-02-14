"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/lib/cart-context";

interface CheckoutButtonProps {
  itemCount: number;
}

export default function CheckoutButton({ itemCount }: CheckoutButtonProps) {
  const router = useRouter();
  const { clearCart } = useCart();
  const utils = trpc.useUtils();
  const [isLoading, setIsLoading] = useState(false);
  
  const createOrderMutation = trpc.orders.create.useMutation();

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      await createOrderMutation.mutateAsync({
        paymentMethod: "CASH_ON_DELIVERY",
      });
      
      clearCart();
      utils.cart.get.invalidate();
      toast.success("Order placed successfully!", {
        description: "You can track your order in the orders page.",
      });
      
      router.push("/dashboard/orders");
      router.refresh();
    } catch (error: any) {
      if (error.message?.includes("complete delivery information") || error.message?.includes("delivery")) {
        toast.error("Please complete your delivery information", {
          description: "Redirecting to profile...",
        });
        router.push("/dashboard/profile");
        return;
      }
      toast.error("Failed to place order", {
        description: error.message || "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={isLoading || itemCount === 0}
      className="w-full bg-red-500 hover:bg-red-600 mt-4"
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          Proceed to Checkout
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}
