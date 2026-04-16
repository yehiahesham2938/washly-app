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

/** Open days for the center (same open/close window on each). */
export type Weekday =
  | "Mon"
  | "Tue"
  | "Wed"
  | "Thu"
  | "Fri"
  | "Sat"
  | "Sun";

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
  /** Which days of the week the center is open (optional for legacy data). */
  workingDays?: Weekday[];
  /** Detail page blurb */
  description?: string;
  services: Service[];
}

export type BookingStatus =
  | "Confirmed"
  | "Completed"
  | "Pending"
  | "Cancelled";
export type BookingKind = "center" | "home";

/** Stored booking (API / admin) */
export type BookingRecordStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface BookingRecord {
  id: string;
  userId: string;
  userEmail: string;
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
  status: BookingRecordStatus;
  createdAt: string;
}

/** Legacy display shape for user dashboard (derived from BookingRecord) */
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

export type UserRole = "admin" | "user";

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
}

/** Home wash packages from GET /api/home-packages */
export interface HomePackage {
  id: string;
  name: string;
  description: string;
  durationMin: number;
  price: number;
  features: string[];
}

export type VehicleType = "Sedan" | "SUV" | "Truck" | "Van";
