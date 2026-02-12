import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Pizza, LayoutDashboard, Package, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import SignOutButton from "@/components/sign-out-button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                <Pizza className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold">Pizza Palace</span>
                <span className="ml-2 text-sm text-gray-400">Admin</span>
              </div>
            </Link>

            {/* User Info */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">
                {session.user.email}
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64">
            <nav className="space-y-2">
              <NavLink href="/admin" icon={<LayoutDashboard className="w-5 h-5" />}>
                Dashboard
              </NavLink>
              <NavLink href="/admin/orders" icon={<Package className="w-5 h-5" />}>
                Orders
              </NavLink>
              <NavLink href="/admin/products" icon={<Pizza className="w-5 h-5" />}>
                Products
              </NavLink>
              <NavLink href="/admin/customers" icon={<Users className="w-5 h-5" />}>
                Customers
              </NavLink>
            </nav>

            <div className="mt-8 pt-8 border-t">
              <Link href="/dashboard">
                <Button variant="outline" className="w-full">
                  Back to User Dashboard
                </Button>
              </Link>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

function NavLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
    >
      {icon}
      <span className="font-medium">{children}</span>
    </Link>
  );
}
