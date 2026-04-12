/** localStorage keys (spec) */
export const KEYS = {
  users: "users",
  centers: "centers",
  bookings: "bookings",
} as const;

export function getData<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setData<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("washly-storage"));
}

export function removeData(key: string): void {
  localStorage.removeItem(key);
}
