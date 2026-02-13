"use client";

import Link from "next/link";
import { Pizza, Home, ShoppingCart, Package, User } from "lucide-react";
import SignOutButton from "@/components/sign-out-button";
import { CartProvider, useCart } from "@/lib/cart-context";

function CartNavLink() {
  const { items } = useCart();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  
  return (
    <Link
      href="/dashboard/cart"
      className="flex flex-col items-center justify-center gap-1 px-3 py-2 text-gray-600 hover:text-red-500 transition-colors relative"
    >
      <ShoppingCart className="w-5 h-5" />
      <span className="text-xs">Cart</span>
      {count > 0 && (
        <span className="absolute top-0 right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  );
}

export default function DashboardLayoutClient({
  children,
  isAdmin,
}: {
  children: React.ReactNode;
  isAdmin: boolean;
}) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-[100]">
          <div className="flex items-center justify-between h-16 px-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <Pizza className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">Pizza Palace</span>
            </Link>
            <SignOutButton />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 min-w-0 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[90] pb-safe">
          <div className="flex justify-around items-center h-16">
            <MobileNavLink href="/dashboard" icon={<Home className="w-5 h-5" />} label="Home" />
            <MobileNavLink href="/dashboard/menu" icon={<Pizza className="w-5 h-5" />} label="Menu" />
            <CartNavLink />
            <MobileNavLink href="/dashboard/orders" icon={<Package className="w-5 h-5" />} label="Orders" />
            <MobileNavLink href="/dashboard/profile" icon={<User className="w-5 h-5" />} label="Profile" />
          </div>
        </nav>
      </div>
    </CartProvider>
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
