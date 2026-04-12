import { type ReactNode, useMemo } from "react";
import { Wifi } from "lucide-react";

import { isCardExpiryValid } from "@/lib/cardExpiry";
import { detectCardBrand, type CardBrand } from "@/lib/cardBrand";
import { cn } from "@/lib/utils";

function formatExpiryDigits(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

function displayPan(digitsOnly: string, brand: CardBrand): string {
  const d = digitsOnly.replace(/\D/g, "");
  const len = brand === "amex" ? 15 : 16;
  const cap = d.slice(0, len);

  if (brand === "amex") {
    const g1 = cap.slice(0, 4).padEnd(4, "•");
    const g2 = cap.slice(4, 10).padEnd(6, "•");
    const g3 = cap.slice(10, 15).padEnd(5, "•");
    return `${g1} ${g2} ${g3}`;
  }

  const out: string[] = [];
  for (let i = 0; i < 16; i += 4) {
    const chunk = cap.slice(i, i + 4);
    let visual = "";
    for (let j = 0; j < 4; j++) {
      visual += chunk[j] ?? "•";
    }
    out.push(visual);
  }
  return out.join(" ");
}

/** Shared gradients for card front/back (dialog back face). */
export const CARD_BRAND_FACE: Record<
  CardBrand,
  { gradient: string; accent: string }
> = {
  visa: {
    gradient: "from-[#0d1742] via-[#142a6e] to-[#1e3a8a]",
    accent: "shadow-blue-500/20",
  },
  mastercard: {
    gradient: "from-[#0c0c0f] via-[#1a1525] to-[#2d1f3d]",
    accent: "shadow-violet-500/15",
  },
  amex: {
    gradient: "from-[#01295f] via-[#004a9f] to-[#006fcf]",
    accent: "shadow-sky-400/25",
  },
  discover: {
    gradient: "from-[#1a1410] via-[#2d1810] to-[#3d2010]",
    accent: "shadow-orange-500/20",
  },
  diners: {
    gradient: "from-[#0a1628] via-[#132a4a] to-[#1e3d5c]",
    accent: "shadow-cyan-500/15",
  },
  jcb: {
    gradient: "from-[#0a2818] via-[#124a2e] to-[#1a5c3a]",
    accent: "shadow-emerald-400/20",
  },
  unionpay: {
    gradient: "from-[#1a0a0a] via-[#3d1515] to-[#5c2020]",
    accent: "shadow-red-500/15",
  },
  unknown: {
    gradient: "from-[#1e1b4b] via-[#312e81] to-[#4338ca]",
    accent: "shadow-indigo-500/20",
  },
};

function EmvChip({
  className,
  compact,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border border-amber-950/25 shadow-inner",
        compact ? "h-8 w-11" : "h-10 w-[3.25rem]",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-amber-400 to-amber-900" />
      <div
        className={cn(
          "absolute rounded-sm bg-gradient-to-br from-amber-700/40 to-amber-950/60",
          compact ? "inset-[2px]" : "inset-[3px]"
        )}
      />
      <div
        className={cn(
          "absolute left-[4px] top-1/2 -translate-y-1/2 rounded-sm border border-amber-950/15 bg-gradient-to-b from-amber-950/10 to-amber-950/25",
          compact ? "h-[18px] w-[28px]" : "h-[22px] w-[34px]"
        )}
      />
    </div>
  );
}

export function CardNetworkLogo({
  brand,
  compact,
}: {
  brand: CardBrand;
  compact?: boolean;
}) {
  const wrap = (node: ReactNode) =>
    compact ? (
      <div className="origin-right scale-[0.72]">{node}</div>
    ) : (
      node
    );

  switch (brand) {
    case "visa":
      return wrap(
        <div
          className="select-none text-right font-sans text-[1.65rem] font-bold italic leading-none tracking-[-0.08em] text-white drop-shadow-md"
          aria-hidden
        >
          VISA
        </div>
      );
    case "mastercard":
      return wrap(
        <div className="relative h-10 w-[3.25rem] shrink-0" aria-hidden>
          <div className="absolute left-0 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-[#eb001b] shadow-sm" />
          <div className="absolute left-[22px] top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-[#f79e1b] shadow-sm" />
        </div>
      );
    case "amex":
      return wrap(
        <div
          className="rounded border border-white/25 bg-[#006fcf] px-2 py-1.5 text-[10px] font-bold uppercase leading-none tracking-wide text-white shadow-md"
          aria-hidden
        >
          American
          <br />
          Express
        </div>
      );
    case "discover":
      return wrap(
        <div
          className="text-right font-sans text-lg font-bold leading-none tracking-tight text-[#ff6000] drop-shadow-sm"
          aria-hidden
        >
          DISCOVER
        </div>
      );
    case "diners":
      return wrap(
        <div
          className="text-right text-[11px] font-semibold uppercase leading-tight tracking-wide text-white/95 drop-shadow"
          aria-hidden
        >
          Diners
          <br />
          Club
        </div>
      );
    case "jcb":
      return wrap(
        <div className="flex flex-col items-end gap-0.5" aria-hidden>
          <span className="rounded bg-[#0b5] px-1.5 py-0.5 text-[10px] font-bold text-white">
            JCB
          </span>
        </div>
      );
    case "unionpay":
      return wrap(
        <div className="text-right" aria-hidden>
          <span className="text-[11px] font-bold leading-none tracking-tight text-white">
            Union
            <span className="text-red-300">Pay</span>
          </span>
        </div>
      );
    default:
      return wrap(
        <div
          className="rounded-md border border-white/20 bg-white/10 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-white/80"
          aria-hidden
        >
          Debit
        </div>
      );
  }
}

type CreditCardFrontFaceProps = {
  cardName: string;
  /** Digits only (same as stored in booking form state) */
  cardNumberDigits: string;
  /** Expiry digits only, up to 4 */
  cardExpiryDigits: string;
  /** Full-size flip card vs compact embed in checkout */
  variant: "dialog" | "inline";
  className?: string;
};

/**
 * Live-updating credit card front (same visuals as the payment dialog).
 */
export function CreditCardFrontFace({
  cardName,
  cardNumberDigits,
  cardExpiryDigits,
  variant,
  className,
}: CreditCardFrontFaceProps) {
  const digitsOnly = cardNumberDigits.replace(/\D/g, "");
  const brand = useMemo(() => detectCardBrand(digitsOnly), [digitsOnly]);
  const face = CARD_BRAND_FACE[brand];
  const expDigitsOnly = cardExpiryDigits.replace(/\D/g, "").slice(0, 4);

  const displayName = cardName.trim().toUpperCase() || "YOUR NAME HERE";
  const displayExpiryFormatted =
    expDigitsOnly.length === 4
      ? `${expDigitsOnly.slice(0, 2)}/${expDigitsOnly.slice(2)}`
      : expDigitsOnly.length > 0
        ? formatExpiryDigits(expDigitsOnly)
        : "MM/YY";

  const expiryLooksComplete = expDigitsOnly.length === 4;
  const expiryInvalid =
    expiryLooksComplete && !isCardExpiryValid(expDigitsOnly);

  const inline = variant === "inline";

  return (
    <div
      className={cn(
        inline
          ? "relative aspect-[1.586] w-full max-w-[300px] overflow-hidden rounded-xl border border-white/[0.12] p-3.5 text-white shadow-lg sm:max-w-[320px] sm:p-4"
          : "absolute inset-0 overflow-hidden rounded-[1.1rem] border border-white/[0.12] p-5 text-white shadow-2xl [backface-visibility:hidden] sm:rounded-2xl sm:p-6",
        `bg-gradient-to-br ${face.gradient}`,
        face.accent,
        expiryInvalid && "ring-2 ring-red-500/90 ring-offset-2 ring-offset-background",
        className
      )}
      style={!inline ? { transform: "rotateY(0deg)" } : undefined}
    >
      {expiryInvalid ? (
        <div
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] bg-black/50"
          aria-hidden
        >
          <span className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-lg">
            Expired
          </span>
        </div>
      ) : null}
      <div
        className="pointer-events-none absolute -left-1/4 top-0 h-full w-[70%] rotate-12 bg-gradient-to-r from-white/[0.07] via-white/[0.02] to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />

      <div
        className={cn(
          "relative flex items-start justify-end",
          inline ? "mt-0" : undefined
        )}
      >
        <Wifi
          className={cn(
            "rotate-90 text-white/90 drop-shadow",
            inline ? "h-5 w-5" : "h-7 w-7"
          )}
          strokeWidth={2}
          aria-hidden
        />
      </div>

      <div
        className={cn(
          "relative flex items-start gap-3",
          inline ? "mt-3" : "mt-5 gap-4"
        )}
      >
        <EmvChip compact={inline} />
        <div className="flex-1" />
      </div>

      <div className={cn("relative", inline ? "mt-3" : "mt-6 sm:mt-8")}>
        <p
          className={cn(
            "font-mono font-medium tracking-[0.2em] text-white",
            inline
              ? "text-xs leading-snug sm:text-sm"
              : "text-xl drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)] sm:text-2xl md:text-[1.65rem] md:tracking-[0.22em]"
          )}
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.35)" }}
        >
          {displayPan(digitsOnly, brand)}
        </p>
      </div>

      <div
        className={cn(
          "absolute flex items-end justify-between gap-2",
          inline
            ? "bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4"
            : "bottom-5 left-5 right-5 sm:bottom-6 sm:left-6 sm:right-6"
        )}
      >
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate font-medium uppercase tracking-[0.2em] text-white/75 drop-shadow",
              inline ? "text-[8px] sm:text-[9px]" : "text-[10px] sm:text-[11px]"
            )}
          >
            {displayName}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 sm:gap-2">
          <div className="text-right">
            <p
              className={cn(
                "uppercase tracking-wider text-white/50",
                inline ? "text-[7px]" : "text-[9px]"
              )}
            >
              Valid thru
            </p>
            <span
              className={cn(
                "font-mono font-medium tracking-wider text-white drop-shadow",
                inline ? "text-[10px] sm:text-xs" : "text-sm sm:text-base"
              )}
            >
              {displayExpiryFormatted}
            </span>
          </div>
          <CardNetworkLogo brand={brand} compact={inline} />
        </div>
      </div>
    </div>
  );
}
