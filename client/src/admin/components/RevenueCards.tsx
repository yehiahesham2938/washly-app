import { Banknote, House, SmartphoneNfc } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEgp } from "@/lib/currency";

type Props = {
  centerCashRevenue: number;
  centerEPaymentRevenue: number;
  homeRevenue: number;
};

function RevenueRow({
  label,
  amount,
  highlight,
}: {
  label: string;
  amount: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between text-xs ${
        highlight ? "font-bold text-foreground" : "text-muted-foreground"
      }`}
    >
      <span>{label}</span>
      <span className={highlight ? "text-base font-bold text-foreground" : ""}>
        {formatEgp(amount)}
      </span>
    </div>
  );
}

export function RevenueCards({
  centerCashRevenue,
  centerEPaymentRevenue,
  homeRevenue,
}: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Cash Payments */}
      <Card className="overflow-hidden rounded-2xl border-border/60 bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-orange-500/10 shadow-[0_14px_34px_rgba(14,45,88,0.08)] transition-transform duration-200 hover:-translate-y-0.5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-300">
            <Banknote className="h-4 w-4 shrink-0" />
            Cash Payments — Centers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-xl bg-white/50 px-4 py-3 dark:bg-black/20 space-y-2.5">
            <RevenueRow
              label="Total Cash Collected"
              amount={centerCashRevenue}
              highlight
            />
            <div className="border-t border-border/30" />
            <RevenueRow
              label="Centers Revenue (80%)"
              amount={centerCashRevenue * 0.8}
            />
            <RevenueRow
              label="Platform Revenue (20%)"
              amount={centerCashRevenue * 0.2}
            />
          </div>
        </CardContent>
      </Card>

      {/* E-Payments */}
      <Card className="overflow-hidden rounded-2xl border-border/60 bg-gradient-to-br from-violet-500/15 via-purple-500/10 to-fuchsia-500/10 shadow-[0_14px_34px_rgba(14,45,88,0.08)] transition-transform duration-200 hover:-translate-y-0.5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-violet-700 dark:text-violet-300">
            <SmartphoneNfc className="h-4 w-4 shrink-0" />
            E-Payments — Centers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-xl bg-white/50 px-4 py-3 dark:bg-black/20 space-y-2.5">
            <RevenueRow
              label="Total E-Pay Collected (Visa + Wallet)"
              amount={centerEPaymentRevenue}
              highlight
            />
            <div className="border-t border-border/30" />
            <RevenueRow
              label="Centers Revenue (80%)"
              amount={centerEPaymentRevenue * 0.8}
            />
            <RevenueRow
              label="Platform Revenue (20%)"
              amount={centerEPaymentRevenue * 0.2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Home Service */}
      <Card className="overflow-hidden rounded-2xl border-border/60 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-cyan-500/10 shadow-[0_14px_34px_rgba(14,45,88,0.08)] transition-transform duration-200 hover:-translate-y-0.5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            <House className="h-4 w-4 shrink-0" />
            Home Service Revenue
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-xl bg-white/50 px-4 py-3 dark:bg-black/20 space-y-2.5">
            <RevenueRow
              label="Total Revenue (100% Platform)"
              amount={homeRevenue}
              highlight
            />
          </div>
          <p className="text-xs text-muted-foreground px-1">
            Platform owns the full home service — all payment types included.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
