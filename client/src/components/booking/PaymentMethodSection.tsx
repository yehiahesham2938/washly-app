import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Banknote, CreditCard, Wallet } from "lucide-react";
import { toast } from "sonner";

import { CreditCardPaymentDialog } from "@/components/booking/CreditCardPaymentDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  detectCardBrand,
  expectedCvvLength,
  expectedPanLength,
} from "@/lib/cardBrand";
import { cn } from "@/lib/utils";

export type BookingPaymentMethod = "card" | "cash" | "wallet";

export type PaymentMethodSectionHandle = {
  validateMockInputs: () => boolean;
};

type Props = {
  idPrefix: string;
  payment: BookingPaymentMethod;
  onPaymentChange: (p: BookingPaymentMethod) => void;
  /** e.g. "Cash on Arrival" for home wash */
  cashLabel?: string;
};

export const PaymentMethodSection = forwardRef<
  PaymentMethodSectionHandle,
  Props
>(function PaymentMethodSection(
  { idPrefix, payment, onPaymentChange, cashLabel = "Cash" },
  ref
) {
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [walletNumber, setWalletNumber] = useState("");
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const prevPayment = useRef(payment);

  useEffect(() => {
    if (payment === "wallet" && prevPayment.current !== "wallet") {
      setWalletDialogOpen(true);
    }
    if (payment === "card" && prevPayment.current !== "card") {
      setCardDialogOpen(true);
    }
    prevPayment.current = payment;
  }, [payment]);

  useEffect(() => {
    if (payment !== "card") setCardDialogOpen(false);
  }, [payment]);

  useImperativeHandle(ref, () => ({
    validateMockInputs: () => {
      if (payment === "cash") return true;
      if (payment === "card") {
        const digits = cardNumber.replace(/\D/g, "");
        const brand = detectCardBrand(digits);
        const needPan = expectedPanLength(brand);
        const needCvv = expectedCvvLength(brand);
        const expOk = cardExpiry.replace(/\D/g, "").length === 4;
        const ok =
          digits.length === needPan &&
          expOk &&
          cardCvc.trim().length >= needCvv &&
          cardName.trim().length >= 2;
        if (!ok) {
          toast.error(
            "Please complete card details in the popup (demo — not stored)"
          );
          setCardDialogOpen(true);
          return false;
        }
        return true;
      }
      if (payment === "wallet") {
        if (!walletNumber.trim()) {
          toast.error(
            "Please enter your wallet number in the dialog (demo only — not saved)"
          );
          setWalletDialogOpen(true);
          return false;
        }
        return true;
      }
      return true;
    },
  }));

  const options = [
    { val: "card" as const, label: "Credit Card", icon: CreditCard },
    { val: "cash" as const, label: cashLabel, icon: Banknote },
    { val: "wallet" as const, label: "Digital wallet", icon: Wallet },
  ];

  return (
    <>
      <Card className="card-shadow">
        <CardContent className="space-y-4 p-5">
          <h3 className="font-semibold text-card-foreground">
            Payment Method
          </h3>
          <RadioGroup
            value={payment}
            onValueChange={(v) => onPaymentChange(v as BookingPaymentMethod)}
            className="grid gap-3 sm:grid-cols-3"
          >
            {options.map((p) => (
              <Label
                key={p.val}
                htmlFor={`${idPrefix}-pay-${p.val}`}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors",
                  payment === p.val
                    ? "border-primary bg-accent"
                    : "border-border hover:bg-muted"
                )}
              >
                <RadioGroupItem
                  value={p.val}
                  id={`${idPrefix}-pay-${p.val}`}
                />
                <p.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm font-medium">{p.label}</span>
              </Label>
            ))}
          </RadioGroup>

          {payment === "card" && (
            <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Demo checkout — enter details in the popup. Card data is{" "}
                <span className="font-medium text-foreground">not</span> saved
                or transmitted.
              </p>
              <Button
                type="button"
                variant="secondary"
                className="shrink-0"
                onClick={() => setCardDialogOpen(true)}
              >
                {(() => {
                  const d = cardNumber.replace(/\D/g, "");
                  const b = detectCardBrand(d);
                  const complete =
                    d.length === expectedPanLength(b) &&
                    cardExpiry.replace(/\D/g, "").length === 4 &&
                    cardCvc.length >= expectedCvvLength(b) &&
                    cardName.trim().length >= 2;
                  return complete ? "Edit card" : "Enter card";
                })()}
              </Button>
            </div>
          )}

          {payment === "wallet" && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                {walletNumber.trim()
                  ? "Wallet details entered (demo only)."
                  : "Use the dialog to enter your wallet number."}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setWalletDialogOpen(true)}
              >
                {walletNumber.trim() ? "Edit wallet" : "Enter wallet number"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CreditCardPaymentDialog
        open={cardDialogOpen && payment === "card"}
        onOpenChange={setCardDialogOpen}
        idPrefix={idPrefix}
        cardName={cardName}
        onCardNameChange={setCardName}
        cardNumber={cardNumber}
        onCardNumberChange={setCardNumber}
        cardExpiry={cardExpiry}
        onCardExpiryChange={setCardExpiry}
        cardCvc={cardCvc}
        onCardCvcChange={setCardCvc}
      />

      <Dialog open={walletDialogOpen} onOpenChange={setWalletDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Digital wallet</DialogTitle>
            <DialogDescription>
              Enter a wallet or linked phone number for this demo. Nothing here
              is stored or sent to a payment provider.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-1">
            <Label htmlFor={`${idPrefix}-wallet-num`}>Wallet / account</Label>
            <Input
              id={`${idPrefix}-wallet-num`}
              placeholder="+1 555 010 1234 or wallet ID"
              autoComplete="off"
              name={`${idPrefix}-wallet`}
              value={walletNumber}
              onChange={(e) => setWalletNumber(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => setWalletDialogOpen(false)}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});

export function paymentMethodToApi(
  p: BookingPaymentMethod
): "card" | "cash" | "wallet" {
  return p;
}

export function paymentLabelForNotes(
  p: BookingPaymentMethod,
  options?: { cashLabel?: string }
): string {
  if (p === "card") return "Credit card";
  if (p === "wallet") return "Digital wallet";
  return options?.cashLabel ?? "Cash";
}
