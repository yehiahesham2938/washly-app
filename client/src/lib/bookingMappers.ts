import type { Booking, BookingRecord, BookingRecordStatus } from "@/types";

function statusRecordToLegacy(s: BookingRecordStatus): Booking["status"] {
  switch (s) {
    case "pending":
      return "Pending";
    case "confirmed":
      return "Confirmed";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return "Confirmed";
  }
}

export function recordToBooking(r: BookingRecord): Booking {
  return {
    id: r.id,
    userId: r.userId,
    kind: r.kind,
    centerId: r.centerId,
    centerName: r.centerName,
    serviceId: r.serviceId,
    serviceName: r.serviceName,
    date: r.date,
    time: r.time,
    vehicle: r.vehicle,
    notes: r.notes,
    address: r.address,
    price: r.price,
    status: statusRecordToLegacy(r.status),
    createdAt: r.createdAt,
  };
}

export function legacyStatusToRecord(
  s: Booking["status"]
): BookingRecordStatus {
  switch (s) {
    case "Pending":
      return "pending";
    case "Confirmed":
      return "confirmed";
    case "Completed":
      return "completed";
    case "Cancelled":
      return "cancelled";
    default:
      return "confirmed";
  }
}
