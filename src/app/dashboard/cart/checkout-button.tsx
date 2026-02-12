"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CheckoutButtonProps {
  itemCount: number;
}

export default function CheckoutButton({ itemCount }: CheckoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || "Failed to create order";
        const errorCode = errorData.code;
        
        if (errorCode === "INCOMPLETE_ADDRESS") {
          toast.error("Please complete your delivery information", {
            description: "Redirecting to profile...",
          });
          router.push("/dashboard/profile");
          setIsLoading(false);
          return;
        }
        
        throw new Error(errorMessage);
      }

      const order = await response.json();
      
      toast.success("Order placed successfully!", {
        description: "You can track your order in the orders page.",
      });
      
      router.push("/dashboard/orders");
      router.refresh();
    } catch (error: any) {
      if (error.message?.includes("complete delivery information") || error.message?.includes("INCOMPLETE_ADDRESS")) {
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
