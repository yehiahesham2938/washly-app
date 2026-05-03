import type { BookingRecord } from "@/types";

import { getJSON } from "./client";

/** Active (pending/confirmed) bookings for this center + service + date; completed frees the slot. */
export async function fetchOccupiedTimes(params: {
  centerId: string;
  serviceId: string;
  date: string;
}): Promise<{ occupiedTimes: string[] }> {
  const q = new URLSearchParams({
    centerId: params.centerId,
    serviceId: params.serviceId,
    date: params.date,
  });
  return getJSON(`/api/bookings/occupied-times?${q}`);
}

/** yyyy-MM-dd dates in that month where every slot is taken for this service. */
export async function fetchFullyBookedDates(params: {
  centerId: string;
  serviceId: string;
  year: number;
  month: number;
}): Promise<{ fullyBookedDates: string[] }> {
  const q = new URLSearchParams({
    centerId: params.centerId,
    serviceId: params.serviceId,
    year: String(params.year),
    month: String(params.month),
  });
  return getJSON(`/api/bookings/fully-booked-dates?${q}`);
}

export async function fetchMyBookings(): Promise<BookingRecord[]> {
  return getJSON<BookingRecord[]>("/api/bookings/me");
}

/** Center bookings for locations you own (vendor) */
export async function fetchBookingsForMyCenters(): Promise<BookingRecord[]> {
  return getJSON<BookingRecord[]>("/api/bookings/for-my-centers");
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
