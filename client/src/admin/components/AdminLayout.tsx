import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import { AdminSidebar } from "@/admin/components/AdminSidebar";
import { WashlyBrandLoader } from "@/components/WashlyBrandLoader";
import { cn } from "@/lib/utils";

const ADMIN_ENTER_MS = 420;
const ADMIN_FADE_MS = 450;

const mobileLinks = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/centers", label: "Centers" },
  { to: "/admin/bookings", label: "Bookings" },
  { to: "/admin/users", label: "Users" },
] as const;

export function AdminLayout() {
  const [phase, setPhase] = useState<"enter" | "fade" | "done">("enter");

  useEffect(() => {
    const t = window.setTimeout(() => setPhase("fade"), ADMIN_ENTER_MS);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== "fade") return;
    const t = window.setTimeout(() => setPhase("done"), ADMIN_FADE_MS + 40);
    return () => window.clearTimeout(t);
  }, [phase]);

  return (
    <div className="relative min-h-screen bg-background">
      <div
        className={cn(
          "min-h-screen transition-opacity duration-500 ease-out",
          phase === "done" ? "opacity-100" : "opacity-0"
        )}
      >
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

      {phase !== "done" ? (
        <div
          className={cn(
            "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ease-out",
            phase === "fade" ? "pointer-events-none opacity-0" : "opacity-100"
          )}
          aria-hidden
        >
          <WashlyBrandLoader
            variant="compact"
            subtitle="Loading admin console…"
          />
        </div>
      ) : null}
    </div>
  );
}
