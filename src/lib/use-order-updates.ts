"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import Pusher from "pusher-js";
import { NEXT_PUBLIC_PUSHER_KEY, NEXT_PUBLIC_PUSHER_CLUSTER, PUSHER_CHANNEL, PUSHER_EVENT } from "./pusher";

interface OrderUpdate {
  orderId: string;
  status: string;
  userId?: string;
  timestamp: number;
}

export function useOrderUpdates() {
  const [lastUpdate, setLastUpdate] = useState<OrderUpdate | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const pusherRef = useRef<Pusher | null>(null);

  useEffect(() => {
    if (!pusherRef.current) {
      pusherRef.current = new Pusher(NEXT_PUBLIC_PUSHER_KEY, {
        cluster: NEXT_PUBLIC_PUSHER_CLUSTER,
      });
    }

    const pusher = pusherRef.current;
    
    const channel = pusher.subscribe(PUSHER_CHANNEL);

    channel.bind(PUSHER_EVENT, (data: OrderUpdate) => {
      setLastUpdate({ ...data });

      if (data.status) {
        const statusMessages: Record<string, string> = {
          PENDING: "Order is pending",
          CONFIRMED: "Order has been confirmed!",
          PREPARING: "Your order is being prepared",
          OUT_FOR_DELIVERY: "Order is out for delivery!",
          DELIVERED: "Order has been delivered!",
          CANCELLED: "Order has been cancelled",
        };

        toast.info(statusMessages[data.status] || `Order status: ${data.status}`, {
          duration: 5000,
        });
      }
    });

    channel.bind("pusher:subscription_succeeded", () => {
      setIsConnected(true);
    });

    channel.bind("pusher:error", () => {
      setIsConnected(false);
    });

    setIsConnected(true);
  }, []);

  return { lastUpdate, isConnected };
}
