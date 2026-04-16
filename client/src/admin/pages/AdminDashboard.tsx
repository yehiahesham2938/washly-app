import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { Banknote, Sparkles, TrendingUp, Users, Warehouse } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { formatEgp } from "@/lib/currency";
import { useCenters } from "@/contexts/CentersContext";
import type { BookingRecord } from "@/types";

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: typeof Users;
}) {
  return (
    <Card className="rounded-xl border-border/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}

function recentLabel(b: BookingRecord) {
  try {
    return format(parseISO(b.createdAt), "MMM d, yyyy · HH:mm");
  } catch {
    return b.createdAt;
  }
}

export function AdminDashboard() {
  const { allBookingRecords, allUsers } = useAuth();
  const { centers } = useCenters();

  const revenue = useMemo(
    () => allBookingRecords.reduce((s, b) => s + b.price, 0),
    [allBookingRecords]
  );

  const recent = useMemo(() => {
    return [...allBookingRecords]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [allBookingRecords]);

  const confirmedShare =
    allBookingRecords.length === 0
      ? 0
      : Math.round(
          (allBookingRecords.filter((b) => b.status === "confirmed").length /
            allBookingRecords.length) *
            100
        );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your Washly platform
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Centers"
          value={centers.length}
          icon={Warehouse}
        />
        <StatCard title="Total Users" value={allUsers.length} icon={Users} />
        <StatCard
          title="Total Bookings"
          value={allBookingRecords.length}
          icon={Sparkles}
        />
        <StatCard
          title="Revenue"
          value={formatEgp(revenue)}
          icon={Banknote}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-xl border-border/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Booking pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>Confirmed share</span>
                <span>{confirmedShare}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-primary transition-all"
                  style={{ width: `${confirmedShare}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>Completed</span>
                <span>
                  {
                    allBookingRecords.filter((b) => b.status === "completed")
                      .length
                  }
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-emerald-500/80"
                  style={{
                    width: `${
                      allBookingRecords.length
                        ? Math.round(
                            (allBookingRecords.filter(
                              (b) => b.status === "completed"
                            ).length /
                              allBookingRecords.length) *
                              100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <CardHeader>
            <CardTitle className="text-base">Recent bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bookings yet.</p>
            ) : (
              <ul className="space-y-3">
                {recent.map((b) => (
                  <li
                    key={b.id}
                    className="flex flex-col gap-1 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium">{b.serviceName}</span>
                      <Badge
                        variant={
                          b.status === "pending"
                            ? "warning"
                            : b.status === "completed"
                              ? "success"
                              : b.status === "cancelled"
                                ? "destructive"
                                : "default"
                        }
                        className="capitalize"
                      >
                        {b.status}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {b.userEmail} · {recentLabel(b)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
