import type { BookingPaymentMethod, BookingRecord } from "@/types";

export type AnalyticsPaymentMethod = "cash" | "visa" | "wallet" | "unknown";

function methodFromNotes(notes?: string): AnalyticsPaymentMethod {
  const lower = notes?.toLowerCase() ?? "";
  if (lower.includes("payment: credit card")) return "visa";
  if (lower.includes("payment: digital wallet")) return "wallet";
  if (lower.includes("payment: cash")) return "cash";
  return "unknown";
}

export function normalizeBookingPaymentMethod(
  method: BookingPaymentMethod | undefined,
  notes?: string
): AnalyticsPaymentMethod {
  if (method === "cash") return "cash";
  if (method === "wallet") return "wallet";
  if (method === "card" || method === "visa") return "visa";
  return methodFromNotes(notes);
}

export function bookingPaymentLabel(record: BookingRecord): string {
  const normalized = normalizeBookingPaymentMethod(
    record.paymentMethod,
    record.notes
  );
  if (normalized === "visa") return "Visa";
  if (normalized === "wallet") return "Wallet";
  if (normalized === "cash") return "Cash";
  return "Unspecified";
}
