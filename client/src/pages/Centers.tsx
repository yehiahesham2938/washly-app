import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Search } from "lucide-react";

import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCenters } from "@/contexts/CentersContext";
import { areas, centerMinPrice } from "@/data/washCenters";

export function Centers() {
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Wash centers</h1>
        <p className="mt-2 text-muted-foreground">
          Filter by area and search by name.
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search centers..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {areas.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setArea(a)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                area === a
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <Card
            key={c.id}
            className="group overflow-hidden rounded-xl border-border/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-card-hover"
          >
            <div className="relative aspect-[16/10] overflow-hidden rounded-t-xl">
              <img
                src={c.image}
                alt=""
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute left-3 top-3 rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
                From ${centerMinPrice(c)}
              </span>
            </div>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold leading-tight">{c.name}</h2>
                <StarRating rating={c.rating} />
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {c.locationLine ?? c.address}
              </div>
              <Button className="w-full" variant="gradient" asChild>
                <Link to={`/centers/${c.id}`}>View details</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">
          No centers match your filters.
        </p>
      )}
    </div>
  );
}
