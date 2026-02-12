"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface SystemStatus {
  name: string;
  status: string;
  message: string;
}

export default function SystemStatusCard() {
  const [statuses, setStatuses] = useState<SystemStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSystemStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/system-status");
      if (response.ok) {
        const data = await response.json();
        setStatuses(data);
      }
    } catch (error) {
      console.error("Failed to fetch system status:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSystemStatus();
  }, [fetchSystemStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600";
      case "inactive":
        return "text-yellow-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

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
                  <span className={`text-sm font-medium ${getStatusColor(item.status)}`}>
                    {item.status === "active" ? "Active" : item.status === "inactive" ? "Inactive" : "Error"}
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
