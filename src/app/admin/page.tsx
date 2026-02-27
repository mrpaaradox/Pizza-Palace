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

const COLORS = ["#D4AF37", "#c9a227", "#b8911f", "#a67c17", "#8f6610", "#765109", "#5e3d06", "#452803", "#2c1301", "#D4AF37"];

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

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

  const allOrders = JSON.parse(JSON.stringify(allOrdersRaw));

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

  const ordersByDay: { date: string; orders: number; revenue: number }[] = [];
  const revenueByDay: { date: string; revenue: number }[] = [];
  const ordersByStatus: { name: string; value: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    ordersByDay.push({ date: dateStr, orders: 0, revenue: 0 });
    revenueByDay.push({ date: dateStr, revenue: 0 });
  }

  ordersLast7Days.forEach((order) => {
    const orderDate = new Date(order.createdAt);
    const dayIndex = 6 - Math.floor((new Date().getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
    if (dayIndex >= 0 && dayIndex < 7) {
      ordersByDay[dayIndex].orders += 1;
      ordersByDay[dayIndex].revenue += Number(order.total);
      revenueByDay[dayIndex].revenue += Number(order.total);
    }
  });

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

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-600",
    CONFIRMED: "bg-blue-600",
    PREPARING: "bg-orange-600",
    OUT_FOR_DELIVERY: "bg-purple-600",
    DELIVERED: "bg-green-600",
    CANCELLED: "bg-red-600",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-light text-white">Admin Dashboard</h1>
          <p className="text-white/50 mt-1">Overview of your pizza business</p>
        </div>
        <DashboardExportButton 
          orders={allOrders} 
          totalOrders={totalOrders}
          totalCustomers={totalCustomers}
          totalRevenue={Number(revenue._sum.total || 0)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Orders"
          value={totalOrders.toString()}
          icon={<Package className="w-6 h-6" />}
          href="/admin/orders"
        />
        <StatCard
          title="Total Customers"
          value={totalCustomers.toString()}
          icon={<Users className="w-6 h-6" />}
          href="/admin/customers"
        />
        <StatCard
          title="Total Revenue"
          value={`$${Number(revenue._sum.total || 0).toFixed(2)}`}
          icon={<DollarSign className="w-6 h-6" />}
          href="/admin/orders"
        />
        <StatCard
          title="Pending Orders"
          value={pendingOrders.toString()}
          icon={<TrendingUp className="w-6 h-6" />}
          href="/admin/orders?status=PENDING"
        />
      </div>

      <AdminCharts
        ordersByDay={ordersByDay}
        ordersByStatus={ordersByStatus}
        revenueByDay={revenueByDay}
        trendingProducts={trendingProducts}
      />

      <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white font-light">All Orders</CardTitle>
            <Link href="/admin/orders" className="text-sm text-[#D4AF37] hover:underline">
              View details →
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-[#2a2a2a]">
                  <th className="text-left py-3 px-2 text-sm font-light text-white/50">Order ID</th>
                  <th className="text-left py-3 px-2 text-sm font-light text-white/50">Customer</th>
                  <th className="text-left py-3 px-2 text-sm font-light text-white/50">Items</th>
                  <th className="text-left py-3 px-2 text-sm font-light text-white/50">Total</th>
                  <th className="text-left py-3 px-2 text-sm font-light text-white/50">Status</th>
                  <th className="text-left py-3 px-2 text-sm font-light text-white/50">Date</th>
                </tr>
              </thead>
              <tbody>
                {allOrders.map((order: any) => (
                  <tr key={order.id} className="border-b border-[#2a2a2a] hover:bg-[#2a2a2a]/30">
                    <td className="py-3 px-2 text-sm text-white">#{order.id.slice(-8).toUpperCase()}</td>
                    <td className="py-3 px-2 text-sm">
                      <div>
                        <p className="font-light text-white">{order.user?.name || "N/A"}</p>
                        <p className="text-white/40 text-xs">{order.user?.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm text-white/70">{order.items?.length || 0} items</td>
                    <td className="py-3 px-2 text-sm font-light text-[#D4AF37]">${Number(order.total).toFixed(2)}</td>
                    <td className="py-3 px-2 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${statusColors[order.status]} text-white`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-sm text-white/40">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white font-light">Recent Orders</CardTitle>
            <Link href="/admin/orders" className="text-sm text-[#D4AF37] hover:underline">
              View all →
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-white/40 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg hover:border-[#D4AF37]/30 transition-colors"
                >
                  <div>
                    <p className="font-light text-white">Order #{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-white/40">
                      {order.user.name || order.user.email} • {order.items.length} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-light text-[#D4AF37]">
                      ${Number(order.total).toFixed(2)}
                    </p>
                    <p className="text-sm text-white/40">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
          <CardHeader>
            <CardTitle className="text-white font-light">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/admin/orders?status=PENDING"
              className="block p-3 bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] rounded-lg hover:bg-[#D4AF37]/20 transition-colors"
            >
              View Pending Orders ({pendingOrders})
            </Link>
            <Link
              href="/dashboard/menu"
              className="block p-3 bg-[#1a1a1a] border border-[#2a2a2a] text-white/70 rounded-lg hover:bg-[#2a2a2a] hover:border-[#D4AF37]/30 hover:text-white transition-colors"
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
      <Card className="bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#D4AF37]/30 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/50 font-light">{title}</p>
              <p className="text-2xl font-light mt-1 text-white">{value}</p>
            </div>
            <div className="p-3 bg-[#D4AF37]/10 rounded-lg border border-[#D4AF37]/20">{icon}</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
