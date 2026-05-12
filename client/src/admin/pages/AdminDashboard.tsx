import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Building2, ChartNoAxesCombined } from "lucide-react";

import { CentersRevenueTable } from "@/admin/components/CentersRevenueTable";
import { HomeServiceRevenue } from "@/admin/components/HomeServiceRevenue";
import { RevenueCards } from "@/admin/components/RevenueCards";
import { RevenueCharts } from "@/admin/components/RevenueCharts";
import { RevenueFilters } from "@/admin/components/RevenueFilters";
import {
  buildRevenueAnalytics,
  type RevenueFilter,
} from "@/admin/components/revenueAnalytics";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminDashboard() {
  const { allBookingRecords, adminDataLoading, refreshAdminData } = useAuth();
  const [filter, setFilter] = useState<RevenueFilter>("month");

  // Re-fetch on every visit so paymentMethod and status are always current.
  useEffect(() => {
    refreshAdminData();
  }, [refreshAdminData]);

  const analytics = useMemo(
    () => buildRevenueAnalytics(allBookingRecords, filter),
    [allBookingRecords, filter]
  );

  const showEmptyState = !adminDataLoading && analytics.filteredCompletedCount === 0;

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Admin Revenue Analytics
        </h2>
        <p className="text-muted-foreground">
          Advanced business insights for centers and home service bookings.
        </p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/60 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold tracking-wide text-muted-foreground">
            Time Filter
          </h3>
          <ChartNoAxesCombined className="h-4 w-4 text-primary" />
        </div>
        <RevenueFilters value={filter} onChange={setFilter} />
      </div>

      {adminDataLoading ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[116px] rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-[360px] rounded-xl" />
          <Skeleton className="h-[320px] rounded-xl" />
        </div>
      ) : showEmptyState ? (
        <Card className="rounded-xl border border-dashed border-border">
          <CardContent className="flex min-h-[220px] flex-col items-center justify-center gap-2 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground" />
            <p className="text-lg font-semibold">No completed bookings in this range</p>
            <p className="text-sm text-muted-foreground">
              Revenue analytics update automatically when bookings move to
              <span className="mx-1 rounded bg-muted px-1.5 py-0.5 font-medium text-foreground">
                completed
              </span>
              status.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <RevenueCards
            centerCashRevenue={analytics.centerCashRevenue}
            centerEPaymentRevenue={analytics.centerEPaymentRevenue}
            homeRevenue={analytics.homeRevenue}
          />

          {analytics.totalUnknownRevenue > 0 ? (
            <Card className="rounded-xl border-amber-300/60 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/20">
              <CardContent className="flex items-start gap-2 p-4 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600 dark:text-amber-400" />
                <p className="text-amber-900 dark:text-amber-100">
                  {`Some completed bookings (${analytics.totalUnknownRevenue.toLocaleString()} EGP) have no saved payment method, so they are excluded from Cash/Visa/Wallet split to keep the dashboard data fully accurate.`}
                </p>
              </CardContent>
            </Card>
          ) : null}

          <section className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-xl font-semibold tracking-tight">Centers Revenue</h3>
              <p className="text-sm text-muted-foreground">
                Platform Revenue from centers = 20% of completed bookings revenue. Centers keep 80%.
              </p>
            </div>
            <CentersRevenueTable rows={analytics.centersRows} />
          </section>

          <RevenueCharts
            centerData={analytics.centerChartData}
            paymentBreakdown={analytics.paymentBreakdown}
            trendData={analytics.trendData}
          />

          <HomeServiceRevenue
            totalRevenue={analytics.homeRevenue}
            completedBookings={analytics.homeCompletedBookings}
            cashRevenue={analytics.homeCashRevenue}
            visaRevenue={analytics.homeVisaRevenue}
            walletRevenue={analytics.homeWalletRevenue}
          />
        </>
      )}
    </div>
  );
}
