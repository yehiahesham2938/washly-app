import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  clearSession,
  createBooking as apiCreateBooking,
  deleteBooking as apiDeleteBooking,
  deleteUser as apiDeleteUser,
  fetchAllBookings,
  fetchAllUsers,
  fetchMe,
  fetchMyBookings,
  getStoredToken,
  login as loginApi,
  patchBookingStatus,
  persistSession,
} from "@/services/api";
import { recordToBooking } from "@/lib/bookingMappers";
import type { Booking, BookingRecord, User } from "@/types";

type AuthContextValue = {
  authReady: boolean;
  user: User | null;
  allUsers: User[];
  bookings: Booking[];
  allBookingRecords: BookingRecord[];
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  applyAuthSession: (user: User, token: string) => void;
  logout: () => void;
  refreshBookings: () => Promise<void>;
  refreshAdminData: () => Promise<void>;
  addBooking: (
    booking: Omit<Booking, "id" | "createdAt" | "userId" | "status"> & {
      status?: Booking["status"];
    }
  ) => Promise<Booking>;
  updateBookingStatus: (id: string, status: BookingRecord["status"]) => Promise<void>;
  deleteBookingRecord: (id: string) => Promise<void>;
  deleteUserById: (id: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [bookingRecords, setBookingRecords] = useState<BookingRecord[]>([]);
  const [allBookingRecords, setAllBookingRecords] = useState<BookingRecord[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const refreshBookings = useCallback(async () => {
    if (!getStoredToken()) {
      setBookingRecords([]);
      return;
    }
    try {
      const list = await fetchMyBookings();
      setBookingRecords(list);
    } catch {
      setBookingRecords([]);
    }
  }, []);

  const refreshAdminData = useCallback(async () => {
    if (!getStoredToken()) {
      setAllBookingRecords([]);
      setAllUsers([]);
      return;
    }
    try {
      const [bookings, users] = await Promise.all([
        fetchAllBookings(),
        fetchAllUsers(),
      ]);
      setAllBookingRecords(bookings);
      setAllUsers(users);
    } catch {
      setAllBookingRecords([]);
      setAllUsers([]);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = getStoredToken();
      if (!token) {
        setUser(null);
        setAuthReady(true);
        return;
      }
      try {
        const me = await fetchMe();
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) {
          clearSession();
          setUser(null);
        }
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!authReady || !user) {
      setBookingRecords([]);
      setAllBookingRecords([]);
      setAllUsers([]);
      return;
    }
    let cancelled = false;
    (async () => {
      await refreshBookings();
      if (cancelled) return;
      if (user.role === "admin") {
        await refreshAdminData();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authReady, user?.id, user?.role, refreshBookings, refreshAdminData]);

  const bookings = useMemo(() => {
    if (!user) return [];
    return bookingRecords
      .filter((b) => b.userId === user.id)
      .map(recordToBooking);
  }, [bookingRecords, user]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { user: u, token } = await loginApi(email, password);
      persistSession(token);
      setUser(u);
      return { ok: true };
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : "Login failed",
      };
    }
  }, []);

  const applyAuthSession = useCallback((u: User, token: string) => {
    persistSession(token);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setBookingRecords([]);
    setAllBookingRecords([]);
    setAllUsers([]);
  }, []);

  const addBooking = useCallback(
    async (
      partial: Omit<Booking, "id" | "createdAt" | "userId" | "status"> & {
        status?: Booking["status"];
      }
    ) => {
      if (!user) throw new Error("Not authenticated");
      const statusLegacy = partial.status ?? "Confirmed";
      const body: Record<string, unknown> = {
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
        status: statusLegacy,
      };
      if (partial.kind === "home" && partial.serviceId) {
        body.packageId = partial.serviceId;
      }
      const record = await apiCreateBooking(body);
      setBookingRecords((prev) => [record, ...prev]);
      if (user.role === "admin") {
        setAllBookingRecords((prev) => [record, ...prev]);
      }
      return recordToBooking(record);
    },
    [user]
  );

  const updateBookingStatus = useCallback(
    async (id: string, status: BookingRecord["status"]) => {
      await patchBookingStatus(id, status);
      setAllBookingRecords((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b))
      );
      setBookingRecords((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b))
      );
    },
    []
  );

  const deleteBookingRecord = useCallback(async (id: string) => {
    await apiDeleteBooking(id);
    setAllBookingRecords((prev) => prev.filter((b) => b.id !== id));
    setBookingRecords((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const deleteUserById = useCallback(async (id: string) => {
    await apiDeleteUser(id);
    setAllUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      authReady,
      user,
      allUsers,
      bookings,
      allBookingRecords,
      login,
      applyAuthSession,
      logout,
      refreshBookings,
      refreshAdminData,
      addBooking,
      updateBookingStatus,
      deleteBookingRecord,
      deleteUserById,
    }),
    [
      authReady,
      user,
      allUsers,
      bookings,
      allBookingRecords,
      login,
      applyAuthSession,
      logout,
      refreshBookings,
      refreshAdminData,
      addBooking,
      updateBookingStatus,
      deleteBookingRecord,
      deleteUserById,
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
