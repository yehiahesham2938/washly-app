import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEgp } from "@/lib/currency";

import type { TrendPoint } from "./revenueAnalytics";

type Props = {
  centerData: { centerName: string; revenue: number; platformRevenue: number }[];
  paymentBreakdown: { method: string; amount: number }[];
  trendData: TrendPoint[];
};

const PIE_COLORS = ["#f59e0b", "#3b82f6", "#06b6d4"];

function AmountTooltip({ active, payload }: { active?: boolean; payload?: unknown[] }) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0] as { name?: string; value?: number };
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-foreground">{p.name ?? "Revenue"}</p>
      <p className="text-muted-foreground">{formatEgp(Number(p.value ?? 0))}</p>
    </div>
  );
}

export function RevenueCharts({ centerData, paymentBreakdown, trendData }: Props) {
  const topCenters = centerData.slice(0, 8);
  const hasData =
    centerData.length > 0 ||
    paymentBreakdown.some((item) => item.amount > 0) ||
    trendData.some((item) => item.totalRevenue > 0);

  if (!hasData) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-10 text-center text-sm text-muted-foreground">
        No completed bookings in this period yet, so charts are empty.
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="rounded-xl border-border/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <CardHeader>
          <CardTitle className="text-base">Revenue by center</CardTitle>
        </CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topCenters} margin={{ left: 0, right: 8, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="centerName" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`} />
              <Tooltip content={<AmountTooltip />} />
              <Legend />
              <Bar dataKey="revenue" name="Center Revenue" fill="#2563eb" radius={[8, 8, 0, 0]} />
              <Bar
                dataKey="platformRevenue"
                name="Platform Revenue"
                fill="#14b8a6"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <CardHeader>
          <CardTitle className="text-base">Payment methods breakdown</CardTitle>
        </CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={paymentBreakdown}
                dataKey="amount"
                nameKey="method"
                innerRadius={55}
                outerRadius={100}
                paddingAngle={4}
              >
                {paymentBreakdown.map((entry, index) => (
                  <Cell key={entry.method} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<AmountTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] xl:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Revenue trend over time</CardTitle>
        </CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ left: 0, right: 8, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dateLabel" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`} />
              <Tooltip content={<AmountTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="centerRevenue"
                name="Centers Revenue"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 2.5 }}
              />
              <Line
                type="monotone"
                dataKey="homeRevenue"
                name="Home Revenue"
                stroke="#14b8a6"
                strokeWidth={2}
                dot={{ r: 2.5 }}
              />
              <Line
                type="monotone"
                dataKey="totalRevenue"
                name="Total Revenue"
                stroke="#7c3aed"
                strokeWidth={2}
                dot={{ r: 2.5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
