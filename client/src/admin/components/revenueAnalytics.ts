import {
  eachDayOfInterval,
  endOfDay,
  format,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfMonth,
  subDays,
} from "date-fns";

import {
  normalizeBookingPaymentMethod,
  type AnalyticsPaymentMethod,
} from "@/lib/bookingPayments";
import type { BookingRecord } from "@/types";

export type RevenueFilter = "today" | "week" | "month";

export type PaymentTotals = Record<AnalyticsPaymentMethod, number>;

export type CenterRevenueRow = {
  centerName: string;
  completedBookings: number;
  cashRevenue: number;
  visaRevenue: number;
  walletRevenue: number;
  unknownRevenue: number;
  totalRevenue: number;
  platformRevenue: number;
};

export type TrendPoint = {
  dateLabel: string;
  centerRevenue: number;
  homeRevenue: number;
  totalRevenue: number;
};

export type DashboardRevenueAnalytics = {
  centersRows: CenterRevenueRow[];
  centersRevenue: number;
  centersPlatformRevenue: number;        // 80% of ALL center transactions (cash+visa+wallet)
  centerCashRevenue: number;             // center cash payments only
  centerEPaymentRevenue: number;         // center visa + wallet only
  centersCompletedBookings: number;
  homeRevenue: number;                   // 100% platform — all home payment types
  homeCompletedBookings: number;
  homeCashRevenue: number;
  homeVisaRevenue: number;
  homeWalletRevenue: number;
  totalCashRevenue: number;
  totalVisaRevenue: number;
  totalWalletRevenue: number;
  totalUnknownRevenue: number;
  knownPaymentRevenue: number;
  paymentBreakdown: { method: string; amount: number }[];
  centerChartData: { centerName: string; revenue: number; platformRevenue: number }[];
  trendData: TrendPoint[];
  filteredCompletedCount: number;
};

/**
 * Returns the date used for revenue range filtering.
 * We use createdAt (when the booking was placed / payment captured) rather than
 * the appointment date, because the appointment date is chosen by the customer
 * and may be in the future — filtering on it would silently exclude bookings
 * that were completed this period.
 */
