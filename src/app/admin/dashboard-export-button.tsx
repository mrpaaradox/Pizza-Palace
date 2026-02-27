"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  quantity: number;
  price: string;
  size: string;
  product: {
    name: string;
  };
}

interface Order {
  id: string;
  status: string;
  total: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  notes: string | null;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
  items: OrderItem[];
}

interface DashboardExportButtonProps {
  orders: any[];
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
}

export default function DashboardExportButton({ 
  orders, 
  totalOrders, 
  totalCustomers, 
  totalRevenue 
}: DashboardExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const generatePDF = async () => {
    setIsExporting(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Title
      doc.setFontSize(24);
      doc.setTextColor(239, 68, 68);
      doc.text("Pizza Palace", pageWidth / 2, 20, { align: "center" });

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("Business Analytics Report", pageWidth / 2, 30, { align: "center" });

      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 36, { align: "center" });

      // Summary Statistics
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Business Summary", 14, 50);

      const deliveredOrders = orders.filter(o => o.status === "DELIVERED").length;
      const pendingOrders = orders.filter(o => o.status === "PENDING").length;
      const cancelledOrders = orders.filter(o => o.status === "CANCELLED").length;

      const summaryData = [
        ["Total Orders", totalOrders.toString()],
        ["Total Customers", totalCustomers.toString()],
        ["Total Revenue", `$${totalRevenue.toFixed(2)}`],
        ["Delivered Orders", deliveredOrders.toString()],
        ["Pending Orders", pendingOrders.toString()],
        ["Cancelled Orders", cancelledOrders.toString()],
        ["Average Order Value", `$${totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : "0.00"}`],
      ];

      autoTable(doc, {
        startY: 55,
        head: [["Metric", "Value"]],
        body: summaryData,
        theme: "striped",
        headStyles: { fillColor: [239, 68, 68] },
      });

      // Orders Details
      let currentY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.text("Order Details", 14, currentY);
      currentY += 5;

      const orderData = orders.map((order: any) => [
        order.id.slice(-8).toUpperCase(),
        order.user.name || "N/A",
        order.user.email,
        order.items.map((item: any) => `${item.quantity}x ${item.product.name}`).join(", "),
        `$${Number(order.total).toFixed(2)}`,
        order.status,
        new Date(order.createdAt).toLocaleDateString(),
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [["Order ID", "Customer", "Email", "Items", "Total", "Status", "Date"]],
        body: orderData,
        theme: "striped",
        headStyles: { fillColor: [239, 68, 68] },
        styles: { fontSize: 8 },
      });

      // Add customer details page
      doc.addPage();
      doc.setFontSize(14);
      doc.text("Customer Details", 14, 20);

      const customerMap = new Map();
      orders.forEach(order => {
        const key = order.user.email;
        if (!customerMap.has(key)) {
          customerMap.set(key, {
            name: order.user.name || "N/A",
            email: order.user.email,
            address: `${order.address}, ${order.city} ${order.postalCode}`,
            phone: order.phone,
            orderCount: 0,
            totalSpent: 0,
          });
        }
        const customer = customerMap.get(key);
        customer.orderCount++;
        customer.totalSpent += Number(order.total);
      });

      const customerData = Array.from(customerMap.values()).map(c => [
        c.name,
        c.email,
        c.phone || "N/A",
        c.address,
        c.orderCount.toString(),
        `$${c.totalSpent.toFixed(2)}`,
      ]);

      autoTable(doc, {
        startY: 25,
        head: [["Name", "Email", "Phone", "Address", "Orders", "Total Spent"]],
        body: customerData,
        theme: "striped",
        headStyles: { fillColor: [239, 68, 68] },
      });

      // Items breakdown page
      doc.addPage();
      doc.setFontSize(14);
      doc.text("Order Items Breakdown", 14, 20);

      const itemsData: any[] = [];
      orders.forEach((order: any) => {
        order.items.forEach((item: any) => {
          itemsData.push([
            order.id.slice(-8).toUpperCase(),
            item.product.name,
            item.size,
            item.quantity.toString(),
            `$${Number(item.price).toFixed(2)}`,
            `$${(Number(item.price) * item.quantity).toFixed(2)}`,
          ]);
        });
      });

      autoTable(doc, {
        startY: 25,
        head: [["Order ID", "Product", "Size", "Qty", "Unit Price", "Subtotal"]],
        body: itemsData,
        theme: "striped",
        headStyles: { fillColor: [239, 68, 68] },
      });

      // Save PDF
      doc.save(`pizza-palace-report-${new Date().toISOString().split("T")[0]}.pdf`);
      
      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

return (
    <Button
      onClick={generatePDF}
      disabled={isExporting}
      className="bg-[#D4AF37] hover:bg-[#c9a227] text-black font-medium"
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </>
      )}
    </Button>
  );
}
