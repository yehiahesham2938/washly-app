import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import CenterCard from "@/components/CenterCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCenters } from "@/contexts/CentersContext";
import { areas, centerMinPrice } from "@/data/washCenters";

type SortKey = "rating" | "price" | "reviews";

export function Centers() {
  const { centers, loading, error } = useCenters();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("rating");
  const [area, setArea] = useState<(typeof areas)[number]>("All");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return centers.filter((c) => {
      const locationText = (c.locationLine ?? c.address).toLowerCase();
      const matchQ =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.area.toLowerCase().includes(q) ||
        locationText.includes(q);
      const matchArea = area === "All" || c.area === area;
      return matchQ && matchArea;
    });
  }, [centers, search, area]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "price")
        return centerMinPrice(a) - centerMinPrice(b);
      if (sort === "reviews") return b.reviewCount - a.reviewCount;
      return 0;
    });
    return list;
  }, [filtered, sort]);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-foreground">Car Wash Centers</h1>
      <p className="mt-2 text-muted-foreground">
        Browse and book from our network of trusted wash centers
      </p>

      {error && (
        <p className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={sort}
          onValueChange={(v) => setSort(v as SortKey)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="price">Lowest Price</SelectItem>
            <SelectItem value="reviews">Most Reviews</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
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

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading && (
          <p className="col-span-full text-center text-muted-foreground">
            Loading centers…
          </p>
        )}
        {!loading &&
          sorted.map((c) => <CenterCard key={c.id} center={c} />)}
      </div>

      {!loading && sorted.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">
          {centers.length === 0
            ? "No centers available yet."
            : "No centers found matching your search."}
        </div>
      )}
    </div>
  );
}
