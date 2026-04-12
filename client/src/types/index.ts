export type Area =
  | "Downtown"
  | "Suburbs"
  | "Waterfront"
  | "Northside"
  | "East End"
  | "Westside";

export interface Service {
  id: string;
  name: string;
  description: string;
  durationMin: number;
  price: number;
}

export interface WashCenter {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  area: Area;
  /** Full street address */
  address: string;
  /** Short line for cards, e.g. "Downtown, 5th Avenue" */
  locationLine?: string;
  phone: string;
  hours: string;
  /** Short hours for metadata row, e.g. "8:00 AM – 8:00 PM" */
  hoursShort?: string;
  /** Detail page blurb */
  description?: string;
  services: Service[];
}

export type BookingStatus = "Confirmed" | "Completed" | "Pending";
export type BookingKind = "center" | "home";

export interface Booking {
  id: string;
  userId: string;
  kind: BookingKind;
  centerId?: string;
  centerName?: string;
  serviceId?: string;
  serviceName: string;
  date: string;
  time: string;
  vehicle: string;
  notes?: string;
  address?: string;
  price: number;
  status: BookingStatus;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  password: string;
}

export type VehicleType = "Sedan" | "SUV" | "Truck" | "Van";
