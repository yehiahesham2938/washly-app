import { Navigate, Outlet, useLocation } from "react-router-dom";

import { WashlyBrandLoader } from "@/components/WashlyBrandLoader";
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedRoute() {
  const { user, authReady } = useAuth();
  const location = useLocation();

  if (!authReady) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <WashlyBrandLoader />
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate to="/login" replace state={{ from: location.pathname }} />
    );
  }

  return <Outlet />;
}
