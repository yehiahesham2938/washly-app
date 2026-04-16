import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { format, isBefore, startOfDay } from "date-fns";
import { ArrowLeft, CalendarIcon } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  PaymentMethodSection,
  paymentLabelForNotes,
  paymentMethodToApi,
  type BookingPaymentMethod,
  type PaymentMethodSectionHandle,
} from "@/components/booking/PaymentMethodSection";
import { useAuth } from "@/contexts/AuthContext";
import { useCenters } from "@/contexts/CentersContext";
import {
  getCenterTimeSlotsForYmd,
  isYmdOpenForCenter,
} from "@/lib/centerScheduleSlots";
import { getServiceFromStores } from "@/lib/centerQueries";
import {
  fetchFullyBookedDates,
  fetchOccupiedTimes,
} from "@/services/api/bookings";
import { formatEgp } from "@/lib/currency";
import {
  totalPrice,
  vehicleSurcharge,
  VEHICLE_SURCHARGE_EGP,
} from "@/lib/pricing";
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
  const [payment, setPayment] = useState<BookingPaymentMethod>("card");
  const paymentSectionRef = useRef<PaymentMethodSectionHandle>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicle, setVehicle] = useState<VehicleType>("Sedan");
  const [notes, setNotes] = useState("");
  const [occupiedTimes, setOccupiedTimes] = useState<string[]>([]);
  const [fullyBookedDates, setFullyBookedDates] = useState<Set<string>>(
    () => new Set()
  );

  const timeSlots = useMemo(() => {
    if (!resolved || !date) return [];
    return getCenterTimeSlotsForYmd(
      resolved.center,
      format(date, "yyyy-MM-dd")
    );
  }, [resolved, date]);

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
    const run = () => {
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
    };
    run();
    const onFocus = () => run();
    const onVis = () => {
      if (document.visibilityState === "visible") run();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [centerId, serviceId, date]);

  useEffect(() => {
    if (!resolved || !date) return;
    const slots = getCenterTimeSlotsForYmd(
      resolved.center,
      format(date, "yyyy-MM-dd")
    );
    setTime((prev) => (prev && slots.includes(prev) ? prev : ""));
  }, [resolved, date]);

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
      `Payment: ${paymentLabelForNotes(payment)}`,
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
    if (!name.trim() || !phone.trim()) {
      toast.error("Please complete all personal information fields");
      return;
    }
    if (!date || !time) {
      toast.error("Please select a date and time");
      return;
    }
    const slotOptions = getCenterTimeSlotsForYmd(
      center,
      format(date, "yyyy-MM-dd")
    );
    if (!slotOptions.includes(time)) {
      toast.error("Choose a time within this center's working hours");
      return;
    }
    if (occupiedTimes.includes(time)) {
      toast.error("This time slot is no longer available");
      return;
    }
    if (!paymentSectionRef.current?.validateMockInputs()) {
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
        price,
        status: "Confirmed",
        paymentMethod: paymentMethodToApi(payment),
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
              <div className="text-2xl font-bold text-primary">
                {formatEgp(price)}
              </div>
              {surcharge > 0 && (
                <div className="text-xs text-muted-foreground">
                  {formatEgp(service.price)} service + {formatEgp(surcharge)}{" "}
                  vehicle add-on
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
                      if (!isYmdOpenForCenter(center, ymd)) return true;
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
              {!date ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  Pick a date to see available times for this center.
                </p>
              ) : timeSlots.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  This center is closed on that day.
                </p>
              ) : (
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
              )}
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
                  <SelectItem value="SUV">
                    SUV (+{formatEgp(VEHICLE_SURCHARGE_EGP.SUV)})
                  </SelectItem>
                  <SelectItem value="Truck">
                    Truck (+{formatEgp(VEHICLE_SURCHARGE_EGP.Truck)})
                  </SelectItem>
                  <SelectItem value="Van">
                    Van (+{formatEgp(VEHICLE_SURCHARGE_EGP.Van)})
                  </SelectItem>
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

        <PaymentMethodSection
          ref={paymentSectionRef}
          idPrefix="center-booking"
          payment={payment}
          onPaymentChange={setPayment}
        />

        <Button type="submit" size="lg" className="w-full">
          Confirm Booking — {formatEgp(price)}
        </Button>
      </form>
    </div>
  );
}
