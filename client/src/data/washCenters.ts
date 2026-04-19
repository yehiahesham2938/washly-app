import type { Service, WashCenter } from "@/types";

export const areas = [
  "All",
  "Downtown",
  "Suburbs",
  "Westside",
  "Waterfront",
  "Northside",
  "East End",
] as const;

/** Valid non-negative numeric prices from a services list (API may send strings). */
export function servicePricesNumeric(
  services: Service[] | undefined | null
): number[] {
  if (!services?.length) return [];
  return services
    .map((s) => Number(s.price))
    .filter((p) => Number.isFinite(p) && p >= 0);
}

/** Lowest service price in this list — used for “From” / “Starting from”. */
export function lowestServicePriceForServices(
  services: Service[] | undefined | null
): number {
  const prices = servicePricesNumeric(services);
  return prices.length ? Math.min(...prices) : 0;
}

/** Lowest service price at this center (same as “From” on cards). */
export function lowestServicePriceAtCenter(center: WashCenter): number {
  return lowestServicePriceForServices(center.services);
}

/** @see lowestServicePriceAtCenter */
export function centerMinPrice(center: WashCenter): number {
  return lowestServicePriceAtCenter(center);
}

function minServicePrices(center: WashCenter): number[] {
  return servicePricesNumeric(center.services);
}

/**
 * For sorting by “lowest price”: centers with no priced services sort last,
 * not first (avoid treating “no services” as EGP 0).
 */
export function centerMinPriceForSort(center: WashCenter): number {
  const prices = minServicePrices(center);
  return prices.length ? Math.min(...prices) : Number.POSITIVE_INFINITY;
}

/** Default home spotlight order (matches marketing layout) */
const HOME_SPOTLIGHT_IDS = ["c1", "c2", "c3"] as const;

export function getHomeSpotlightCenters(centers: WashCenter[]): WashCenter[] {
  return HOME_SPOTLIGHT_IDS.map((id) => centers.find((c) => c.id === id)).filter(
    (c): c is WashCenter => Boolean(c)
  );
}
