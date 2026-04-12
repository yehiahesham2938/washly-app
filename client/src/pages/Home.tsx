import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Car,
  Clock,
  CreditCard,
  Droplets,
  Home as HomeIcon,
  MapPin,
  Search,
  Star,
} from "lucide-react";

import CenterCard from "@/components/CenterCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCenters } from "@/contexts/CentersContext";
import { getHomeSpotlightCenters } from "@/data/washCenters";

const heroImage = "/hero-bg.png";

const features = [
  {
    icon: Search,
    title: "Discover",
    desc: "Browse car wash centers near you with detailed info",
  },
  {
    icon: Star,
    title: "Compare",
    desc: "Check ratings, services, and prices side by side",
  },
  {
    icon: Clock,
    title: "Book Instantly",
    desc: "Pick your time slot and service in seconds",
  },
  {
    icon: CreditCard,
    title: "Pay Easy",
    desc: "Secure checkout with your preferred payment method",
  },
];

const stats = [
  { value: "500+", label: "Wash Centers" },
  { value: "50K+", label: "Happy Customers" },
  { value: "4.8", label: "Average Rating" },
  { value: "24/7", label: "Support" },
];

export function Home() {
  const { centers, loading: centersLoading } = useCenters();

  const topRated = useMemo(
    () => getHomeSpotlightCenters(centers),
    [centers]
  );

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Car wash"
            className="h-full w-full object-cover"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-foreground/70" />
        </div>
        <div className="container relative mx-auto px-4 py-24 md:py-36">
          <div className="max-w-2xl animate-fade-in-up">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 text-sm font-medium text-primary-foreground backdrop-blur">
              <Droplets className="h-4 w-4" /> #1 Car Wash Platform
            </div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-primary-foreground md:text-6xl">
              Your Car Deserves
              <br />
              <span className="text-secondary">a Perfect Wash</span>
            </h1>
            <p className="mt-5 text-lg text-primary-foreground/80">
              Book at a wash center or schedule a home visit — your car, your
              way.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" className="gap-2">
                <Link to="/centers">
                  <MapPin className="h-4 w-4" /> Find a Center
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="gap-2 border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground backdrop-blur hover:bg-primary-foreground/20"
              >
                <Link to="/home-booking">
                  <HomeIcon className="h-4 w-4" /> Book Home Service
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Two Services */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">
              Two Ways to Get Clean
            </h2>
            <p className="mt-2 text-muted-foreground">
              Choose whichever fits your schedule
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Link to="/centers" className="group">
              <Card className="h-full card-shadow transition-all hover:card-hover-shadow hover:-translate-y-1">
                <CardContent className="flex flex-col items-center p-8 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground transition-colors group-hover:bg-gradient-primary group-hover:text-primary-foreground">
                    <MapPin className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-card-foreground">
                    Visit a Wash Center
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Browse nearby centers, compare services & prices, and book
                    your preferred time slot.
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Browse Centers <ArrowRight className="h-4 w-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
            <Link to="/home-booking" className="group">
              <Card className="h-full card-shadow transition-all hover:card-hover-shadow hover:-translate-y-1">
                <CardContent className="flex flex-col items-center p-8 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground transition-colors group-hover:bg-gradient-primary group-hover:text-primary-foreground">
                    <HomeIcon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-card-foreground">
                    We Come to You
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Schedule a date & time and our team will wash your car at
                    your home, office, or anywhere.
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Schedule Home Wash <ArrowRight className="h-4 w-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gradient-primary py-12">
        <div className="container mx-auto grid grid-cols-2 gap-8 px-4 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold text-primary-foreground">
                {s.value}
              </div>
              <div className="mt-1 text-sm text-primary-foreground/70">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">How It Works</h2>
            <p className="mt-2 text-muted-foreground">
              Book your car wash in 4 simple steps
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group rounded-xl border border-border bg-card p-6 text-center card-shadow transition-all hover:card-hover-shadow"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-colors group-hover:bg-gradient-primary group-hover:text-primary-foreground">
                  <f.icon className="h-6 w-6" />
                </div>
                <div className="mb-1 text-xs font-semibold text-primary">
                  Step {i + 1}
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Centers */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground">
                Top Rated Centers
              </h2>
              <p className="mt-2 text-muted-foreground">
                Explore highly rated wash centers
              </p>
            </div>
            <Button asChild variant="ghost" className="hidden gap-1 md:flex">
              <Link to="/centers">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {centersLoading && (
              <p className="col-span-full text-center text-muted-foreground">
                Loading featured centers…
              </p>
            )}
            {!centersLoading &&
              topRated.map((c) => <CenterCard key={c.id} center={c} />)}
            {!centersLoading && topRated.length === 0 && (
              <p className="col-span-full text-center text-muted-foreground">
                Featured centers will appear here once loaded from the server.
              </p>
            )}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Button asChild variant="outline">
              <Link to="/centers">View All Centers</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl bg-gradient-primary p-10 text-center md:p-16">
            <Car className="mx-auto h-12 w-12 text-primary-foreground/80" />
            <h2 className="mt-4 text-3xl font-bold text-primary-foreground">
              Ready to Get Started?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-primary-foreground/80">
              Join thousands of car owners who trust Washly for their car care
              needs.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" variant="secondary">
                <Link to="/centers">Find a Center</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
              >
                <Link to="/home-booking">Schedule Home Wash</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
