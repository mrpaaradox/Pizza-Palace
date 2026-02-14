"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function SystemStatusCard() {
  const { data: statusData, isLoading } = trpc.admin.getSystemStatus.useQuery();

  const getStatusColor = (count: number) => {
    if (count > 0) return "text-green-600";
    return "text-gray-600";
  };

  const statuses = statusData ? [
    { name: "Users", status: statusData.users > 0 ? "active" : "inactive", message: `${statusData.users} registered`, count: statusData.users },
    { name: "Orders", status: statusData.orders > 0 ? "active" : "inactive", message: `${statusData.orders} total orders`, count: statusData.orders },
    { name: "Products", status: statusData.products > 0 ? "active" : "inactive", message: `${statusData.products} products`, count: statusData.products },
    { name: "Categories", status: statusData.categories > 0 ? "active" : "inactive", message: `${statusData.categories} categories`, count: statusData.categories },
  ] : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-3">
            {statuses.map((item) => (
              <div key={item.name} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{item.name}</span>
                <div className="text-right">
                  <span className={`text-sm font-medium ${getStatusColor(item.count)}`}>
                    {item.status === "active" ? "Active" : "Inactive"}
                  </span>
                  <p className="text-xs text-gray-500">{item.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
