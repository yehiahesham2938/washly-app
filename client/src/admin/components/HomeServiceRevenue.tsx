import { House, ReceiptText, Wallet, WalletCards } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEgp } from "@/lib/currency";

type Props = {
  totalRevenue: number;
  completedBookings: number;
  cashRevenue: number;
  visaRevenue: number;
  walletRevenue: number;
};

export function HomeServiceRevenue({
  totalRevenue,
  completedBookings,
  cashRevenue,
  visaRevenue,
  walletRevenue,
}: Props) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-xl font-semibold tracking-tight">Home Service Revenue</h3>
        <p className="text-sm text-muted-foreground">
          Platform revenue from home service is 100% of completed bookings.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-xl border-border/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <House className="h-4 w-4 text-primary" />
              Total Home Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {formatEgp(totalRevenue)}
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <ReceiptText className="h-4 w-4 text-primary" />
              Completed Home Bookings
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{completedBookings}</CardContent>
        </Card>

        <Card className="rounded-xl border-border/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <WalletCards className="h-4 w-4 text-primary" />
              Payment Split
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Cash</span>
              <Badge variant="warning">{formatEgp(cashRevenue)}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Visa</span>
              <Badge>{formatEgp(visaRevenue)}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Wallet</span>
              <Badge variant="outline">{formatEgp(walletRevenue)}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wallet className="h-4 w-4 text-primary" />
              Platform Share
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              100%
            </p>
            <p className="text-xs text-muted-foreground">Full service owned by platform</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
