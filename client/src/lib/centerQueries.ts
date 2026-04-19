import { centerMinPriceForSort } from "@/data/washCenters";
import type { Service, WashCenter } from "@/types";

export type CenterSortKey =
  | "rating"
  | "price_low"
  | "price_high"
  | "reviews";

/** Stable compare for centers list (handles string/undefined from API). */
export function compareWashCentersBySort(
  a: WashCenter,
  b: WashCenter,
  sort: CenterSortKey
): number {
  const rating = (c: WashCenter) => {
    const n = Number(c.rating);
    return Number.isFinite(n) ? n : 0;
  };
  const reviews = (c: WashCenter) => {
    const n = Number(c.reviewCount);
    return Number.isFinite(n) ? Math.trunc(n) : 0;
  };
  const nameCmp = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });

  let cmp = 0;
  if (sort === "rating") {
    cmp = rating(b) - rating(a);
  } else if (sort === "price_low") {
    cmp = centerMinPriceForSort(a) - centerMinPriceForSort(b);
  } else if (sort === "price_high") {
    /** Same metric as “From” on cards: min service price, high → low. No services → last. */
    const minEntry = (c: WashCenter) => {
      const m = centerMinPriceForSort(c);
      return m === Number.POSITIVE_INFINITY ? Number.NEGATIVE_INFINITY : m;
    };
    cmp = minEntry(b) - minEntry(a);
  } else if (sort === "reviews") {
    cmp = reviews(b) - reviews(a);
    if (cmp === 0) cmp = rating(b) - rating(a);
  }

  if (!Number.isFinite(cmp)) return nameCmp;
  if (cmp !== 0) return cmp;
  return nameCmp;
}

export function findCenterById(
  centers: WashCenter[],
  id: string | undefined
): WashCenter | undefined {
  if (!id) return undefined;
  return centers.find((c) => c.id === id);
}

export function getServiceFromStores(
  centers: WashCenter[],
  centerId: string,
  serviceId: string
): { center: WashCenter; service: Service } | undefined {
  const center = findCenterById(centers, centerId);
  if (!center) return undefined;
  const service = center.services.find((s) => s.id === serviceId);
  if (!service) return undefined;
  return { center, service };
}
