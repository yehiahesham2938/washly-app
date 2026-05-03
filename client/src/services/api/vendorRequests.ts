import type { VendorCenterRequest, WashCenter } from "@/types";

import { getJSON } from "./client";

export async function submitVendorRequest(body: {
  centerDraft: Omit<WashCenter, "id"> & { id?: string };
  gallery?: string[];
}): Promise<VendorCenterRequest> {
  return getJSON<VendorCenterRequest>("/api/vendor-requests", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function fetchMyVendorRequests(): Promise<VendorCenterRequest[]> {
  return getJSON<VendorCenterRequest[]>("/api/vendor-requests/me");
}

export async function fetchAllVendorRequests(): Promise<VendorCenterRequest[]> {
  return getJSON<VendorCenterRequest[]>("/api/vendor-requests");
}

export async function approveVendorRequest(
  id: string
): Promise<VendorCenterRequest> {
  return getJSON<VendorCenterRequest>(
    `/api/vendor-requests/${encodeURIComponent(id)}/approve`,
    { method: "PATCH", body: "{}" }
  );
}

export async function rejectVendorRequest(
  id: string
): Promise<VendorCenterRequest> {
  return getJSON<VendorCenterRequest>(
    `/api/vendor-requests/${encodeURIComponent(id)}/reject`,
    { method: "PATCH", body: "{}" }
  );
}
