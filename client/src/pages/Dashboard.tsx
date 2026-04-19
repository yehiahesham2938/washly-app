import { format, parseISO } from "date-fns";
import { Mail, Phone, User } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { formatEgp } from "@/lib/currency";
import type { Booking } from "@/types";

function statusVariant(
  s: Booking["status"]
): "default" | "success" | "warning" | "secondary" | "destructive" {
  switch (s) {
    case "Confirmed":
      return "default";
    case "Completed":
      return "success";
    case "Pending":
      return "warning";
    case "Cancelled":
      return "destructive";
    default:
      return "secondary";
  }
}

function formatDate(iso: string) {
  try {
    return format(parseISO(`${iso}T12:00:00`), "MMM d, yyyy");
  } catch {
    return iso;
  }
}

export function Dashboard() {
  const { user, bookings } = useAuth();
  if (!user) return null;

  const sorted = [...bookings].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Your profile and booking history
      </p>

      <Card className="mt-8 border-border/80 shadow-card">
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

      <h2 className="mb-4 mt-12 text-xl font-semibold">Booking history</h2>
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Service</th>
                <th className="px-4 py-3 font-medium">Center</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    No bookings yet. Explore{" "}
                    <Link to="/centers" className="text-primary hover:underline">
                      wash centers
                    </Link>
                    .
                  </td>
                </tr>
              ) : (
                sorted.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="px-4 py-3 font-medium">{b.serviceName}</td>
                    <td className="max-w-[200px] px-4 py-3 text-muted-foreground">
                      {b.kind === "center"
                        ? b.centerName ?? "—"
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          b.kind === "home" ? "secondary" : "outline"
                        }
                      >
                        {b.kind === "home" ? "Home" : "Center"}
                      </Badge>
                    </td>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
