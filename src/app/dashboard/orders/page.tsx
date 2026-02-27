"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Clock, MapPin, Phone, Loader2, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useOrderUpdates } from "@/lib/use-order-updates";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-600",
  CONFIRMED: "bg-blue-600",
  PREPARING: "bg-orange-600",
  OUT_FOR_DELIVERY: "bg-purple-600",
  DELIVERED: "bg-green-600",
  CANCELLED: "bg-red-600",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

function AnimatedSection({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const { lastUpdate, isConnected } = useOrderUpdates();

  const fetchOrders = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/orders?page=${page}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (lastUpdate?.orderId) {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === lastUpdate.orderId
            ? { ...order, status: lastUpdate.status }
            : order
        )
      );
    }
  }, [lastUpdate]);

  if (isLoading && orders.length === 0) {
    return (
      <div className="space-y-6">
        <AnimatedSection>
          <div>
            <h1 className="text-2xl md:text-3xl font-light text-white">My Orders</h1>
            <p className="text-white/50 mt-1">Track and manage your orders</p>
          </div>
        </AnimatedSection>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="space-y-6">
        <AnimatedSection>
          <div>
            <h1 className="text-2xl md:text-3xl font-light text-white">My Orders</h1>
            <p className="text-white/50 mt-1">Track and manage your orders</p>
          </div>
        </AnimatedSection>

        <AnimatedSection>
          <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="relative mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-2 border-dashed border-[#2a2a2a] rounded-full w-24 h-24"
                />
                <div className="relative w-20 h-20 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
                  <Package className="w-10 h-10 text-[#D4AF37]" />
                </div>
              </div>
              <h2 className="text-xl font-light text-white mb-2">No orders yet</h2>
              <p className="text-white/50 mb-6 text-center max-w-md">
                You haven't placed any orders yet. Browse our menu and place your first order!
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
    <div className="space-y-6">
      <AnimatedSection>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-light text-white">My Orders</h1>
            <p className="text-white/50 mt-1">Track and manage your orders</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-500"}`} />
            <span className="text-xs text-white/40">{isConnected ? "Live" : "Connecting..."}</span>
          </div>
        </div>
      </AnimatedSection>

      <div className="space-y-4">
        {orders.map((order: any, index: number) => (
          <AnimatedSection key={order.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`bg-[#1a1a1a] border-[#2a2a2a] ${lastUpdate?.orderId === order.id ? "border-[#D4AF37]" : ""} hover:border-[#D4AF37]/30 transition-colors`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-light text-white">Order #{order.id.slice(-8).toUpperCase()}</CardTitle>
                      <p className="text-sm text-white/40 mt-1">
                        {new Date(order.createdAt).toLocaleDateString()} at{" "}
                        {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                      </p>
                    </div>
                    <Badge className={`${statusColors[order.status]} text-white`}>
                      {statusLabels[order.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-white/70">
                          {item.quantity}x {item.product?.name || "Unknown"} ({item.size?.toLowerCase()})
                        </span>
                        <span className="font-light text-white">
                          ${(Number(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[#2a2a2a] pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-light text-white">Total</span>
                      <span className="text-xl font-light text-[#D4AF37]">
                        ${Number(order.total).toFixed(2)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-white/50">
                        <MapPin className="w-4 h-4 text-[#D4AF37]" />
                        <span className="truncate font-light">{order.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/50">
                        <Phone className="w-4 h-4 text-[#D4AF37]" />
                        <span className="font-light">{order.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/50">
                        <Clock className="w-4 h-4 text-[#D4AF37]" />
                        <span className="font-light">
                          {order.estimatedDelivery
                            ? `Est: ${new Date(order.estimatedDelivery).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
                            : "Delivery time TBD"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatedSection>
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchOrders(pagination.page - 1)}
            disabled={pagination.page === 1 || isLoading}
            className="border-[#2a2a2a] text-white/60 hover:bg-[#1a1a1a] hover:border-[#D4AF37]/30 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-white/40 font-light">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchOrders(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages || isLoading}
            className="border-[#2a2a2a] text-white/60 hover:bg-[#1a1a1a] hover:border-[#D4AF37]/30 hover:text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
