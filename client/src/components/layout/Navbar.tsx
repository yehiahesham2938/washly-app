import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, Menu, Store, User, X } from "lucide-react";

import { WashlyLogo } from "@/components/WashlyLogo";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { fetchMyVendorCenters } from "@/services/api/centers";

const links = [
  { to: "/", label: "Home" },
  { to: "/centers", label: "Wash Centers" },
  { to: "/home-booking", label: "Home Service" },
] as const;

function isNavActive(pathname: string, to: string) {
  if (to === "/") return pathname === "/";
  if (to === "/centers")
    return pathname === "/centers" || pathname.startsWith("/centers/");
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hasVendorCenters, setHasVendorCenters] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user || user.role === "admin") {
      setHasVendorCenters(false);
      return;
    }
    let cancelled = false;
    fetchMyVendorCenters()
      .then((list) => {
        if (!cancelled) setHasVendorCenters(list.length > 0);
      })
      .catch(() => {
        if (!cancelled) setHasVendorCenters(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.role, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <WashlyLogo size="sm" className="max-h-9" />
          <span className="text-xl font-bold text-gradient">Washly</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isNavActive(location.pathname, link.to)
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
          {user && user.role !== "admin" ? (
            <>
              <Link
                to="/become-vendor"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isNavActive(location.pathname, "/become-vendor")
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                Become a vendor
              </Link>
              {hasVendorCenters ? (
                <Link
                  to="/my-centers"
                  className={cn(
                    "inline-flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary",
                    isNavActive(location.pathname, "/my-centers")
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <Store className="h-3.5 w-3.5" />
                  My wash centers
                </Link>
              ) : null}
            </>
          ) : null}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  {user.name.split(" ")[0]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {user.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link
                      to="/admin/dashboard"
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <LayoutDashboard className="h-4 w-4" /> Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link
                    to="/dashboard"
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <User className="h-4 w-4" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default" size="sm">
              <Link to="/login">Sign In</Link>
            </Button>
          )}
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-card px-4 py-4 md:hidden">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block py-2 text-sm font-medium transition-colors hover:text-primary",
                isNavActive(location.pathname, link.to)
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
          {user && user.role !== "admin" ? (
            <>
              <Link
                to="/become-vendor"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block py-2 text-sm font-medium transition-colors hover:text-primary",
                  isNavActive(location.pathname, "/become-vendor")
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                Become a vendor
              </Link>
              {hasVendorCenters ? (
                <Link
                  to="/my-centers"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block py-2 text-sm font-medium transition-colors hover:text-primary",
                    isNavActive(location.pathname, "/my-centers")
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  My wash centers
                </Link>
              ) : null}
            </>
          ) : null}
          {user ? (
            <>
              {user.role === "admin" && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary"
                >
                  Admin
                </Link>
              )}
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary"
              >
                Dashboard
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={handleLogout}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Button asChild variant="default" size="sm" className="mt-2 w-full">
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                Sign In
              </Link>
            </Button>
          )}
        </div>
      )}
    </nav>
  );
}
