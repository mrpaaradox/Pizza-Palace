"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useSpring } from "motion/react";
import { Pizza, LayoutDashboard, Package, Users, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <>
      <ScrollProgress />
      <div className="min-h-screen bg-[#0f0f0f] flex flex-col">
        <header className="bg-[#0f0f0f]/80 backdrop-blur-md border-b border-[#2a2a2a] sticky top-0 z-[50]">
          <div className="flex items-center justify-between h-16 px-4">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center">
                <Pizza className="w-4 h-4 text-black" />
              </div>
              <div>
                <span className="font-light text-white">Pizza Palace</span>
                <span className="ml-2 text-sm text-[#D4AF37]">Admin</span>
              </div>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="bg-[#D4AF37] hover:bg-[#c9a227] text-black">
                Back to App
              </Button>
            </Link>
          </div>
        </header>

        <main className="flex-1 min-w-0 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {children}
          </div>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-[#0f0f0f]/80 backdrop-blur-md border-t border-[#2a2a2a] z-[50] pb-safe">
          <div className="flex justify-around items-center h-16">
            <MobileNavLink href="/admin" icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" isActive={pathname === "/admin"} />
            <MobileNavLink href="/admin/orders" icon={<Package className="w-5 h-5" />} label="Orders" isActive={pathname === "/admin/orders"} />
            <MobileNavLink href="/admin/products" icon={<Pizza className="w-5 h-5" />} label="Products" isActive={pathname === "/admin/products"} />
            <MobileNavLink href="/admin/coupons" icon={<Tag className="w-5 h-5" />} label="Coupons" isActive={pathname === "/admin/coupons"} />
            <MobileNavLink href="/admin/customers" icon={<Users className="w-5 h-5" />} label="Users" isActive={pathname === "/admin/customers"} />
          </div>
        </nav>
      </div>
    </>
  );
}
