import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Pizza, Home, ShoppingCart, Package, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import SignOutButton from "@/components/sign-out-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const isAdmin = (session.user as any).role === "ADMIN";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                <Pizza className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Pizza Palace</span>
            </Link>

            <div className="flex items-center gap-4">
              {isAdmin && (
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="border-red-500 text-red-500 hover:bg-red-50">
                    <Settings className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              <span className="text-sm text-gray-600">
                {session.user.name || session.user.email}
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-56 flex-shrink-0">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
              <NavLink href="/dashboard" icon={<Home className="w-5 h-5" />}>
                Dashboard
              </NavLink>
              <NavLink href="/dashboard/menu" icon={<Pizza className="w-5 h-5" />}>
                Menu
              </NavLink>
              <NavLink href="/dashboard/cart" icon={<ShoppingCart className="w-5 h-5" />}>
                Cart
              </NavLink>
              <NavLink href="/dashboard/orders" icon={<Package className="w-5 h-5" />}>
                My Orders
              </NavLink>
              <NavLink href="/dashboard/profile" icon={<User className="w-5 h-5" />}>
                Profile
              </NavLink>
            </nav>
          </aside>

          <main className="flex-1 min-w-0">
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
      className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors whitespace-nowrap"
    >
      {icon}
      <span className="font-medium">{children}</span>
    </Link>
  );
}
