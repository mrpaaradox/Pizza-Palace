import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, DollarSign, TrendingUp } from "lucide-react";
import Link from "next/link";
import AdminCharts from "./admin-charts";
import SystemStatusCard from "./system-status";
import DashboardExportButton from "./dashboard-export-button";

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6", "#3b82f6", "#8b5cf6", "#ec4899", "#6366f1", "#84cc16"];

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch stats
  const [
    totalOrders,
    totalCustomers,
    recentOrders,
    pendingOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        items: true,
      },
    }),
    prisma.order.count({ where: { status: "PENDING" } }),
  ]);

  // Fetch all orders for the table
  const allOrdersRaw = await prisma.order.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  // Calculate trending products
  const productStats: Record<string, { name: string; quantity: number }> = {};
  allOrdersRaw.forEach((order: any) => {
    order.items.forEach((item: any) => {
      const productName = item.product?.name || "Unknown";
      if (!productStats[productName]) {
        productStats[productName] = { name: productName, quantity: 0 };
      }
      productStats[productName].quantity += item.quantity;
    });
  });

  const trendingProducts = Object.values(productStats)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10)
    .map((product, index) => ({
      ...product,
      fill: COLORS[index % COLORS.length],
    }));

  // Convert Decimal to numbers and serialize for client component
  const allOrders = JSON.parse(JSON.stringify(allOrdersRaw));

  // Calculate total revenue
  const revenue = await prisma.order.aggregate({
    _sum: {
      total: true,
    },
    where: {
      status: {
        not: "CANCELLED",
      },
    },
  });

  // Fetch orders for the last 7 days for charts
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const ordersLast7Days = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
    select: {
      createdAt: true,
      total: true,
      status: true,
    },
  });

  // Process data for charts
  const ordersByDay: { date: string; orders: number; revenue: number }[] = [];
  const revenueByDay: { date: string; revenue: number }[] = [];
  const ordersByStatus: { name: string; value: number }[] = [];

  // Initialize last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    ordersByDay.push({ date: dateStr, orders: 0, revenue: 0 });
    revenueByDay.push({ date: dateStr, revenue: 0 });
  }

  // Aggregate orders by day
  ordersLast7Days.forEach((order) => {
    const orderDate = new Date(order.createdAt);
    const dayIndex = 6 - Math.floor((new Date().getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
    if (dayIndex >= 0 && dayIndex < 7) {
      ordersByDay[dayIndex].orders += 1;
      ordersByDay[dayIndex].revenue += Number(order.total);
      revenueByDay[dayIndex].revenue += Number(order.total);
    }
  });

  // Count orders by status
  const statusCounts = await prisma.order.groupBy({
    by: ["status"],
    _count: true,
  });

  const statusLabels: Record<string, string> = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    PREPARING: "Preparing",
    OUT_FOR_DELIVERY: "Out for Delivery",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  };

  statusCounts.forEach((status) => {
    ordersByStatus.push({
      name: statusLabels[status.status] || status.status,
      value: status._count,
    });
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your pizza business</p>
        </div>
        <DashboardExportButton 
          orders={allOrders} 
          totalOrders={totalOrders}
          totalCustomers={totalCustomers}
          totalRevenue={Number(revenue._sum.total || 0)}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Orders"
          value={totalOrders.toString()}
          icon={<Package className="w-6 h-6 text-blue-500" />}
          href="/admin/orders"
        />
        <StatCard
          title="Total Customers"
          value={totalCustomers.toString()}
          icon={<Users className="w-6 h-6 text-green-500" />}
          href="/admin/customers"
        />
        <StatCard
          title="Total Revenue"
          value={`$${Number(revenue._sum.total || 0).toFixed(2)}`}
          icon={<DollarSign className="w-6 h-6 text-red-500" />}
          href="/admin/orders"
        />
        <StatCard
          title="Pending Orders"
          value={pendingOrders.toString()}
          icon={<TrendingUp className="w-6 h-6 text-orange-500" />}
          href="/admin/orders?status=PENDING"
        />
      </div>

      {/* Charts */}
      <AdminCharts
        ordersByDay={ordersByDay}
        ordersByStatus={ordersByStatus}
        revenueByDay={revenueByDay}
        trendingProducts={trendingProducts}
      />

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Orders</CardTitle>
            <Link href="/admin/orders" className="text-sm text-red-500 hover:text-red-600">
              View details →
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Order ID</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Customer</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Items</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Total</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {allOrders.map((order: any) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2 text-sm">#{order.id.slice(-8).toUpperCase()}</td>
                    <td className="py-3 px-2 text-sm">
                      <div>
                        <p className="font-medium">{order.user?.name || "N/A"}</p>
                        <p className="text-gray-500 text-xs">{order.user?.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm">{order.items?.length || 0} items</td>
                    <td className="py-3 px-2 text-sm font-medium text-red-500">${Number(order.total).toFixed(2)}</td>
                    <td className="py-3 px-2 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === "DELIVERED" ? "bg-green-100 text-green-800" :
                        order.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                        order.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                        "bg-blue-100 text-blue-800"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Orders</CardTitle>
            <Link href="/admin/orders" className="text-sm text-red-500 hover:text-red-600">
              View all →
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">Order #{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-gray-500">
                      {order.user.name || order.user.email} • {order.items.length} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-500">
                      ${Number(order.total).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/admin/orders?status=PENDING"
              className="block p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
            >
              View Pending Orders ({pendingOrders})
            </Link>
            <Link
              href="/dashboard/menu"
              className="block p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              View Menu
            </Link>
          </CardContent>
        </Card>

        <SystemStatusCard />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  href,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{title}</p>
              <p className="text-2xl font-bold mt-1">{value}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">{icon}</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
