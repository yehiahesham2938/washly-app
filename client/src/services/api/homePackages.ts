import type { HomePackage } from "@/types";

import { getJSON } from "./client";

export async function fetchHomePackages(): Promise<HomePackage[]> {
  return getJSON<HomePackage[]>("/api/home-packages");
}
