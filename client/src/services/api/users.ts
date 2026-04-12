import type { User, UserRole } from "@/types";

import { getJSON } from "./client";

export async function fetchAllUsers(): Promise<User[]> {
  return getJSON<User[]>("/api/users");
}

export async function patchUserRole(
  id: string,
  role: UserRole
): Promise<User> {
  return getJSON<User>(`/api/users/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export async function deleteUser(id: string): Promise<void> {
  await getJSON(`/api/users/${encodeURIComponent(id)}`, { method: "DELETE" });
}
