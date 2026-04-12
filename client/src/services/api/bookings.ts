import type { BookingRecord } from "@/types";

import { getJSON } from "./client";

export async function fetchMyBookings(): Promise<BookingRecord[]> {
  return getJSON<BookingRecord[]>("/api/bookings/me");
}

export async function createBooking(
  body: Record<string, unknown>
): Promise<BookingRecord> {
  return getJSON<BookingRecord>("/api/bookings", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function fetchAllBookings(): Promise<BookingRecord[]> {
  return getJSON<BookingRecord[]>("/api/bookings");
}

export async function patchBookingStatus(
  id: string,
  status: BookingRecord["status"]
): Promise<BookingRecord> {
  return getJSON<BookingRecord>(`/api/bookings/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function deleteBooking(id: string): Promise<void> {
  await getJSON(`/api/bookings/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
