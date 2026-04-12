import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Clock,
  MapPin,
  Phone,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCenters } from "@/contexts/CentersContext";
import { centerMinPrice } from "@/data/washCenters";
import { findCenterById } from "@/lib/centerQueries";

const QUICK_INFO_ITEMS = [
  "Professional Staff",
  "Eco-Friendly Products",
  "Satisfaction Guaranteed",
  "Online Booking",
] as const;

export function CenterDetail() {
  const { id } = useParams();
  const { centers } = useCenters();
  const center = id ? findCenterById(centers, id) : undefined;

  if (!center) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-semibold">Center not found</h1>
        <Button className="mt-6" asChild>
          <Link to="/centers">Back to centers</Link>
        </Button>
      </div>
    );
  }

  const minPrice = centerMinPrice(center);
  const locationText = center.locationLine ?? center.address ?? "";
  const hoursLabel = center.hoursShort ?? center.hours ?? "";
  const blurb =
    center.description ??
    "Premium car wash & detailing with professional staff and modern equipment.";
  const phoneDisplay = center.phone?.trim() ?? "";
  const telHref = phoneDisplay
    ? `tel:${phoneDisplay.replace(/[^\d+]/g, "")}`
    : "";
  const rating = center.rating ?? 0;
  const reviewCount = center.reviewCount ?? 0;
  const services = center.services ?? [];

  return (
    <div className="bg-background pb-16">
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <Button variant="ghost" className="mb-6 gap-2 px-0 text-muted-foreground hover:text-foreground" asChild>
          <Link to="/centers">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>

        <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
          <div
            className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
          >
            {center.image?.trim() ? (
              <img
                src={center.image}
                alt=""
                className="aspect-[16/10] h-full w-full object-cover lg:min-h-[320px]"
              />
            ) : (
              <div className="flex aspect-[16/10] min-h-[200px] w-full items-center justify-center bg-muted text-sm text-muted-foreground lg:min-h-[320px]">
                No image
              </div>
            )}
          </div>

          <Card className="flex flex-col rounded-xl border-border/60 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-3">
              <ul className="space-y-3">
                {QUICK_INFO_ITEMS.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-auto rounded-xl bg-[hsl(195_80%_95%)] px-4 py-5 text-center">
                <p className="text-xs font-medium text-muted-foreground">
                  Starting from
                </p>
                <p className="mt-1 text-4xl font-bold tracking-tight text-primary">
                  ${minPrice}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {center.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Star
                className="h-4 w-4 fill-amber-400 text-amber-400"
                aria-hidden
              />
              <span className="font-medium text-foreground">
                {rating.toFixed(1)}
              </span>
              <span>({reviewCount} reviews)</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              {locationText}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 shrink-0 text-primary" />
              {hoursLabel}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-4 w-4 shrink-0 text-primary" />
              {telHref ? (
                <a href={telHref} className="hover:text-primary hover:underline">
                  {phoneDisplay}
                </a>
              ) : (
                <span className="text-muted-foreground">Phone not listed</span>
              )}
            </span>
          </div>

          <p className="mt-6 max-w-3xl leading-relaxed text-muted-foreground">
            {blurb}
          </p>
        </div>

        <h2 className="mt-14 text-xl font-semibold tracking-tight">
          Available Services
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, index) => (
            <Card
              key={`${center.id}-svc-${s.id ?? index}-${index}`}
              className="flex flex-col rounded-xl border-border/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">{s.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col space-y-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {s.description}
                </p>
                <div className="mt-auto flex items-center justify-between gap-2">
                  <span className="text-xl font-bold text-primary">${s.price}</span>
                  <span className="rounded-full bg-[hsl(195_80%_94%)] px-2.5 py-1 text-xs font-medium text-[hsl(210_100%_38%)]">
                    {s.durationMin} min
                  </span>
                </div>
                <Button className="w-full rounded-xl" size="lg" asChild>
                  <Link to={`/booking/${center.id}/${s.id}`}>Book Now</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
