"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

interface OrderUpdate {
  orderId: string;
  status: string;
  userId?: string;
  timestamp: number;
}

export function useOrderUpdates() {
  const [lastUpdate, setLastUpdate] = useState<OrderUpdate | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    console.log("[SSE] Connecting to order updates...");
    
    const eventSource = new EventSource("/api/orders/stream");

    eventSource.onopen = () => {
      console.log("[SSE] Connected to order updates");
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("[SSE] Received:", data);
        
        if (data.type === "connected") {
          console.log("[SSE] Connection confirmed");
          return;
        }

        setLastUpdate(data);

        // Show toast notification for status updates
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
      } catch (error) {
        console.error("[SSE] Failed to parse message:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("[SSE] Error:", error);
      setIsConnected(false);
      eventSource.close();
      // Reconnect after 5 seconds
      setTimeout(connect, 5000);
    };

    return () => {
      console.log("[SSE] Closing connection");
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);

  return { lastUpdate, isConnected };
}
