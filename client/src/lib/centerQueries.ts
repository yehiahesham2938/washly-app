import type { Service, WashCenter } from "@/types";

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
