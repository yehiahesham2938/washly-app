import { NavLink, Outlet } from "react-router-dom";

import { AdminSidebar } from "@/admin/components/AdminSidebar";
import { cn } from "@/lib/utils";

const mobileLinks = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/centers", label: "Centers" },
  { to: "/admin/bookings", label: "Bookings" },
  { to: "/admin/users", label: "Users" },
] as const;

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="md:pl-64">
        <nav className="sticky top-0 z-30 flex gap-2 overflow-x-auto border-b border-border bg-card/80 px-3 py-2 backdrop-blur-lg md:hidden">
          {mobileLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <header className="hidden border-b border-border bg-card/50 md:block">
          <div className="flex h-12 items-center px-6">
            <p className="text-sm text-muted-foreground">Admin console</p>
          </div>
        </header>
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
