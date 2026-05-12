import type { HomePackage } from "@/types";

import { getJSON } from "./client";

export async function fetchHomePackages(): Promise<HomePackage[]> {
  return getJSON<HomePackage[]>("/api/home-packages");
}

export async function createHomePackage(
  data: Omit<HomePackage, "id">
): Promise<HomePackage> {
  return getJSON<HomePackage>("/api/home-packages", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateHomePackage(
  id: string,
  data: Partial<Omit<HomePackage, "id">>
): Promise<HomePackage> {
  return getJSON<HomePackage>(`/api/home-packages/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteHomePackage(id: string): Promise<void> {
  await getJSON(`/api/home-packages/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
