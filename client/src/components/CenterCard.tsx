import { Link } from "react-router-dom";
import { MapPin, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { centerMinPrice } from "@/data/washCenters";
import type { WashCenter } from "@/types";

export default function CenterCard({ center: c }: { center: WashCenter }) {
  const fromPrice = centerMinPrice(c);
  const locationText = c.locationLine ?? c.address;
  const tagNames = c.services.map((s) => s.name);
  const showTags = tagNames.slice(0, 3);
  const moreCount = tagNames.length - showTags.length;

  return (
    <Card className="group overflow-hidden rounded-xl border-border/60 bg-card card-shadow transition-all hover:card-hover-shadow">
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
        <h3 className="text-lg font-bold leading-snug text-foreground">{c.name}</h3>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="font-medium text-foreground">{c.rating.toFixed(1)}</span>
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
              className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground"
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
}
