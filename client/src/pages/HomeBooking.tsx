import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useAuth } from "@/contexts/AuthContext";
import { getTimeSlots } from "@/lib/timeSlots";
import { totalPrice, vehicleSurcharge } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import type { VehicleType } from "@/types";

const HOME_PACKAGES = [
  {
    id: "home-1",
    name: "Driveway Express",
    description: "Exterior hand wash and dry at your location.",
    durationMin: 40,
    price: 55,
  },
  {
    id: "home-2",
    name: "Curb-to-Curb Detail",
    description: "Interior vacuum, wipe-down, and exterior wash.",
    durationMin: 90,
    price: 119,
  },
  {
    id: "home-3",
    name: "Full Home Spa",
    description: "Complete interior and exterior detailing.",
    durationMin: 150,
    price: 219,
  },
] as const;

export function HomeBooking() {
  const navigate = useNavigate();
  const { addBooking } = useAuth();

  const [pkgId, setPkgId] = useState<string>(HOME_PACKAGES[0].id);
  const selectedPkg = useMemo(
    () => HOME_PACKAGES.find((p) => p.id === pkgId) ?? HOME_PACKAGES[0],
    [pkgId]
  );

  const [address, setAddress] = useState("");
  const [date, setDate] = useState<Date | undefined>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [time, setTime] = useState<string | null>(null);
  const [vehicle, setVehicle] = useState<VehicleType>("Sedan");
  const [notes, setNotes] = useState("");

  const slots = useMemo(() => getTimeSlots(), []);

  const price = totalPrice(selectedPkg.price, vehicle);
  const surcharge = vehicleSurcharge(vehicle);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !time || !address.trim()) return;
    const booking = addBooking({
      kind: "home",
      centerName: "Home service",
      serviceName: selectedPkg.name,
      date: format(date, "yyyy-MM-dd"),
      time,
      vehicle,
      notes: notes.trim() || undefined,
      address: address.trim(),
      price,
      status: "Pending",
    });
    navigate("/confirmation", { state: { booking } });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Book home service</h1>
        <p className="mt-2 text-muted-foreground">
          We&apos;ll send a pro to your address at the time you choose.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-8 lg:grid-cols-[1fr_340px]"
      >
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Service package</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Package</Label>
                <Select value={pkgId} onValueChange={setPkgId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOME_PACKAGES.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} — ${p.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedPkg.description} · approx. {selectedPkg.durationMin}{" "}
                min
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your address</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="addr" className="sr-only">
                Street address
              </Label>
              <Input
                id="addr"
                required
                placeholder="123 Main St, City, ZIP"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Date & time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
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
                      disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Time slot</Label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTime(slot)}
                      className={cn(
                        "rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
                        time === slot
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background hover:bg-muted"
                      )}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vehicle & notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  placeholder="Parking instructions, pets, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-24 border-border/80 shadow-card">
            <CardHeader>
              <CardTitle>Price summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {selectedPkg.name}
                </span>
                <span>${selectedPkg.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vehicle add-on</span>
                <span>${surcharge}</span>
              </div>
              <div className="border-t pt-3 font-semibold">
                <div className="flex justify-between text-base">
                  <span>Total</span>
                  <span className="text-primary">${price}</span>
                </div>
              </div>
              <Button
                type="submit"
                className="mt-4 w-full"
                variant="gradient"
                disabled={!date || !time || !address.trim()}
              >
                Confirm booking
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Need an account?{" "}
                <Link to="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
