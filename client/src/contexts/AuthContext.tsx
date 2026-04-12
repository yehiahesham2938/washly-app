import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Booking, User } from "@/types";

const USERS_KEY = "washly_users";
const BOOKINGS_KEY = "washly_bookings";
const SESSION_KEY = "washly_session";

function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as User[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function loadBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Booking[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveBookings(bookings: Booking[]) {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
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
  bookings: Booking[];
  login: (email: string, password: string) => boolean;
  signup: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => boolean;
  logout: () => void;
  addBooking: (booking: Omit<Booking, "id" | "createdAt" | "userId">) => Booking;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => loadUsers());
  const [bookings, setBookings] = useState<Booking[]>(() => loadBookings());
  const [sessionUserId, setSessionUserId] = useState<string | null>(() =>
    loadSessionUserId()
  );

  const user = useMemo(
    () => (sessionUserId ? users.find((u) => u.id === sessionUserId) ?? null : null),
    [users, sessionUserId]
  );

  const userBookings = useMemo(
    () =>
      user ? bookings.filter((b) => b.userId === user.id) : [],
    [bookings, user]
  );

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
    (partial: Omit<Booking, "id" | "createdAt" | "userId">) => {
      if (!user) throw new Error("Not authenticated");
      const booking: Booking = {
        ...partial,
        id: newId(),
        userId: user.id,
        createdAt: new Date().toISOString(),
      };
      const next = [...bookings, booking];
      setBookings(next);
      saveBookings(next);
      return booking;
    },
    [bookings, user]
  );

  const value = useMemo(
    () => ({
      user,
      bookings: userBookings,
      login,
      signup,
      logout,
      addBooking,
    }),
    [user, userBookings, login, signup, logout, addBooking]
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