function toBookingDate(record: BookingRecord): Date {
  const created = new Date(record.createdAt);
  if (!Number.isNaN(created.getTime())) return created;
  // Last-resort fallback: appointment date string
  if (record.date) {
    const parsed = parseISO(record.date);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date(0);
}

function buildInterval(filter: RevenueFilter, now: Date) {
  if (filter === "today") {
    return { start: startOfDay(now), end: endOfDay(now) };
  }
  if (filter === "week") {
    // "Last 7 days" — must match buildTrendBuckets exactly
    return { start: startOfDay(subDays(now, 6)), end: endOfDay(now) };
  }
  return { start: startOfMonth(now), end: endOfDay(now) };
}

function emptyPaymentTotals(): PaymentTotals {
  return { cash: 0, visa: 0, wallet: 0, unknown: 0 };
}

function paymentTotalsFromBookings(
  bookings: (BookingRecord & { normalizedPayment: AnalyticsPaymentMethod })[]
): PaymentTotals {
  return bookings.reduce<PaymentTotals>((acc, booking) => {
    acc[booking.normalizedPayment] += booking.price;
    return acc;
  }, emptyPaymentTotals());
}

function buildTrendBuckets(filter: RevenueFilter, now: Date): string[] {
  if (filter === "today") {
    return [format(now, "MMM d")];
  }
  const from = filter === "week" ? subDays(now, 6) : startOfMonth(now);
  return eachDayOfInterval({
    start: startOfDay(from),
    end: startOfDay(now),
  }).map((day) => format(day, "MMM d"));
}

export function buildRevenueAnalytics(
  allBookingRecords: BookingRecord[],
  filter: RevenueFilter,
  now = new Date()
): DashboardRevenueAnalytics {
  const interval = buildInterval(filter, now);
  const completedInRange = allBookingRecords
    .filter((booking) => booking.status === "completed")
    .map((booking) => {
      const bookingDate = toBookingDate(booking);
      return {
        ...booking,
        bookingDate,
        normalizedPayment: normalizeBookingPaymentMethod(
          booking.paymentMethod,
          booking.notes
        ),
      };
    })
    .filter((booking) =>
      isWithinInterval(booking.bookingDate, {
        start: interval.start,
        end: interval.end,
      })
    );

  const centerBookings = completedInRange.filter((booking) => booking.kind === "center");
  const homeBookings = completedInRange.filter((booking) => booking.kind === "home");

  const byCenter = new Map<string, CenterRevenueRow>();
  for (const booking of centerBookings) {
    const key = booking.centerName?.trim() || "Unknown Center";
    const existing = byCenter.get(key);
    if (!existing) {
      byCenter.set(key, {
        centerName: key,
        completedBookings: 1,
        cashRevenue: booking.normalizedPayment === "cash" ? booking.price : 0,
        visaRevenue: booking.normalizedPayment === "visa" ? booking.price : 0,
        walletRevenue: booking.normalizedPayment === "wallet" ? booking.price : 0,
        unknownRevenue: booking.normalizedPayment === "unknown" ? booking.price : 0,
        totalRevenue: booking.price,
        platformRevenue: booking.price * 0.2,
      });
      continue;
    }

    existing.completedBookings += 1;
    existing.totalRevenue += booking.price;
    existing.platformRevenue += booking.price * 0.2;
    if (booking.normalizedPayment === "cash") existing.cashRevenue += booking.price;
    if (booking.normalizedPayment === "visa") existing.visaRevenue += booking.price;
    if (booking.normalizedPayment === "wallet") existing.walletRevenue += booking.price;
    if (booking.normalizedPayment === "unknown") {
      existing.unknownRevenue += booking.price;
    }
  }

  const centersRows = [...byCenter.values()].sort(
    (a, b) => b.totalRevenue - a.totalRevenue
  );

  const centersRevenue = centerBookings.reduce((sum, booking) => sum + booking.price, 0);
  // Platform takes 20% of ALL center transactions; centers keep 80%
  const centersPlatformRevenue = centersRevenue * 0.2;
  const homeRevenue = homeBookings.reduce((sum, booking) => sum + booking.price, 0);

  const centerPaymentTotals = paymentTotalsFromBookings(centerBookings);
  const homePaymentTotals = paymentTotalsFromBookings(homeBookings);

  // Center payment breakdown
  const centerCashRevenue = centerPaymentTotals.cash;
  const centerEPaymentRevenue = centerPaymentTotals.visa + centerPaymentTotals.wallet;

  const totalCashRevenue = centerPaymentTotals.cash + homePaymentTotals.cash;
  const totalVisaRevenue = centerPaymentTotals.visa + homePaymentTotals.visa;
  const totalWalletRevenue = centerPaymentTotals.wallet + homePaymentTotals.wallet;
  const totalUnknownRevenue =
    centerPaymentTotals.unknown + homePaymentTotals.unknown;
  const knownPaymentRevenue =
    totalCashRevenue + totalVisaRevenue + totalWalletRevenue;

  const paymentBreakdown = [
    { method: "Cash", amount: totalCashRevenue },
    { method: "Visa", amount: totalVisaRevenue },
    { method: "Wallet", amount: totalWalletRevenue },
  ];

  const centerChartData = centersRows.map((row) => ({
    centerName: row.centerName,
    revenue: row.totalRevenue,
    platformRevenue: row.platformRevenue,
  }));

  const buckets = buildTrendBuckets(filter, now);
  const trendMap = new Map<string, TrendPoint>(
    buckets.map((bucket) => [
      bucket,
      {
        dateLabel: bucket,
        centerRevenue: 0,
        homeRevenue: 0,
        totalRevenue: 0,
      },
    ])
  );

  for (const booking of completedInRange) {
    const key = format(booking.bookingDate, "MMM d");
    const bucket = trendMap.get(key);
    if (!bucket) continue;
    if (booking.kind === "center") {
      bucket.centerRevenue += booking.price;
    } else {
      bucket.homeRevenue += booking.price;
    }
    bucket.totalRevenue += booking.price;
  }

  const trendData = [...trendMap.values()];

  return {
    centersRows,
    centersRevenue,
    centersPlatformRevenue,
    centerCashRevenue,
    centerEPaymentRevenue,
    centersCompletedBookings: centerBookings.length,
    homeRevenue,
    homeCompletedBookings: homeBookings.length,
    homeCashRevenue: homePaymentTotals.cash,
    homeVisaRevenue: homePaymentTotals.visa,
    homeWalletRevenue: homePaymentTotals.wallet,
    totalCashRevenue,
    totalVisaRevenue,
    totalWalletRevenue,
    totalUnknownRevenue,
    knownPaymentRevenue,
    paymentBreakdown,
    centerChartData,
    trendData,
    filteredCompletedCount: completedInRange.length,
  };
}
