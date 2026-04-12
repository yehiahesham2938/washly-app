import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { format, isBefore, startOfDay } from "date-fns";
import {
  ArrowLeft,
  Banknote,
  CalendarIcon,
  CreditCard,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useCenters } from "@/contexts/CentersContext";
import { getServiceFromStores } from "@/lib/centerQueries";
import { getTimeSlots } from "@/lib/timeSlots";
import {
  fetchFullyBookedDates,
  fetchOccupiedTimes,
} from "@/services/api/bookings";
import { totalPrice, vehicleSurcharge } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import type { VehicleType } from "@/types";

export function Booking() {
  const { centerId, serviceId } = useParams();
  const navigate = useNavigate();
  const { addBooking, user } = useAuth();
  const { centers } = useCenters();

  const resolved = useMemo(() => {
    if (!centerId || !serviceId) return undefined;
    return getServiceFromStores(centers, centerId, serviceId);
  }, [centers, centerId, serviceId]);

  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState("");
  const [payment, setPayment] = useState("card");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [vehicle, setVehicle] = useState<VehicleType>("Sedan");
  const [notes, setNotes] = useState("");
  const [occupiedTimes, setOccupiedTimes] = useState<string[]>([]);
  const [fullyBookedDates, setFullyBookedDates] = useState<Set<string>>(
    () => new Set()
  );

  const timeSlots = useMemo(() => getTimeSlots(), []);

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? "");
    setPhone(user.phone ?? "");
  }, [user?.id, user?.name, user?.phone]);

  useEffect(() => {
    if (!centerId || !serviceId) return;
    let cancelled = false;
    const y = calendarMonth.getFullYear();
    const m = calendarMonth.getMonth() + 1;
    fetchFullyBookedDates({ centerId, serviceId, year: y, month: m })
      .then(({ fullyBookedDates: list }) => {
        if (!cancelled) setFullyBookedDates(new Set(list));
      })
      .catch(() => {
        if (!cancelled) setFullyBookedDates(new Set());
      });
    return () => {
      cancelled = true;
    };
  }, [centerId, serviceId, calendarMonth]);

  useEffect(() => {
    if (!centerId || !serviceId || !date) {
      setOccupiedTimes([]);
      return;
    }
    const ds = format(date, "yyyy-MM-dd");
    let cancelled = false;
    fetchOccupiedTimes({ centerId, serviceId, date: ds })
      .then(({ occupiedTimes: taken }) => {
        if (!cancelled) {
          setOccupiedTimes(taken);
          setTime((prev) => (prev && taken.includes(prev) ? "" : prev));
        }
      })
      .catch(() => {
        if (!cancelled) setOccupiedTimes([]);
      });
    return () => {
      cancelled = true;
    };
  }, [centerId, serviceId, date]);

  if (!resolved) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-foreground">Booking not found</h2>
        <Button asChild className="mt-4">
          <Link to="/centers">Browse Centers</Link>
        </Button>
      </div>
    );
  }

  const { center, service } = resolved;
  const price = totalPrice(service.price, vehicle);
  const surcharge = vehicleSurcharge(vehicle);

  function composeNotesForBooking(): string | undefined {
    const lines = [
      `Contact: ${name.trim()} · ${phone.trim()}`,
      `Payment: ${payment === "card" ? "Credit card" : "Cash"}`,
      notes.trim() || null,
    ].filter(Boolean) as string[];
    return lines.length ? lines.join("\n\n") : undefined;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to confirm your booking");
      return;
    }
    if (!name.trim() || !phone.trim() || !address.trim()) {
      toast.error("Please complete all personal information fields");
      return;
    }
    if (!date || !time) {
      toast.error("Please select a date and time");
      return;
    }
    if (occupiedTimes.includes(time)) {
      toast.error("This time slot is no longer available");
      return;
    }
    try {
      const booking = await addBooking({
        kind: "center",
        centerId: center.id,
        centerName: center.name,
        serviceId: service.id,
        serviceName: service.name,
        date: format(date, "yyyy-MM-dd"),
        time,
        vehicle,
        notes: composeNotesForBooking(),
        address: address.trim(),
        price,
        status: "Confirmed",
        paymentMethod: payment === "card" ? "card" : "cash",
        contactName: name.trim(),
        contactPhone: phone.trim(),
      });
      navigate("/confirmation", { state: { booking } });
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to save booking. Please try again."
      );
    }
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Button asChild variant="ghost" size="sm" className="mb-4 gap-1">
        <Link to={`/centers/${center.id}`}>
          <ArrowLeft className="h-4 w-4" /> Back to {center.name}
        </Link>
      </Button>

      <h1 className="text-3xl font-bold text-foreground">Book Your Wash</h1>
      <p className="mt-1 text-muted-foreground">
        Complete the form below to schedule your appointment
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* Summary Card */}
        <Card className="card-shadow">
          <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
            <div>
              <div className="text-sm text-muted-foreground">{center.name}</div>
              <div className="text-lg font-semibold text-card-foreground">
                {service.name}
              </div>
              <div className="text-sm text-muted-foreground">
                {service.durationMin} min · {service.description}
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-2xl font-bold text-primary">${price}</div>
              {surcharge > 0 && (
                <div className="text-xs text-muted-foreground">
                  Service ${service.price} + ${surcharge} vehicle
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card className="card-shadow">
          <CardContent className="space-y-4 p-5">
            <h3 className="font-semibold text-card-foreground">
              Personal Information
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                  required
                  autoComplete="name"
                  aria-required
                />
              </div>
              <div>
                <Label htmlFor="phone">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 555-0100"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1"
                  required
                  autoComplete="tel"
                  aria-required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address" className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> Your address{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="address"
                placeholder="123 Main St, City, ZIP"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1"
                rows={2}
                required
                aria-required
              />
            </div>
          </CardContent>
        </Card>

        {/* Date & Time */}
        <Card className="card-shadow">
          <CardContent className="space-y-4 p-5">
            <h3 className="font-semibold text-card-foreground">
              Select Date & Time
            </h3>
            <div>
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "mt-1 w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    month={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    selected={date}
                    onSelect={setDate}
                    disabled={(d) => {
                      const day = startOfDay(d);
                      if (isBefore(day, startOfDay(new Date()))) return true;
                      const ymd = format(d, "yyyy-MM-dd");
                      return fullyBookedDates.has(ymd);
                    }}
                    initialFocus
                    className="pointer-events-auto p-3"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Time Slot</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {timeSlots.map((t) => {
                  const taken = occupiedTimes.includes(t);
                  return (
                    <Button
                      key={t}
                      type="button"
                      size="sm"
                      variant={time === t ? "default" : "outline"}
                      disabled={taken}
                      title={taken ? "This slot is already booked" : undefined}
                      onClick={() => setTime(t)}
                    >
                      {t}
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle & notes — notes section kept */}
        <Card className="card-shadow">
          <CardContent className="space-y-4 p-5">
            <h3 className="font-semibold text-card-foreground">
              Vehicle & notes
            </h3>
            <div className="space-y-2">
              <Label htmlFor="vehicle">Vehicle type</Label>
              <Select
                value={vehicle}
                onValueChange={(v) => setVehicle(v as VehicleType)}
              >
                <SelectTrigger id="vehicle">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sedan">Sedan</SelectItem>
                  <SelectItem value="SUV">SUV (+$10)</SelectItem>
                  <SelectItem value="Truck">Truck (+$15)</SelectItem>
                  <SelectItem value="Van">Van (+$12)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Gate code, preferred bay, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment */}
        <Card className="card-shadow">
          <CardContent className="space-y-4 p-5">
            <h3 className="font-semibold text-card-foreground">
              Payment Method
            </h3>
            <RadioGroup
              value={payment}
              onValueChange={setPayment}
              className="grid gap-3 sm:grid-cols-2"
            >
              {(
                [
                  { val: "card", label: "Credit Card", icon: CreditCard },
                  { val: "cash", label: "Cash", icon: Banknote },
                ] as const
              ).map((p) => (
                <Label
                  key={p.val}
                  htmlFor={`booking-pay-${p.val}`}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors",
                    payment === p.val
                      ? "border-primary bg-accent"
                      : "border-border hover:bg-muted"
                  )}
                >
                  <RadioGroupItem value={p.val} id={`booking-pay-${p.val}`} />
                  <p.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{p.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full">
          Confirm Booking — ${price}
        </Button>
      </form>
    </div>
  );
}
