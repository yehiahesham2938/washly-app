import { DayPicker } from "react-day-picker";
import type { DayPickerProps } from "react-day-picker";

import { cn } from "@/lib/utils";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: DayPickerProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        root: cn("w-fit"),
        months: cn("relative flex flex-col gap-4 sm:flex-row"),
        month: cn("flex w-full flex-col gap-4"),
        month_caption: cn(
          "flex h-9 w-full items-center justify-center px-1 pt-1"
        ),
        caption_label: cn("text-sm font-medium"),
        nav: cn(
          "absolute top-0 flex w-full justify-between gap-1 px-1 pt-1 sm:px-2"
        ),
        button_previous: cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-sm font-medium opacity-80 hover:opacity-100"
        ),
        button_next: cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-sm font-medium opacity-80 hover:opacity-100"
        ),
        month_grid: cn("mt-4 w-full border-collapse"),
        weekdays: cn("flex"),
        weekday: cn(
          "w-8 text-[0.8rem] font-normal text-muted-foreground select-none"
        ),
        week: cn("mt-2 flex w-full"),
        day: cn(
          "relative h-8 w-8 p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected])]:rounded-md"
        ),
        day_button: cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-md p-0 font-normal transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-selected:opacity-100"
        ),
        selected: cn(
          "rounded-md bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground"
        ),
        today: cn("rounded-md bg-accent text-accent-foreground"),
        outside: cn(
          "text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground"
        ),
        disabled: cn("text-muted-foreground opacity-50"),
        range_middle: cn(
          "rounded-none aria-selected:bg-accent aria-selected:text-accent-foreground"
        ),
        hidden: cn("invisible"),
        ...classNames,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
