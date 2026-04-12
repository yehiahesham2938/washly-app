import { cn } from "@/lib/utils";

/** Public asset — overwrite `client/public/washly-logo.png` to update branding site-wide. */
export const WASHLY_LOGO_SRC = "/washly-logo.png";

const sizeClass: Record<"xs" | "sm" | "md" | "lg" | "xl" | "2xl", string> = {
  xs: "h-7",
  sm: "h-9",
  md: "h-11",
  lg: "h-14",
  xl: "h-16",
  "2xl": "h-24",
};

type Props = {
  className?: string;
  size?: keyof typeof sizeClass;
  alt?: string;
};

/** Brand mark from `/washly-logo.png` (responsive width, fixed height per size). */
export function WashlyLogo({
  className,
  size = "md",
  alt = "Washly",
}: Props) {
  return (
    <img
      src={WASHLY_LOGO_SRC}
      alt={alt}
      className={cn(
        sizeClass[size],
        "w-auto max-w-[min(100%,320px)] object-contain object-center",
        className
      )}
      draggable={false}
    />
  );
}
