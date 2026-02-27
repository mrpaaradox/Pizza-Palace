"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, useScroll, useSpring } from "motion/react";
import { Pizza, Home, ShoppingCart, Package, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartProvider, useCart } from "@/lib/cart-context";

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-[#D4AF37] origin-left z-[60]"
      style={{ scaleX }}
    />
  );
}

function CartNavLink() {
  const { items } = useCart();
  const pathname = usePathname();
  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  
  const isActive = pathname === "/dashboard/cart";
  
  return (
    <Link
      href="/dashboard/cart"
      className={`flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors relative ${
        isActive ? "text-[#D4AF37]" : "text-white/60 hover:text-white"
      }`}
    >
      <div className="relative">
        <ShoppingCart className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute -top-2 -right-2 bg-[#D4AF37] text-black text-xs w-4 h-4 rounded-full flex items-center justify-center font-semibold">
            {count}
          </span>
        )}
      </div>
      <span className="text-xs font-light">Cart</span>
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
  const pathname = usePathname();

  return (
    <CartProvider>
      <ScrollProgress />
      <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col overflow-x-hidden">
        {/* Header */}
        <header className="bg-[#0f0f0f]/80 backdrop-blur-md border-b border-[#2a2a2a] sticky top-0 z-[50]">
          <div className="flex items-center justify-between h-16 px-4">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center">
                <Pizza className="w-4 h-4 text-black" />
              </div>
              <span className="font-light text-lg">
                <span className="font-serif italic text-[#D4AF37]">Pizza Palace</span>
              </span>
            </Link>
            <Link href="/dashboard/profile">
              <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
                <User className="w-4 h-4 text-white/60" />
              </div>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 min-w-0 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-[#0f0f0f]/80 backdrop-blur-md border-t border-[#2a2a2a] z-[50] pb-safe">
          <div className="flex justify-around items-center h-16">
            <MobileNavLink 
              href="/dashboard" 
              icon={<Home className="w-5 h-5" />} 
              label="Home" 
              isActive={pathname === "/dashboard"}
            />
            <MobileNavLink 
              href="/dashboard/menu" 
              icon={<Pizza className="w-5 h-5" />} 
              label="Menu" 
              isActive={pathname === "/dashboard/menu"}
            />
            <CartNavLink />
            <MobileNavLink 
              href="/dashboard/orders" 
              icon={<Package className="w-5 h-5" />} 
              label="Orders" 
              isActive={pathname === "/dashboard/orders"}
            />
            <MobileNavLink 
              href="/dashboard/profile" 
              icon={<User className="w-5 h-5" />} 
              label="Profile" 
              isActive={pathname === "/dashboard/profile"}
            />
          </div>
        </nav>
      </div>
    </CartProvider>
  );
}

function MobileNavLink({ href, icon, label, isActive }: { href: string; icon: React.ReactNode; label: string; isActive: boolean }) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors ${
        isActive ? "text-[#D4AF37]" : "text-white/60 hover:text-white"
      }`}
    >
      {icon}
      <span className="text-xs font-light">{label}</span>
    </Link>
  );
}
