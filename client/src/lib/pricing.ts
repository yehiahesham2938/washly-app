import type { VehicleType } from "@/types";

/** Vehicle add-ons (EGP); same ratio as prior tier (÷10 with 200 EGP floor on services). */
export const VEHICLE_SURCHARGE_EGP: Record<VehicleType, number> = {
  Sedan: 0,
  SUV: 150,
  Truck: 250,
  Van: 188,
};

export function vehicleSurcharge(vehicle: VehicleType): number {
  return VEHICLE_SURCHARGE_EGP[vehicle] ?? 0;
}

export function totalPrice(base: number, vehicle: VehicleType): number {
  return base + vehicleSurcharge(vehicle);
}
