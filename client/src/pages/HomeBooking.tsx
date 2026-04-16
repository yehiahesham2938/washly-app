import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, CalendarIcon, Check, MapPin } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
import { WashlyLogo } from "@/components/WashlyLogo";
import { useAuth } from "@/contexts/AuthContext";
import { getTimeSlots } from "@/lib/timeSlots";
import { formatEgp } from "@/lib/currency";
import {
  totalPrice,
  vehicleSurcharge,
  VEHICLE_SURCHARGE_EGP,
} from "@/lib/pricing";
import { fetchHomePackages } from "@/services/api/homePackages";
import { cn } from "@/lib/utils";
import type { HomePackage, VehicleType } from "@/types";

export function HomeBooking() {
  const navigate = useNavigate();
  const { addBooking, user } = useAuth();

  const [packages, setPackages] = useState<HomePackage[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [selectedService, setSelectedService] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState("");
  const [payment, setPayment] = useState<BookingPaymentMethod>("card");
  const paymentSectionRef = useRef<PaymentMethodSectionHandle>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [vehicle, setVehicle] = useState<VehicleType>("Sedan");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchHomePackages()
      .then((list) => {
        if (cancelled) return;
        setPackages(list);
        if (list[0]) setSelectedService((prev) => prev || list[0].id);
      })
      .catch(() => {
        toast.error("Could not load home wash packages");
      })
      .finally(() => {
        if (!cancelled) setPackagesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const service = useMemo((): HomePackage | undefined => {
    return packages.find((s) => s.id === selectedService) ?? packages[0];
  }, [packages, selectedService]);

  const timeSlots = useMemo(() => getTimeSlots(), []);

  const price = service ? totalPrice(service.price, vehicle) : 0;
  const surcharge = vehicleSurcharge(vehicle);

  function composeNotesForBooking(): string | undefined {
    const lines = [
      `Contact: ${name.trim()} · ${phone.trim()}`,
      `Payment: ${paymentLabelForNotes(payment, { cashLabel: "Cash on Arrival" })}`,
      notes.trim() || null,
    ].filter(Boolean) as string[];
    return lines.length ? lines.join("\n\n") : undefined;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to schedule a home wash");
      return;
    }
    if (!service) {
      toast.error("Packages are still loading");
      return;
    }
    if (!date || !time || !name.trim() || !phone.trim() || !address.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!paymentSectionRef.current?.validateMockInputs()) {
      return;
    }
    try {
      const booking = await addBooking({
        kind: "home",
        centerName: "Home service",
        serviceId: service.id,
        serviceName: service.name,
        date: format(date, "yyyy-MM-dd"),
        time,
        vehicle,
        notes: composeNotesForBooking(),
        address: address.trim(),
        price,
        status: "Pending",
        paymentMethod: paymentMethodToApi(payment),
        contactName: name.trim(),
        contactPhone: phone.trim(),
      });
      navigate("/confirmation", { state: { booking } });
    } catch {
      toast.error("Unable to save booking. Please try again.");
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Button asChild variant="ghost" size="sm" className="mb-4 gap-1">
        <Link to="/">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
      </Button>

      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-border">
          <WashlyLogo size="sm" className="max-h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Home Wash Service
          </h1>
          <p className="text-muted-foreground">
            We come to you — schedule a wash at your location
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* Service Selection */}
        <Card className="card-shadow">
          <CardContent className="p-5">
            <h3 className="mb-4 font-semibold text-card-foreground">
              Choose Your Package
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {packagesLoading && (
                <p className="col-span-full text-sm text-muted-foreground">
                  Loading packages…
                </p>
              )}
              {!packagesLoading && packages.length === 0 && (
                <p className="col-span-full text-sm text-destructive">
                  No packages available. Please try again later.
                </p>
              )}
              {packages.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedService(s.id)}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-all",
                    selectedService === s.id
                      ? "border-primary bg-accent card-hover-shadow"
                      : "border-border hover:border-primary/40 hover:bg-muted"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-card-foreground">
                      {s.name}
                    </h4>
                    {selectedService === s.id && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {s.description}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">
                      {formatEgp(s.price)}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {s.durationMin} min
                    </Badge>
                  </div>
                  <ul className="mt-3 space-y-1">
                    {s.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground"
                      >
                        <Check className="h-3 w-3 shrink-0 text-emerald-600" />{" "}
                        {f}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Personal Info + Address */}
        <Card className="card-shadow">
          <CardContent className="space-y-4 p-5">
            <h3 className="font-semibold text-card-foreground">
              Your Information
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+1 555-0100"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address" className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> Your Address
              </Label>
              <Textarea
                id="address"
                placeholder="Enter your full address (street, city, zip code)..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Vehicle & notes (app addition: pricing still applies) */}
        <Card className="card-shadow">
          <CardContent className="space-y-4 p-5">
            <h3 className="font-semibold text-card-foreground">
              Vehicle & notes
            </h3>
            <div className="space-y-2">
              <Label htmlFor="veh">Vehicle type</Label>
              <Select
                value={vehicle}
                onValueChange={(v) => setVehicle(v as VehicleType)}
              >
                <SelectTrigger id="veh">
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
              <p className="text-xs text-muted-foreground">
                {formatEgp(service?.price ?? 0)} package +{" "}
                {formatEgp(surcharge)} vehicle add-on = {formatEgp(price)}{" "}
                total.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Parking instructions, gate codes, pets, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Date & Time */}
        <Card className="card-shadow">
          <CardContent className="space-y-4 p-5">
            <h3 className="font-semibold text-card-foreground">
              Schedule Date & Time
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
                    selected={date}
                    onSelect={setDate}
                    disabled={(d) =>
                      d < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                    className="pointer-events-auto p-3"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Time Slot</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {timeSlots.map((t) => (
                  <Button
                    key={t}
                    type="button"
                    size="sm"
                    variant={time === t ? "default" : "outline"}
                    onClick={() => setTime(t)}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <PaymentMethodSection
          ref={paymentSectionRef}
          idPrefix="home-booking"
          payment={payment}
          onPaymentChange={setPayment}
          cashLabel="Cash on Arrival"
        />

        <Button type="submit" size="lg" className="w-full">
          Schedule Home Wash — {formatEgp(price)}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Need an account?{" "}
          <Link to="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
