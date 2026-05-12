import { CalendarDays, CalendarRange, CalendarSearch } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { RevenueFilter } from "./revenueAnalytics";

const FILTERS: {
  value: RevenueFilter;
  label: string;
  icon: typeof CalendarDays;
}[] = [
  { value: "today", label: "Today", icon: CalendarSearch },
  { value: "week", label: "This Week", icon: CalendarRange },
  { value: "month", label: "This Month", icon: CalendarDays },
];

type Props = {
  value: RevenueFilter;
  onChange: (value: RevenueFilter) => void;
};

export function RevenueFilters({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {FILTERS.map((option) => {
        const Icon = option.icon;
        const active = option.value === value;
        return (
          <Button
            key={option.value}
            type="button"
            variant={active ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(option.value)}
            className={cn(
              "h-9 rounded-full px-4",
              active ? "bg-gradient-primary text-primary-foreground" : ""
            )}
          >
            <Icon className="mr-1.5 h-4 w-4" />
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
