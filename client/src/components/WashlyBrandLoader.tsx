import { Droplets } from "lucide-react";

import { cn } from "@/lib/utils";

type WashlyBrandLoaderProps = {
  /** Shown under the wordmark (e.g. admin context) */
  subtitle?: string;
  /** Smaller mark for route transitions vs full splash */
  variant?: "default" | "compact";
  className?: string;
};

export function WashlyBrandLoader({
  subtitle,
  variant = "default",
  className,
}: WashlyBrandLoaderProps) {
  const compact = variant === "compact";

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-5",
        compact ? "gap-3" : "gap-5",
        className
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className={cn(
            "flex items-center justify-center rounded-2xl bg-gradient-primary shadow-lg motion-safe:animate-washly-logo",
            "ring-2 ring-primary/20 ring-offset-2 ring-offset-background",
            compact ? "h-14 w-14" : "h-16 w-16"
          )}
        >
          <Droplets
            className={cn(
              "text-primary-foreground motion-safe:animate-washly-droplet",
              compact ? "h-8 w-8" : "h-9 w-9"
            )}
            strokeWidth={2}
          />
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <p
            className={cn(
              "font-bold tracking-tight text-gradient",
              compact ? "text-2xl" : "text-3xl"
            )}
          >
            Washly
          </p>
          {subtitle ? (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </div>
      <div
        className={cn(
          "relative h-1 overflow-hidden rounded-full bg-muted",
          compact ? "w-28" : "w-36"
        )}
        aria-hidden
      >
        <div className="absolute inset-y-0 left-0 w-2/5 rounded-full bg-gradient-primary shadow-sm motion-safe:animate-washly-bar-slide" />
      </div>
    </div>
  );
}
