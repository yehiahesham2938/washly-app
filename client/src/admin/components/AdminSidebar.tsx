import { NavLink, useNavigate } from "react-router-dom";
import {
  Building2,
  CalendarCheck,
  LayoutDashboard,
  LogOut,
  Users,
} from "lucide-react";

import { WashlyLogo } from "@/components/WashlyLogo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const items = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/centers", label: "Centers", icon: Building2 },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { to: "/admin/users", label: "Users", icon: Users },
] as const;

export function AdminSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleSignOut() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-border bg-card/95 backdrop-blur-md md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border px-4">
        <WashlyLogo size="sm" className="max-h-8 shrink-0" />
        <span className="bg-gradient-primary bg-clip-text text-lg font-bold leading-tight text-transparent">
          Washly Admin
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-4">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-border p-4">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-center gap-2"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
        <NavLink
          to="/"
          className="mt-3 block text-center text-sm text-muted-foreground hover:text-primary"
        >
          ← Back to site
        </NavLink>
      </div>
    </aside>
  );
}
