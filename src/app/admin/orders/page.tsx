"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import ExportPDFButton from "../export-pdf-button";

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

const ORDERS_PER_PAGE = 10;
const statuses = ["PENDING", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

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

export default function AdminOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const utils = trpc.useUtils();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "ALL");
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  const { data: ordersData, isLoading } = trpc.admin.getOrders.useQuery();

  const updateOrderMutation = trpc.admin.updateOrderStatus.useMutation({
    onSuccess: () => {
      toast.success("Order status updated!");
      utils.admin.getOrders.invalidate();
    },
    onError: () => {
      toast.error("Failed to update order status");
    },
  });

  const orders = (ordersData || []) as any[];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (statusFilter !== "ALL") {
      result = result.filter(order => order.status === statusFilter);
    }

    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase();
      result = result.filter(order => 
        order.id.toLowerCase().includes(search) ||
        order.user.name?.toLowerCase().includes(search) ||
        order.user.email.toLowerCase().includes(search)
      );
    }

    return result;
  }, [orders, statusFilter, debouncedSearch]);

  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ORDERS_PER_PAGE;
    return filteredOrders.slice(start, start + ORDERS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, debouncedSearch]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (currentPage > 1) params.set("page", currentPage.toString());
    
    const queryString = params.toString();
    router.push(queryString ? `?${queryString}` : "/admin/orders", { scroll: false });
  }, [statusFilter, debouncedSearch, currentPage, router]);

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    updateOrderMutation.mutate({ orderId, status: newStatus as any });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatedSection>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-light text-white">Orders</h1>
            <p className="text-white/50 mt-1">Manage and track all orders</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <div className="text-sm text-white/40">
              Total: <span className="font-light text-[#D4AF37]">{filteredOrders.length}</span>
            </div>
            <ExportPDFButton orders={orders} />
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={1}>
        <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-white/30" />
                <Input
                  placeholder="Search by order ID, customer name or email..."
                  className="pl-10 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={(value: string) => setStatusFilter(value)}>
                <SelectTrigger className="w-full md:w-48 bg-[#1a1a1a] border-[#2a2a2a] text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                  <SelectItem value="ALL" className="text-white">All Status</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status} className="text-white">
                      {statusLabels[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </AnimatedSection>

      <div className="space-y-4">
        {paginatedOrders.length === 0 ? (
          <AnimatedSection delay={2}>
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
                <h3 className="text-lg font-light text-white mb-2">No orders found</h3>
                <p className="text-white/50">Try adjusting your filters</p>
              </CardContent>
            </Card>
          </AnimatedSection>
        ) : (
          paginatedOrders.map((order, index) => (
            <AnimatedSection key={order.id} delay={index * 0.1}>
              <Card className="bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#D4AF37]/30 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-light text-white">Order #{order.id.slice(-8).toUpperCase()}</CardTitle>
                        <Badge className={statusColors[order.status]}>
                          {statusLabels[order.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-white/40 mt-1">
                        {order.user.name || order.user.email} • {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={order.status}
                        onValueChange={(value: string) => handleStatusUpdate(order.id, value)}
                      >
                        <SelectTrigger className="w-40 bg-[#1a1a1a] border-[#2a2a2a] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                          {statuses.map((status) => (
                            <SelectItem key={status} value={status} className="text-white">
                              {statusLabels[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item: any) => (
                        <Badge key={item.id} variant="outline" className="text-sm border-[#2a2a2a] text-white/70">
                          {item.quantity}x {item.product.name} ({item.size})
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                      <div className="text-white/50">
                        <span>{order.address}, {order.city} {order.postalCode}</span>
                        {order.phone && <span> • {order.phone}</span>}
                      </div>
                      <div className="font-light text-xl text-[#D4AF37]">
                        ${Number(order.total).toFixed(2)}
                      </div>
                    </div>
                    {order.notes && (
                      <p className="text-sm text-white/40 italic">Note: {order.notes}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={currentPage === 1}
            className="border-[#2a2a2a] text-white/60 hover:bg-[#1a1a1a] hover:border-[#D4AF37]/30 hover:text-white"
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-white/40 font-light">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage === totalPages}
            className="border-[#2a2a2a] text-white/60 hover:bg-[#1a1a1a] hover:border-[#D4AF37]/30 hover:text-white"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
