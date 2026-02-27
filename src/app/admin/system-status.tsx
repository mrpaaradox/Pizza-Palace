"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function SystemStatusCard() {
  const { data: statusData, isLoading } = trpc.admin.getSystemStatus.useQuery();

  const getStatusColor = (count: number) => {
    if (count > 0) return "text-[#D4AF37]";
    return "text-white/30";
  };

  const statuses = statusData ? [
    { name: "Users", status: statusData.users > 0 ? "active" : "inactive", message: `${statusData.users} registered`, count: statusData.users },
    { name: "Orders", status: statusData.orders > 0 ? "active" : "inactive", message: `${statusData.orders} total orders`, count: statusData.orders },
    { name: "Products", status: statusData.products > 0 ? "active" : "inactive", message: `${statusData.products} products`, count: statusData.products },
    { name: "Categories", status: statusData.categories > 0 ? "active" : "inactive", message: `${statusData.categories} categories`, count: statusData.categories },
  ] : [];

  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
      <CardHeader>
        <CardTitle className="text-white font-light">System Status</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-[#D4AF37]" />
          </div>
        ) : (
          <div className="space-y-3">
            {statuses.map((item) => (
              <div key={item.name} className="flex justify-between items-center">
                <span className="text-sm text-white/50 font-light">{item.name}</span>
                <div className="text-right">
                  <span className={`text-sm font-light ${getStatusColor(item.count)}`}>
                    {item.status === "active" ? "Active" : "Inactive"}
                  </span>
                  <p className="text-xs text-white/30">{item.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
