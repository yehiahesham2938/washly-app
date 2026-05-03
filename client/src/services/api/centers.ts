import type { WashCenter } from "@/types";

import { getJSON } from "./client";

export async function fetchCenters(): Promise<WashCenter[]> {
  return getJSON<WashCenter[]>("/api/centers");
}

/** Centers you own after an approved vendor request */
export async function fetchMyVendorCenters(): Promise<WashCenter[]> {
  return getJSON<WashCenter[]>("/api/centers/mine/vendor");
}

export async function createCenter(center: WashCenter): Promise<WashCenter> {
  return getJSON<WashCenter>("/api/centers", {
    method: "POST",
    body: JSON.stringify(center),
  });
}

export async function updateCenter(center: WashCenter): Promise<WashCenter> {
  return getJSON<WashCenter>(`/api/centers/${encodeURIComponent(center.id)}`, {
    method: "PUT",
    body: JSON.stringify(center),
  });
}

export async function deleteCenter(id: string): Promise<void> {
  await getJSON(`/api/centers/${encodeURIComponent(id)}`, { method: "DELETE" });
}
