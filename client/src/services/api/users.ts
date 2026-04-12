import type { User } from "@/types";

import { getJSON } from "./client";

export async function fetchAllUsers(): Promise<User[]> {
  return getJSON<User[]>("/api/users");
}

export async function deleteUser(id: string): Promise<void> {
  await getJSON(`/api/users/${encodeURIComponent(id)}`, { method: "DELETE" });
}
