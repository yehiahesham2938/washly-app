import { useEffect, useMemo, useState } from "react";
import { Wifi } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  detectCardBrand,
  expectedCvvLength,
  expectedPanLength,
  maxPanDigits,
  type CardBrand,
} from "@/lib/cardBrand";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idPrefix: string;
  cardName: string;
  onCardNameChange: (v: string) => void;
  cardNumber: string;
  onCardNumberChange: (v: string) => void;
  cardExpiry: string;
  onCardExpiryChange: (v: string) => void;
  cardCvc: string;
  onCardCvcChange: (v: string) => void;
};

function formatCardNumberInput(raw: string, brand: CardBrand): string {
  const max = maxPanDigits(brand);
  const d = raw.replace(/\D/g, "").slice(0, max);
  if (brand === "amex") {
    if (d.length <= 4) return d;
    if (d.length <= 10) return `${d.slice(0, 4)} ${d.slice(4)}`;
    return `${d.slice(0, 4)} ${d.slice(4, 10)} ${d.slice(10)}`;
  }
  return d.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function formatExpiryInput(raw: string): string {
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

/** Brand-specific card face (dark base + tint). */
const BRAND_FACE: Record<
  CardBrand,
  { gradient: string; accent: string }
> = {
  visa: {
    gradient:
      "from-[#0d1742] via-[#142a6e] to-[#1e3a8a]",
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

function EmvChip({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative h-10 w-[3.25rem] overflow-hidden rounded-md border border-amber-950/25 shadow-inner",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-amber-400 to-amber-900" />
      <div className="absolute inset-[3px] rounded-sm bg-gradient-to-br from-amber-700/40 to-amber-950/60" />
      <div className="absolute left-[5px] top-1/2 h-[22px] w-[34px] -translate-y-1/2 rounded-sm border border-amber-950/15 bg-gradient-to-b from-amber-950/10 to-amber-950/25" />
    </div>
  );
}

function CardNetworkLogo({ brand }: { brand: CardBrand }) {
  switch (brand) {
    case "visa":
      return (
        <div
          className="select-none text-right font-sans text-[1.65rem] font-bold italic leading-none tracking-[-0.08em] text-white drop-shadow-md"
          aria-hidden
        >
          VISA
        </div>
      );
    case "mastercard":
      return (
        <div
          className="relative h-10 w-[3.25rem] shrink-0"
          aria-hidden
        >
          <div className="absolute left-0 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-[#eb001b] shadow-sm" />
          <div className="absolute left-[22px] top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-[#f79e1b] shadow-sm" />
        </div>
      );
    case "amex":
      return (
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
      return (
        <div
          className="text-right font-sans text-lg font-bold leading-none tracking-tight text-[#ff6000] drop-shadow-sm"
          aria-hidden
        >
          DISCOVER
        </div>
      );
    case "diners":
      return (
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
      return (
        <div className="flex flex-col items-end gap-0.5" aria-hidden>
          <span className="rounded bg-[#0b5] px-1.5 py-0.5 text-[10px] font-bold text-white">
            JCB
          </span>
        </div>
      );
    case "unionpay":
      return (
        <div className="text-right" aria-hidden>
          <span className="text-[11px] font-bold leading-none tracking-tight text-white">
            Union
            <span className="text-red-300">Pay</span>
          </span>
        </div>
      );
    default:
      return (
        <div
          className="rounded-md border border-white/20 bg-white/10 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-white/80"
          aria-hidden
        >
          Debit
        </div>
      );
  }
}

export function CreditCardPaymentDialog({
  open,
  onOpenChange,
  idPrefix,
  cardName,
  onCardNameChange,
  cardNumber,
  onCardNumberChange,
  cardExpiry,
  onCardExpiryChange,
  cardCvc,
  onCardCvcChange,
}: Props) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (open) setFlipped(false);
  }, [open]);

  const digitsOnly = cardNumber.replace(/\D/g, "");
  const brand = useMemo(() => detectCardBrand(digitsOnly), [digitsOnly]);
  const face = BRAND_FACE[brand];
  const expDigitsOnly = cardExpiry.replace(/\D/g, "").slice(0, 4);
  const cvvMax = expectedCvvLength(brand);
  const panLen = expectedPanLength(brand);

  const frontComplete =
    cardName.trim().length >= 2 &&
    digitsOnly.length === panLen &&
    expDigitsOnly.length === 4;

  function handleContinueToCvv() {
    if (!frontComplete) return;
    setFlipped(true);
  }

  function handleBackToFront() {
    setFlipped(false);
  }

  const displayName = cardName.trim().toUpperCase() || "YOUR NAME HERE";
  const displayExpiryFormatted =
    expDigitsOnly.length === 4
      ? `${expDigitsOnly.slice(0, 2)}/${expDigitsOnly.slice(2)}`
      : expDigitsOnly.length > 0
        ? formatExpiryInput(expDigitsOnly)
        : "MM/YY";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(92vh,900px)] max-w-lg overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Card details</DialogTitle>
          <DialogDescription>
            Demo only — nothing you enter here is saved or sent to a server.
          </DialogDescription>
        </DialogHeader>

        <div
          className="mx-auto w-full max-w-[420px] py-2"
          style={{ perspective: "1400px" }}
        >
          <div
            className={cn(
              "relative aspect-[1.586] w-full transition-transform duration-700 ease-out [transform-style:preserve-3d]",
              flipped && "[transform:rotateY(180deg)]"
            )}
          >
            {/* Front */}
            <div
              className={cn(
                "absolute inset-0 overflow-hidden rounded-[1.1rem] border border-white/[0.12] p-5 text-white shadow-2xl [backface-visibility:hidden] sm:rounded-2xl sm:p-6",
                `bg-gradient-to-br ${face.gradient}`,
                face.accent
              )}
              style={{ transform: "rotateY(0deg)" }}
            >
              {/* Specular + noise */}
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

              <div className="relative flex items-start justify-end">
                <Wifi
                  className="h-7 w-7 rotate-90 text-white/90 drop-shadow"
                  strokeWidth={2}
                  aria-hidden
                />
              </div>

              <div className="relative mt-5 flex items-start gap-4">
                <EmvChip />
                <div className="flex-1" />
              </div>

              <div className="relative mt-6 sm:mt-8">
                <p
                  className="font-mono text-xl font-medium tracking-[0.2em] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)] sm:text-2xl md:text-[1.65rem] md:tracking-[0.22em]"
                  style={{ textShadow: "0 2px 8px rgba(0,0,0,0.35)" }}
                >
                  {displayPan(digitsOnly, brand)}
                </p>
              </div>

              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3 sm:bottom-6 sm:left-6 sm:right-6">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-medium uppercase tracking-[0.2em] text-white/75 drop-shadow sm:text-[11px]">
                    {displayName}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-wider text-white/50">
                      Valid thru
                    </p>
                    <span className="font-mono text-sm font-medium tracking-wider text-white drop-shadow sm:text-base">
                      {displayExpiryFormatted}
                    </span>
                  </div>
                  <CardNetworkLogo brand={brand} />
                </div>
              </div>
            </div>

            {/* Back */}
            <div
              className={cn(
                "absolute inset-0 overflow-hidden rounded-[1.1rem] border border-white/[0.12] text-white shadow-2xl [backface-visibility:hidden] sm:rounded-2xl",
                `bg-gradient-to-br ${face.gradient}`
              )}
              style={{ transform: "rotateY(180deg)" }}
            >
              <div className="mt-9 h-11 w-full bg-[#1a1a1a] shadow-inner" aria-hidden />
              <div className="absolute right-4 top-4 rounded border border-white/10 bg-black/20 px-2 py-1 text-[9px] text-white/40">
                {brand === "amex" ? "AMEX" : brand.toUpperCase()}
              </div>
              <div className="mt-7 px-5 sm:px-6">
                <div className="flex justify-end">
                  <div className="w-[88%] rounded border border-slate-200/80 bg-gradient-to-b from-white to-slate-100 py-2.5 pl-4 pr-4 text-right shadow-md">
                    <span className="font-mono text-xl font-semibold tracking-[0.35em] text-slate-900">
                      {cardCvc.length > 0
                        ? `${"•".repeat(Math.max(0, cardCvc.length - 1))}${cardCvc.slice(-1)}`
                        : "•••"}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-right text-[10px] font-medium uppercase tracking-wider text-white/55">
                  Authorized signature — not valid unless signed
                </p>
              </div>
              <div className="absolute bottom-5 left-5 max-w-[55%] text-[10px] leading-snug text-white/45">
                This card is property of the issuer. Demo UI only.
              </div>
              <div className="absolute bottom-5 right-5">
                <CardNetworkLogo brand={brand} />
              </div>
            </div>
          </div>
        </div>

        {!flipped ? (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-card-name`}>Name on card</Label>
              <Input
                id={`${idPrefix}-card-name`}
                placeholder="Olivia Rhye"
                autoComplete="off"
                name={`${idPrefix}-cc-name`}
                value={cardName}
                onChange={(e) => onCardNameChange(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-card-number`}>Card number</Label>
              <Input
                id={`${idPrefix}-card-number`}
                className="mt-1 font-mono"
                placeholder={
                  brand === "amex"
                    ? "3782 822463 10005"
                    : "4532 1488 0343 6467"
                }
                autoComplete="off"
                name={`${idPrefix}-cc-number`}
                inputMode="numeric"
                value={formatCardNumberInput(cardNumber, brand)}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  const b = detectCardBrand(raw);
                  onCardNumberChange(raw.slice(0, maxPanDigits(b)));
                }}
              />
              <p className="text-xs text-muted-foreground">
                Detected:{" "}
                <span className="font-medium capitalize text-foreground">
                  {brand === "unknown" ? "Enter digits to detect" : brand}
                </span>
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-card-exp`}>Expiry (MM/YY)</Label>
              <Input
                id={`${idPrefix}-card-exp`}
                className="mt-1 font-mono"
                placeholder="06/28"
                autoComplete="off"
                name={`${idPrefix}-cc-exp`}
                inputMode="numeric"
                value={formatExpiryInput(cardExpiry.replace(/\D/g, ""))}
                onChange={(e) =>
                  onCardExpiryChange(e.target.value.replace(/\D/g, ""))
                }
              />
            </div>
            <Button
              type="button"
              className="w-full"
              disabled={!frontComplete}
              onClick={handleContinueToCvv}
            >
              Continue to CVV
            </Button>
            {!frontComplete && (
              <p className="text-center text-xs text-muted-foreground">
                Enter full {panLen}-digit number (Amex: 15, others: 16), name,
                and expiry.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              The card has flipped to the back. Enter your{" "}
              {cvvMax === 4 ? "4-digit" : "3-digit"} security code (demo only).
            </p>
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-card-cvc`}>CVV</Label>
              <Input
                id={`${idPrefix}-card-cvc`}
                className="mt-1 font-mono text-lg tracking-widest"
                placeholder={cvvMax === 4 ? "••••" : "•••"}
                autoComplete="off"
                name={`${idPrefix}-cc-cvc`}
                inputMode="numeric"
                maxLength={cvvMax}
                value={cardCvc}
                onChange={(e) =>
                  onCardCvcChange(
                    e.target.value.replace(/\D/g, "").slice(0, cvvMax)
                  )
                }
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={handleBackToFront}
              >
                Edit card details
              </Button>
              <Button
                type="button"
                className="w-full sm:w-auto"
                disabled={cardCvc.trim().length < cvvMax}
                onClick={() => onOpenChange(false)}
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
