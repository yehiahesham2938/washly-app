import { washCenters } from "@/data/washCenters";
import { KEYS, getData, setData } from "@/services/storage";
import type { BookingRecord, User } from "@/types";

const LEGACY_USERS = "washly_users";
const LEGACY_BOOKINGS = "washly_bookings";

function inferRole(email: string): "admin" | "user" {
  return email.trim().toLowerCase().endsWith("@admin.com") ? "admin" : "user";
}

function mapLegacyStatus(
  s: string
): BookingRecord["status"] {
  const x = s.toLowerCase();
  if (x === "pending") return "pending";
  if (x === "confirmed") return "confirmed";
  if (x === "completed") return "completed";
  if (x === "cancelled") return "cancelled";
  if (s === "Pending") return "pending";
  if (s === "Confirmed") return "confirmed";
  if (s === "Completed") return "completed";
  return "confirmed";
}

function readLegacy<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Run once on app bootstrap (before React tree) */
export function migrateStorageOnce() {
  if (localStorage.getItem(KEYS.users) === null) {
    const legacy = readLegacy<Omit<User, "role">[]>(LEGACY_USERS);
    if (legacy?.length) {
      const migrated: User[] = legacy.map((u) => ({
        ...u,
        role: inferRole(u.email),
      }));
      setData(KEYS.users, migrated);
    } else {
      setData(KEYS.users, [] as User[]);
    }
  }

  if (localStorage.getItem(KEYS.centers) === null) {
    setData(KEYS.centers, washCenters);
  }

  if (localStorage.getItem(KEYS.bookings) === null) {
    const users = getData<User[]>(KEYS.users) ?? [];
    const emailById = new Map(users.map((u) => [u.id, u.email]));
    const legacyB = readLegacy<
      Array<{
        id: string;
        userId: string;
        kind: string;
        centerId?: string;
        centerName?: string;
        serviceId?: string;
        serviceName: string;
        date: string;
        time: string;
        vehicle: string;
        notes?: string;
        address?: string;
        price: number;
        status: string;
        createdAt: string;
      }>
    >(LEGACY_BOOKINGS);

    if (legacyB?.length) {
      const next: BookingRecord[] = legacyB.map((b) => ({
        id: b.id,
        userId: b.userId,
        userEmail: emailById.get(b.userId) ?? "unknown@user.local",
        kind: b.kind === "home" ? "home" : "center",
        centerId: b.centerId,
        centerName: b.centerName,
        serviceId: b.serviceId,
        serviceName: b.serviceName,
        date: b.date,
        time: b.time,
        vehicle: b.vehicle,
        notes: b.notes,
        address: b.address,
        price: b.price,
        status: mapLegacyStatus(b.status),
        createdAt: b.createdAt,
      }));
      setData(KEYS.bookings, next);
    } else {
      setData(KEYS.bookings, [] as BookingRecord[]);
    }
  }
}
