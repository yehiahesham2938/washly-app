import { Navigate, Route, Routes } from "react-router-dom";

import { AdminLayout } from "@/admin/components/AdminLayout";
import { AdminRoute } from "@/admin/components/AdminRoute";
import { AdminBookings } from "@/admin/pages/AdminBookings";
import { AdminCenters } from "@/admin/pages/AdminCenters";
import { AdminDashboard } from "@/admin/pages/AdminDashboard";
import { AdminUsers } from "@/admin/pages/AdminUsers";
import { AdminVendorRequests } from "@/admin/pages/AdminVendorRequests";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Booking } from "@/pages/Booking";
import { BecomeVendor } from "@/pages/BecomeVendor";
import { CenterDetail } from "@/pages/CenterDetail";
import { Centers } from "@/pages/Centers";
import { Confirmation } from "@/pages/Confirmation";
import { Dashboard } from "@/pages/Dashboard";
import { Home } from "@/pages/Home";
import { HomeBooking } from "@/pages/HomeBooking";
import { Login } from "@/pages/Login";
import { Signup } from "@/pages/Signup";
import { VendorMyCenters } from "@/pages/VendorMyCenters";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="centers" element={<Centers />} />
        <Route path="centers/:id" element={<CenterDetail />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="confirmation" element={<Confirmation />} />
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route
            path="booking/:centerId/:serviceId"
            element={<Booking />}
          />
          <Route path="home-booking" element={<HomeBooking />} />
          <Route path="become-vendor" element={<BecomeVendor />} />
          <Route path="my-centers" element={<VendorMyCenters />} />
          <Route path="vendor/centers" element={<VendorMyCenters />} />
        </Route>
      </Route>

      <Route path="admin" element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="centers" element={<AdminCenters />} />
          <Route path="vendor-requests" element={<AdminVendorRequests />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
      </Route>
    </Routes>
  );
}
