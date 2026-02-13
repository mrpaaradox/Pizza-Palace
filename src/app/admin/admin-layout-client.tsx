"use client";

import Link from "next/link";
import { Pizza, LayoutDashboard, Package, Users, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 text-white sticky top-0 z-[100]">
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <Pizza className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold">Pizza Palace</span>
              <span className="ml-2 text-sm text-gray-400">Admin</span>
            </div>
          </Link>
          <Link href="/dashboard">
            <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white border-0">
              Back to App
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 min-w-0 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[90] pb-safe">
        <div className="flex justify-around items-center h-16">
          <MobileNavLink href="/admin" icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" />
          <MobileNavLink href="/admin/orders" icon={<Package className="w-5 h-5" />} label="Orders" />
          <MobileNavLink href="/admin/products" icon={<Pizza className="w-5 h-5" />} label="Products" />
          <MobileNavLink href="/admin/coupons" icon={<Tag className="w-5 h-5" />} label="Coupons" />
          <MobileNavLink href="/admin/customers" icon={<Users className="w-5 h-5" />} label="Users" />
        </div>
      </nav>
    </div>
  );
}

function MobileNavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-1 px-3 py-2 text-gray-600 hover:text-red-500 transition-colors"
    >
      {icon}
      <span className="text-xs">{label}</span>
    </Link>
  );
}
