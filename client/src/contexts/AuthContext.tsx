import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { legacyStatusToRecord, recordToBooking } from "@/lib/bookingMappers";
import { newId } from "@/lib/id";
import { KEYS, getData, setData } from "@/services/storage";
import type { Booking, BookingRecord, User } from "@/types";

const SESSION_KEY = "washly_session";

function inferRole(email: string): User["role"] {
  return email.trim().toLowerCase().endsWith("@admin.com") ? "admin" : "user";
}

function loadUsers(): User[] {
  const raw =
    getData<(User & { role?: User["role"] })[]>(KEYS.users) ?? [];
  return raw.map((u) => ({
    ...u,
    role: u.role ?? inferRole(u.email),
  }));
}

function saveUsers(users: User[]) {
  setData(KEYS.users, users);
}

function loadBookingRecords(): BookingRecord[] {
  return getData<BookingRecord[]>(KEYS.bookings) ?? [];
}

function saveBookingRecords(bookings: BookingRecord[]) {
  setData(KEYS.bookings, bookings);
}

function loadSessionUserId(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

function saveSessionUserId(id: string | null) {
  if (id) localStorage.setItem(SESSION_KEY, id);
  else localStorage.removeItem(SESSION_KEY);
}

type AuthContextValue = {
  user: User | null;
  allUsers: User[];
  bookings: Booking[];
  allBookingRecords: BookingRecord[];
  login: (email: string, password: string) => boolean;
  signup: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => boolean;
  logout: () => void;
  addBooking: (
    booking: Omit<Booking, "id" | "createdAt" | "userId" | "status"> & {
      status?: Booking["status"];
    }
  ) => Booking;
  /** Replace all booking records (admin) */
  setAllBookingRecords: (next: BookingRecord[]) => void;
  /** Update users list (admin) */
  setAllUsers: (next: User[]) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => loadUsers());
  const [bookingRecords, setBookingRecords] = useState<BookingRecord[]>(() =>
    loadBookingRecords()
  );
  const [sessionUserId, setSessionUserId] = useState<string | null>(() =>
    loadSessionUserId()
  );

  const user = useMemo(
    () =>
      sessionUserId ? users.find((u) => u.id === sessionUserId) ?? null : null,
    [users, sessionUserId]
  );

  const bookings = useMemo(() => {
    if (!user) return [];
    return bookingRecords
      .filter((b) => b.userId === user.id)
      .map(recordToBooking);
  }, [bookingRecords, user]);

  const login = useCallback(
    (email: string, password: string) => {
      const found = users.find(
        (u) =>
          u.email.toLowerCase() === email.trim().toLowerCase() &&
          u.password === password
      );
      if (!found) return false;
      setSessionUserId(found.id);
      saveSessionUserId(found.id);
      return true;
    },
    [users]
  );

  const signup = useCallback(
    (data: {
      name: string;
      email: string;
      phone: string;
      password: string;
    }) => {
      const email = data.email.trim().toLowerCase();
      if (users.some((u) => u.email.toLowerCase() === email)) return false;
      const newUser: User = {
        id: newId(),
        name: data.name.trim(),
        email,
        phone: data.phone.trim(),
        password: data.password,
        role: inferRole(email),
      };
      const next = [...users, newUser];
      setUsers(next);
      saveUsers(next);
      setSessionUserId(newUser.id);
      saveSessionUserId(newUser.id);
      return true;
    },
    [users]
  );

  const logout = useCallback(() => {
    setSessionUserId(null);
    saveSessionUserId(null);
  }, []);

  const addBooking = useCallback(
    (
      partial: Omit<Booking, "id" | "createdAt" | "userId" | "status"> & {
        status?: Booking["status"];
      }
    ) => {
      if (!user) throw new Error("Not authenticated");
      const statusLegacy = partial.status ?? "Confirmed";
      const record: BookingRecord = {
        id: newId(),
        userId: user.id,
        userEmail: user.email,
        kind: partial.kind,
        centerId: partial.centerId,
        centerName: partial.centerName,
        serviceId: partial.serviceId,
        serviceName: partial.serviceName,
        date: partial.date,
        time: partial.time,
        vehicle: partial.vehicle,
        notes: partial.notes,
        address: partial.address,
        price: partial.price,
        status: legacyStatusToRecord(statusLegacy),
        createdAt: new Date().toISOString(),
      };
      const next = [...bookingRecords, record];
      setBookingRecords(next);
      saveBookingRecords(next);
      return recordToBooking(record);
    },
    [bookingRecords, user]
  );

  const setAllBookingRecords = useCallback((next: BookingRecord[]) => {
    setBookingRecords(next);
    saveBookingRecords(next);
  }, []);

  const setAllUsers = useCallback((next: User[]) => {
    setUsers(next);
    saveUsers(next);
  }, []);

  const value = useMemo(
    () => ({
      user,
      allUsers: users,
      bookings,
      allBookingRecords: bookingRecords,
      login,
      signup,
      logout,
      addBooking,
      setAllBookingRecords,
      setAllUsers,
    }),
    [
      user,
      users,
      bookings,
      bookingRecords,
      login,
      signup,
      logout,
      addBooking,
      setAllBookingRecords,
      setAllUsers,
    ]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
