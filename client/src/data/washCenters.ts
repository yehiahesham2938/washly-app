import type { WashCenter } from "@/types";

export const areas = [
  "All",
  "Downtown",
  "Suburbs",
  "Westside",
  "Waterfront",
  "Northside",
  "East End",
] as const;

export function centerMinPrice(center: WashCenter): number {
  if (!center.services.length) return 0;
  return Math.min(...center.services.map((s) => s.price));
}

/** Default home spotlight order (matches marketing layout) */
const HOME_SPOTLIGHT_IDS = ["c1", "c2", "c3"] as const;

export function getHomeSpotlightCenters(centers: WashCenter[]): WashCenter[] {
  return HOME_SPOTLIGHT_IDS.map((id) => centers.find((c) => c.id === id)).filter(
    (c): c is WashCenter => Boolean(c)
  );
}
