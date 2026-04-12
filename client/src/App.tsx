import { Route, Routes } from "react-router-dom";

import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Booking } from "@/pages/Booking";
import { CenterDetail } from "@/pages/CenterDetail";
import { Centers } from "@/pages/Centers";
import { Confirmation } from "@/pages/Confirmation";
import { Dashboard } from "@/pages/Dashboard";
import { Home } from "@/pages/Home";
import { HomeBooking } from "@/pages/HomeBooking";
import { Login } from "@/pages/Login";
import { Signup } from "@/pages/Signup";

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
        </Route>
      </Route>
    </Routes>
  );
}
