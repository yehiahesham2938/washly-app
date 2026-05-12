import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ChevronDown, ChevronUp, Mail, Phone, User } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { formatEgp } from "@/lib/currency";
import type { Booking } from "@/types";

const PREVIEW = 5;

function statusVariant(
  s: Booking["status"]
): "default" | "success" | "warning" | "secondary" | "destructive" {
  switch (s) {
    case "Confirmed":  return "default";
    case "Completed":  return "success";
    case "Pending":    return "warning";
    case "Cancelled":  return "destructive";
    default:           return "secondary";
  }
}

function formatDate(iso: string) {
  try {
    return format(parseISO(`${iso}T12:00:00`), "MMM d, yyyy");
  } catch {
    return iso;
  }
}

/* ─── shared booking table ─────────────────────────────────────────────────── */
type TableProps = {
  rows: Booking[];
  showCenter?: boolean;
};

function BookingTable({ rows, showCenter = false }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b bg-muted/50 text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Service</th>
            {showCenter && (
              <th className="px-4 py-3 font-medium">Center</th>
            )}
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Time</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium text-right">Price</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <tr
              key={b.id}
              className="border-b border-border/60 last:border-0"
            >
              <td className="px-4 py-3 font-medium">{b.serviceName}</td>
              {showCenter && (
                <td className="max-w-[180px] px-4 py-3 text-muted-foreground">
                  {b.centerName ?? "—"}
                </td>
              )}
              <td className="px-4 py-3 text-muted-foreground">
                {formatDate(b.date)}
              </td>
              <td className="px-4 py-3">{b.time}</td>
              <td className="px-4 py-3">
                <Badge variant={statusVariant(b.status)}>{b.status}</Badge>
              </td>
              <td className="px-4 py-3 text-right font-medium text-primary">
                {formatEgp(b.price)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── collapsible section ──────────────────────────────────────────────────── */
type SectionProps = {
  title: string;
  subtitle: string;
  bookings: Booking[];
  showCenter?: boolean;
  emptyMessage: React.ReactNode;
};

function BookingSection({
  title,
  subtitle,
  bookings,
  showCenter,
  emptyMessage,
}: SectionProps) {
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? bookings : bookings.slice(0, PREVIEW);
  const hasMore = bookings.length > PREVIEW;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-card">
        {bookings.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          <>
            <BookingTable rows={visible} showCenter={showCenter} />

            {hasMore && (
              <div className="flex justify-center border-t border-border/60 px-4 py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs text-muted-foreground"
                  onClick={() => setShowAll((v) => !v)}
                >
                  {showAll ? (
                    <>
                      <ChevronUp className="h-3.5 w-3.5" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3.5 w-3.5" />
                      View all {bookings.length} bookings
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

/* ─── Dashboard ────────────────────────────────────────────────────────────── */
export function Dashboard() {
  const { user, bookings } = useAuth();
  if (!user) return null;

  const sorted = [...bookings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const centerBookings = sorted.filter((b) => b.kind === "center");
  const homeBookings   = sorted.filter((b) => b.kind === "home");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 space-y-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Your profile and booking history
        </p>
      </div>

      {/* Profile */}
      <Card className="border-border/80 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-primary" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{user.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4 shrink-0" />
            {user.email}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground sm:col-span-2">
            <Phone className="h-4 w-4 shrink-0" />
            {user.phone}
          </div>
        </CardContent>
      </Card>

      {/* Center Washing */}
      <BookingSection
        title="Center Washing"
        subtitle="Appointments at wash centers"
        bookings={centerBookings}
        showCenter
        emptyMessage={
          <>
            No center bookings yet. Explore{" "}
            <Link to="/centers" className="text-primary hover:underline">
              wash centers
            </Link>
            .
          </>
        }
      />

      {/* Home Service */}
      <BookingSection
        title="Home Service"
        subtitle="Mobile wash appointments at your address"
        bookings={homeBookings}
        emptyMessage={
          <>
            No home service bookings yet.{" "}
            <Link to="/home-booking" className="text-primary hover:underline">
              Book a home wash
            </Link>
            .
          </>
        }
      />
    </div>
  );
}
