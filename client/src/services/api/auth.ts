import type { User } from "@/types";

import {
  apiRequest,
  getJSON,
  parseError,
  setStoredToken,
} from "./client";

export function persistSession(token: string) {
  setStoredToken(token);
}

export function clearSession() {
  setStoredToken(null);
}

export async function login(
  email: string,
  password: string
): Promise<{ user: User; token: string }> {
  const res = await apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<{ user: User; token: string }>;
}

export async function register(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<{ user: User; token: string }> {
  const body = {
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone.trim(),
    password: data.password,
  };
  const res = await apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<{ user: User; token: string }>;
}

export async function fetchMe(): Promise<User> {
  const data = await getJSON<{ user: User }>("/api/auth/me");
  return data.user;
}
