"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OrderData {
  date: string;
  orders: number;
  revenue: number;
}

interface StatusData {
  name: string;
  value: number;
}

interface RevenueData {
  date: string;
  revenue: number;
}

interface TrendingProduct {
  name: string;
  quantity: number;
  fill: string;
}

const COLORS = ["#D4AF37", "#c9a227", "#b8911f", "#a67c17", "#8f6610", "#765109", "#5e3d06", "#452803", "#2c1301", "#D4AF37"];

interface AdminChartsProps {
  ordersByDay: OrderData[];
  ordersByStatus: StatusData[];
  revenueByDay: RevenueData[];
  trendingProducts: TrendingProduct[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1a] p-3 border border-[#2a2a2a] rounded-lg shadow-lg">
        <p className="font-light text-white">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-light" style={{ color: entry.color }}>
            {entry.name}: {entry.name === "Revenue" ? `$${Number(entry.value).toFixed(2)}` : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminCharts({
  ordersByDay,
  ordersByStatus,
  revenueByDay,
  trendingProducts,
}: AdminChartsProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-light text-white">Orders This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersByDay} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-[#2a2a2a]" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#2a2a2a" }} />
                <Bar
                  dataKey="orders"
                  fill="#D4AF37"
                  radius={[6, 6, 0, 0]}
                  name="Orders"
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-light text-white">Trending Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendingProducts} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-[#2a2a2a]" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#2a2a2a" }} />
                  <Bar dataKey="quantity" radius={[0, 4, 4, 0]} name="Orders">
                    {trendingProducts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-light text-white">Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ordersByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {ordersByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    iconType="circle"
                    formatter={(value) => <span className="text-xs text-white/50 font-light">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-[#2a2a2a] lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-light text-white">Revenue This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueByDay}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-[#2a2a2a]" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `$${value}`}
                    dx={-10}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#D4AF37"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                    name="Revenue"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
