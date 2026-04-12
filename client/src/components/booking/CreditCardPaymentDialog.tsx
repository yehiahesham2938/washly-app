import { useEffect, useMemo, useState } from "react";

import {
  CARD_BRAND_FACE,
  CardNetworkLogo,
  CreditCardFrontFace,
} from "@/components/booking/CreditCardFrontFace";
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
import { isCardExpiryValid } from "@/lib/cardExpiry";
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
  /** Called when the user finishes CVV and taps Done (card is complete). */
  onCardConfirmed?: () => void;
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
  onCardConfirmed,
}: Props) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (open) setFlipped(false);
  }, [open]);

  const digitsOnly = cardNumber.replace(/\D/g, "");
  const brand = useMemo(() => detectCardBrand(digitsOnly), [digitsOnly]);
  const face = CARD_BRAND_FACE[brand];
  const expDigitsOnly = cardExpiry.replace(/\D/g, "").slice(0, 4);
  const cvvMax = expectedCvvLength(brand);
  const panLen = expectedPanLength(brand);

  const expiryValid =
    expDigitsOnly.length === 4 && isCardExpiryValid(expDigitsOnly);

  const frontComplete =
    cardName.trim().length >= 2 &&
    digitsOnly.length === panLen &&
    expiryValid;

  function handleContinueToCvv() {
    if (!frontComplete) return;
    if (!isCardExpiryValid(expDigitsOnly)) {
      return;
    }
    setFlipped(true);
  }

  function handleBackToFront() {
    setFlipped(false);
  }

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
            <CreditCardFrontFace
              variant="dialog"
              cardName={cardName}
              cardNumberDigits={cardNumber}
              cardExpiryDigits={cardExpiry}
            />

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
            {expDigitsOnly.length === 4 && !expiryValid ? (
              <p className="text-center text-xs font-medium text-destructive">
                This card has expired. Enter a valid expiry (MM/YY) that is
                not in the past.
              </p>
            ) : !frontComplete ? (
              <p className="text-center text-xs text-muted-foreground">
                Enter full {panLen}-digit number (Amex: 15, others: 16), name,
                and a future expiry.
              </p>
            ) : null}
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
                onClick={() => {
                  if (cardCvc.trim().length >= cvvMax) {
                    onCardConfirmed?.();
                    onOpenChange(false);
                  }
                }}
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
