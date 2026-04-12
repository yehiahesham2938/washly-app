import type { VehicleType } from "@/types";

export function vehicleSurcharge(vehicle: VehicleType): number {
  switch (vehicle) {
    case "Sedan":
      return 0;
    case "SUV":
      return 10;
    case "Truck":
      return 15;
    case "Van":
      return 12;
    default:
      return 0;
  }
}

export function totalPrice(base: number, vehicle: VehicleType): number {
  return base + vehicleSurcharge(vehicle);
}
