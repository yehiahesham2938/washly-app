import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";

import { WashlyLogo } from "@/components/WashlyLogo";
import { formatEgp } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Booking } from "@/types";

export function Confirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = (location.state as { booking?: Booking } | null)?.booking;
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setShowCheck(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    if (!booking) {
      navigate("/", { replace: true });
    }
  }, [booking, navigate]);

  if (!booking) return null;

  const when = (() => {
    try {
      return format(parseISO(`${booking.date}T12:00:00`), "PPP");
    } catch {
      return booking.date;
    }
  })();

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex justify-center">
          <WashlyLogo size="md" />
        </div>
        <div
          className={`relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-primary shadow-lg transition-transform duration-500 ${
            showCheck ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        >
          <svg
            className="h-10 w-10 text-primary-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path
              d="M5 13l4 4L19 7"
              className={showCheck ? "animate-draw-check" : ""}
              style={{
                strokeDasharray: 24,
                strokeDashoffset: showCheck ? 0 : 24,
                transition: "stroke-dashoffset 0.45s ease 0.35s",
              }}
            />
          </svg>
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">
          {booking.status === "Pending"
            ? "Booking submitted"
            : "Booking confirmed"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {booking.status === "Pending"
            ? booking.kind === "center"
              ? "We've saved your request. It stays pending until an administrator confirms it; you can track status on your dashboard."
              : "We've saved your booking to your account. You can track status on your dashboard."
            : "You're all set. We've saved your booking to your account."}
        </p>
      </div>

      <Card className="mt-10 border-border/80 shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service</span>
            <span className="font-medium">{booking.serviceName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Where</span>
            <span className="max-w-[60%] text-right font-medium">
              {booking.kind === "home"
                ? booking.address ?? "Home"
                : booking.centerName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">When</span>
            <span>
              {when} · {booking.time}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Vehicle</span>
            <span>{booking.vehicle}</span>
          </div>
          <div className="flex justify-between border-t pt-3 font-semibold">
            <span>Total</span>
            <span className="text-primary">{formatEgp(booking.price)}</span>
          </div>
        </CardContent>
      </Card>

      <Button className="mt-8 w-full" variant="gradient" size="lg" asChild>
        <Link to="/dashboard">Go to dashboard</Link>
      </Button>
    </div>
  );
}
