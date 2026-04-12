import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  CalendarClock,
  Home as HomeIcon,
  MapPin,
  Search,
  Star,
  Truck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCenters } from "@/contexts/CentersContext";
import {
  areas,
  centerMinPrice,
  getHomeSpotlightCenters,
} from "@/data/washCenters";

export function Home() {
  const { centers } = useCenters();
  const [q, setQ] = useState("");
  const [area, setArea] = useState<(typeof areas)[number]>("All");

  const filtered = useMemo(() => {
    return centers.filter((c) => {
      const matchQ =
        !q.trim() ||
        c.name.toLowerCase().includes(q.toLowerCase()) ||
        c.area.toLowerCase().includes(q.toLowerCase());
      const matchArea = area === "All" || c.area === area;
      return matchQ && matchArea;
    });
  }, [centers, q, area]);

  const topRated = useMemo(() => {
    const hasFilter = Boolean(q.trim()) || area !== "All";
    if (hasFilter) {
      return [...filtered]
        .sort((a, b) => {
          if (b.rating !== a.rating) return b.rating - a.rating;
          return b.reviewCount - a.reviewCount;
        })
        .slice(0, 3);
    }
    return getHomeSpotlightCenters(centers);
  }, [filtered, q, area, centers]);

  return (
    <div>
      <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden border-b border-border/40">
        <div className="absolute inset-0">
          <img
            src="/hero-bg.png"
            alt=""
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/25" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl flex-col justify-center px-4 py-16 sm:px-6 sm:py-20">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-primary/90 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm backdrop-blur-sm">
              <Award className="h-3.5 w-3.5 text-[hsl(195_90%_65%)]" />
              #1 Car Wash Platform
            </p>

            <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
              <span className="block">Your Car Deserves</span>
              <span className="mt-1 block text-[hsl(195,80%,45%)]">
                a Perfect Wash
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg text-white/95 sm:text-xl">
              Book at a wash center or schedule a home visit — your car, your
              way.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                className="h-12 rounded-xl px-8 text-base shadow-lg"
                asChild
              >
                <Link to="/centers">
                  <MapPin className="mr-2 h-5 w-5" />
                  Find a Center
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-xl border-2 border-white/90 bg-white/10 px-8 text-base text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
                asChild
              >
                <Link to="/home-booking">
                  <HomeIcon className="mr-2 h-5 w-5" />
                  Book Home Service
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border/60 bg-background py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Card className="border-border/80 shadow-card">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name or area..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="rounded-xl pl-9"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {areas.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setArea(a)}
                    className={`rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                      area === a
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-t border-border/40 bg-[hsl(210,20%,98%)] py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Top Rated Centers
              </h2>
              <p className="mt-1 text-muted-foreground">
                Explore highly rated wash centers
              </p>
            </div>
            <Link
              to="/centers"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {topRated.map((c) => {
              const fromPrice = centerMinPrice(c);
              const locationText = c.locationLine ?? c.address;
              const tagNames = c.services.map((s) => s.name);
              const showTags = tagNames.slice(0, 3);
              const moreCount = tagNames.length - showTags.length;

              return (
                <Card
                  key={c.id}
                  className="group overflow-hidden rounded-xl border-border/60 bg-card shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-shadow duration-300 hover:shadow-[0_12px_40px_-8px_hsl(210_100%_45%_/_0.12)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden rounded-t-xl">
                    <img
                      src={c.image}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    <span className="absolute left-3 top-3 rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
                      From ${fromPrice}
                    </span>
                  </div>
                  <CardContent className="space-y-4 p-5">
                    <h3 className="text-lg font-bold leading-snug text-foreground">
                      {c.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-medium text-foreground">
                        {c.rating.toFixed(1)}
                      </span>
                      <span>({c.reviewCount})</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{locationText}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {showTags.map((name, i) => (
                        <span
                          key={`${c.id}-t-${i}`}
                          className="rounded-full bg-[hsl(195_80%_94%)] px-2.5 py-1 text-xs font-medium text-[hsl(210_100%_38%)]"
                        >
                          {name}
                        </span>
                      ))}
                      {moreCount > 0 && (
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          +{moreCount} more
                        </span>
                      )}
                    </div>
                    <Button className="w-full rounded-xl" variant="default" asChild>
                      <Link to={`/centers/${c.id}`}>View details</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-border/60 bg-muted/40 py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-semibold tracking-tight">
            How it works
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-muted-foreground">
            Three quick steps from browse to shine.
          </p>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Choose a center or home",
                body: "Browse locations, ratings, and services that fit your vehicle.",
                icon: MapPin,
              },
              {
                step: "2",
                title: "Pick date & time",
                body: "Select a slot that works for you and your vehicle type.",
                icon: CalendarClock,
              },
              {
                step: "3",
                title: "Show up or relax",
                body: "Arrive at the bay or wait at home — we handle the rest.",
                icon: Truck,
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative rounded-xl border bg-card p-6 text-center shadow-card"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-md">
                  <item.icon className="h-6 w-6" />
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-primary">
                  Step {item.step}
                </p>
                <h3 className="mt-1 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="overflow-hidden rounded-2xl bg-gradient-primary px-6 py-12 text-center text-primary-foreground shadow-xl sm:px-12">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Prefer we come to you?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-primary-foreground/90">
            Schedule an at-home wash — same pro quality, zero drive time.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="mt-8 bg-white text-primary hover:bg-white/90"
            asChild
          >
            <Link to="/home-booking">Book home service</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
