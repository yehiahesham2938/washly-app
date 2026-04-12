import {

  forwardRef,

  useEffect,

  useImperativeHandle,

  useRef,

  useState,

} from "react";

import { Banknote, CreditCard, Pencil, Plus, Trash2, Wallet } from "lucide-react";

import { toast } from "sonner";



import { CreditCardFrontFace } from "@/components/booking/CreditCardFrontFace";

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

  isValidEgyptianMobile,

  maskEgyptianMobileDisplay,

} from "@/lib/egyptianPhone";

import { isCardExpiryValid } from "@/lib/cardExpiry";

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



type SavedCard = {

  id: string;

  cardName: string;

  cardNumber: string;

  cardExpiry: string;

  cardCvc: string;

};



type WalletEntry = {

  id: string;

  number: string;

};



type Props = {

  idPrefix: string;

  payment: BookingPaymentMethod;

  onPaymentChange: (p: BookingPaymentMethod) => void;

  /** e.g. "Cash on Arrival" for home wash */

  cashLabel?: string;

};



function maskPanLast4(panDigits: string): string {

  const d = panDigits.replace(/\D/g, "");

  if (d.length < 4) return "••••";

  return `•••• ${d.slice(-4)}`;

}



function formatExpiryDisplay(mmYYDigits: string): string {

  const d = mmYYDigits.replace(/\D/g, "").slice(0, 4);

  if (d.length <= 2) return d;

  return `${d.slice(0, 2)}/${d.slice(2)}`;

}



function cardIsComplete(c: SavedCard): boolean {

  const digits = c.cardNumber.replace(/\D/g, "");

  const brand = detectCardBrand(digits);

  const needPan = expectedPanLength(brand);

  const needCvv = expectedCvvLength(brand);

  const expDigits = c.cardExpiry.replace(/\D/g, "");

  return (

    digits.length === needPan &&

    expDigits.length === 4 &&

    isCardExpiryValid(expDigits) &&

    c.cardCvc.trim().length >= needCvv &&

    c.cardName.trim().length >= 2

  );

}



export const PaymentMethodSection = forwardRef<

  PaymentMethodSectionHandle,

  Props

>(function PaymentMethodSection(

  { idPrefix, payment, onPaymentChange, cashLabel = "Cash" },

  ref

) {

  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const [editingCardId, setEditingCardId] = useState<string | null>(null);



  const [cardName, setCardName] = useState("");

  const [cardNumber, setCardNumber] = useState("");

  const [cardExpiry, setCardExpiry] = useState("");

  const [cardCvc, setCardCvc] = useState("");



  const [walletEntries, setWalletEntries] = useState<WalletEntry[]>([]);

  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);

  const [walletDraft, setWalletDraft] = useState("");



  const [walletDialogOpen, setWalletDialogOpen] = useState(false);

  const [cardDialogOpen, setCardDialogOpen] = useState(false);

  const prevPayment = useRef<BookingPaymentMethod | undefined>(undefined);



  useEffect(() => {

    setSelectedCardId((prev) => {

      if (!savedCards.length) return null;

      if (prev && savedCards.some((c) => c.id === prev)) return prev;

      return savedCards[0].id;

    });

  }, [savedCards]);



  useEffect(() => {

    setSelectedWalletId((prev) => {

      if (!walletEntries.length) return null;

      if (prev && walletEntries.some((w) => w.id === prev)) return prev;

      return walletEntries[0].id;

    });

  }, [walletEntries]);



  useEffect(() => {

    if (payment === "wallet" && prevPayment.current !== "wallet") {

      if (walletEntries.length === 0) setWalletDialogOpen(true);

    }

    if (payment === "card" && prevPayment.current !== "card") {

      if (savedCards.length === 0) {

        setEditingCardId(null);

        setCardName("");

        setCardNumber("");

        setCardExpiry("");

        setCardCvc("");

        setCardDialogOpen(true);

      }

    }

    prevPayment.current = payment;

  }, [payment, walletEntries.length, savedCards.length]);



  useEffect(() => {

    if (payment !== "card") setCardDialogOpen(false);

  }, [payment]);



  function openAddCardDialog() {

    setEditingCardId(null);

    setCardName("");

    setCardNumber("");

    setCardExpiry("");

    setCardCvc("");

    setCardDialogOpen(true);

  }



  function openEditCardDialog(id: string) {

    const c = savedCards.find((x) => x.id === id);

    if (!c) return;

    setEditingCardId(id);

    setCardName(c.cardName);

    setCardNumber(c.cardNumber.replace(/\D/g, ""));

    setCardExpiry(c.cardExpiry.replace(/\D/g, ""));

    setCardCvc(c.cardCvc);

    setCardDialogOpen(true);

  }



  function removeCard(id: string) {

    setSavedCards((prev) => prev.filter((c) => c.id !== id));

  }



  function handleCardConfirmed() {

    const digits = cardNumber.replace(/\D/g, "");

    const brand = detectCardBrand(digits);

    const expDigits = cardExpiry.replace(/\D/g, "");

    const needPan = expectedPanLength(brand);

    const needCvv = expectedCvvLength(brand);

    if (

      digits.length !== needPan ||

      expDigits.length !== 4 ||

      !isCardExpiryValid(expDigits) ||

      cardCvc.trim().length < needCvv ||

      cardName.trim().length < 2

    ) {

      return;

    }

    const entry: SavedCard = {

      id: editingCardId ?? crypto.randomUUID(),

      cardName: cardName.trim(),

      cardNumber,

      cardExpiry,

      cardCvc,

    };

    if (editingCardId) {

      setSavedCards((prev) =>

        prev.map((c) => (c.id === editingCardId ? entry : c))

      );

      setEditingCardId(null);

    } else {

      setSavedCards((prev) => [...prev, entry]);

      setSelectedCardId(entry.id);

    }

  }



  function addWalletFromDraft() {

    const t = walletDraft.trim();

    if (!t) {

      toast.error("Enter an Egyptian mobile number first.");

      return;

    }

    if (!isValidEgyptianMobile(t)) {

      toast.error(

        "Enter a valid Egyptian mobile (01XX XXX XXXX or +20 10 XXX XXXX)."

      );

      return;

    }

    const id = crypto.randomUUID();

    setWalletEntries((prev) => [...prev, { id, number: t }]);

    setSelectedWalletId(id);

    setWalletDraft("");

  }



  function removeWallet(id: string) {

    setWalletEntries((prev) => prev.filter((w) => w.id !== id));

  }



  const selectedCard = savedCards.find((c) => c.id === selectedCardId);

  const selectedWallet = walletEntries.find((w) => w.id === selectedWalletId);



  useImperativeHandle(ref, () => ({

    validateMockInputs: () => {

      if (payment === "cash") return true;

      if (payment === "card") {

        if (!selectedCard || !cardIsComplete(selectedCard)) {

          toast.error(

            "Add a valid card and select it to use (demo — not stored)."

          );

          if (savedCards.length === 0) openAddCardDialog();

          else setCardDialogOpen(true);

          return false;

        }

        const expDigits = selectedCard.cardExpiry.replace(/\D/g, "");

        if (expDigits.length === 4 && !isCardExpiryValid(expDigits)) {

          toast.error(

            "The selected card’s expiry date has passed. Edit or pick another card."

          );

          setCardDialogOpen(true);

          return false;

        }

        return true;

      }

      if (payment === "wallet") {

        if (!selectedWallet || !isValidEgyptianMobile(selectedWallet.number)) {

          toast.error(

            "Add a valid Egyptian mobile and select it (demo only — not saved)."

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

            <div className="space-y-4 rounded-lg border border-dashed border-border bg-muted/30 p-4">

              {savedCards.length > 0 && (

                <div className="space-y-2">

                  <p className="text-xs font-medium text-muted-foreground">

                    Choose a card

                  </p>

                  <RadioGroup

                    value={selectedCardId ?? ""}

                    onValueChange={setSelectedCardId}

                    className="gap-2"

                  >

                    {savedCards.map((c) => {

                      const d = c.cardNumber.replace(/\D/g, "");

                      const brand = detectCardBrand(d);

                      return (

                        <div

                          key={c.id}

                          className={cn(

                            "flex flex-wrap items-center gap-2 rounded-lg border bg-background p-3",

                            selectedCardId === c.id

                              ? "border-primary"

                              : "border-border"

                          )}

                        >

                          <RadioGroupItem

                            value={c.id}

                            id={`${idPrefix}-pick-card-${c.id}`}

                            className="shrink-0"

                          />

                          <Label

                            htmlFor={`${idPrefix}-pick-card-${c.id}`}

                            className="min-w-0 flex-1 cursor-pointer space-y-0.5"

                          >

                            <p className="font-mono text-sm font-medium">

                              {maskPanLast4(d)}{" "}

                              <span className="text-xs font-normal capitalize text-muted-foreground">

                                ({brand === "unknown" ? "card" : brand})

                              </span>

                            </p>

                            <p className="text-xs text-muted-foreground">

                              {c.cardName.trim() || "Cardholder"} ·{" "}

                              {formatExpiryDisplay(c.cardExpiry)}

                            </p>

                          </Label>

                          <div className="flex shrink-0 items-center gap-1">

                            <Button

                              type="button"

                              variant="ghost"

                              size="icon"

                              className="h-8 w-8"

                              aria-label="Edit card"

                              onClick={(e) => {

                                e.preventDefault();

                                openEditCardDialog(c.id);

                              }}

                            >

                              <Pencil className="h-4 w-4" />

                            </Button>

                            {savedCards.length > 1 && (

                              <Button

                                type="button"

                                variant="ghost"

                                size="icon"

                                className="h-8 w-8 text-destructive hover:text-destructive"

                                aria-label="Remove card"

                                onClick={(e) => {

                                  e.preventDefault();

                                  removeCard(c.id);

                                }}

                              >

                                <Trash2 className="h-4 w-4" />

                              </Button>

                            )}

                          </div>

                        </div>

                      );

                    })}

                  </RadioGroup>

                </div>

              )}



              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

                <div className="mx-auto w-full max-w-[300px] shrink-0 sm:mx-0">

                  <CreditCardFrontFace

                    variant="inline"

                    cardName={selectedCard?.cardName ?? ""}

                    cardNumberDigits={selectedCard?.cardNumber ?? ""}

                    cardExpiryDigits={selectedCard?.cardExpiry ?? ""}

                  />

                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">

                  <p className="text-xs text-muted-foreground">

                    Live preview of the{" "}

                    <span className="font-medium text-foreground">selected</span>{" "}

                    card. Add cards in the popup; nothing is saved or sent.

                  </p>

                  <div className="flex flex-wrap gap-2">

                    <Button

                      type="button"

                      variant="secondary"

                      className="shrink-0"

                      onClick={openAddCardDialog}

                    >

                      <Plus className="mr-1.5 h-4 w-4" />

                      {savedCards.length ? "Add another card" : "Add card"}

                    </Button>

                    {savedCards.length > 0 && selectedCardId && (

                      <Button

                        type="button"

                        variant="outline"

                        size="default"

                        className="shrink-0"

                        onClick={() => openEditCardDialog(selectedCardId)}

                      >

                        <Pencil className="mr-1.5 h-4 w-4" />

                        Edit selected

                      </Button>

                    )}

                  </div>

                </div>

              </div>

            </div>

          )}



          {payment === "wallet" && (

            <div className="space-y-3 rounded-lg border border-dashed border-border bg-muted/30 p-4">

              {walletEntries.length > 0 && (

                <div className="space-y-2">

                  <p className="text-xs font-medium text-muted-foreground">

                    Choose a wallet number

                  </p>

                  <RadioGroup

                    value={selectedWalletId ?? ""}

                    onValueChange={setSelectedWalletId}

                    className="gap-2"

                  >

                    {walletEntries.map((w) => (

                      <div

                        key={w.id}

                        className={cn(

                          "flex flex-wrap items-center gap-2 rounded-lg border bg-background p-3",

                          selectedWalletId === w.id

                            ? "border-primary"

                            : "border-border"

                        )}

                      >

                        <RadioGroupItem

                          value={w.id}

                          id={`${idPrefix}-pick-wallet-${w.id}`}

                          className="shrink-0"

                        />

                        <Label

                          htmlFor={`${idPrefix}-pick-wallet-${w.id}`}

                          className="min-w-0 flex-1 cursor-pointer font-mono text-sm"

                        >

                          {maskEgyptianMobileDisplay(w.number)}

                        </Label>

                        {walletEntries.length > 1 && (

                          <Button

                            type="button"

                            variant="ghost"

                            size="icon"

                            className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"

                            aria-label="Remove number"

                            onClick={(e) => {

                              e.preventDefault();

                              removeWallet(w.id);

                            }}

                          >

                            <Trash2 className="h-4 w-4" />

                          </Button>

                        )}

                      </div>

                    ))}

                  </RadioGroup>

                </div>

              )}

              <div className="flex flex-wrap items-center gap-2 text-sm">

                <span className="text-muted-foreground">

                  {walletEntries.length

                    ? "Selected number is used for this booking (demo only)."

                    : "Add at least one Egyptian mobile number."}

                </span>

                <Button

                  type="button"

                  variant="outline"

                  size="sm"

                  onClick={() => setWalletDialogOpen(true)}

                >

                  <Plus className="mr-1.5 h-4 w-4" />

                  {walletEntries.length ? "Add number" : "Add wallet number"}

                </Button>

              </div>

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

        onCardConfirmed={handleCardConfirmed}

      />



      <Dialog open={walletDialogOpen} onOpenChange={setWalletDialogOpen}>

        <DialogContent className="sm:max-w-md">

          <DialogHeader>

            <DialogTitle>Digital wallet</DialogTitle>

            <DialogDescription>

              Add Egyptian mobile numbers linked to your wallet (010 / 011 / 012

              / 015 or +20). Add several and pick one in the list. Demo only —

              nothing is stored or sent.

            </DialogDescription>

          </DialogHeader>

          <div className="space-y-2 py-1">

            <Label htmlFor={`${idPrefix}-wallet-num`}>Egyptian mobile</Label>

            <div className="flex flex-col gap-2 sm:flex-row">

              <Input

                id={`${idPrefix}-wallet-num`}

                type="tel"

                inputMode="tel"

                placeholder="01XX XXX XXXX or +20 10 XXX XXXX"

                autoComplete="tel"

                name={`${idPrefix}-wallet`}

                value={walletDraft}

                onChange={(e) => setWalletDraft(e.target.value)}

                onKeyDown={(e) => {

                  if (e.key === "Enter") {

                    e.preventDefault();

                    addWalletFromDraft();

                  }

                }}

                aria-invalid={

                  walletDraft.trim().length > 0 &&

                  !isValidEgyptianMobile(walletDraft)

                }

                className={cn(

                  "font-mono sm:flex-1",

                  walletDraft.trim().length > 0 &&

                    !isValidEgyptianMobile(walletDraft) &&

                    "border-destructive focus-visible:ring-destructive"

                )}

              />

              <Button type="button" onClick={addWalletFromDraft}>

                Add

              </Button>

            </div>

            {walletDraft.trim().length > 0 &&

              !isValidEgyptianMobile(walletDraft) && (

                <p className="text-xs text-destructive">

                  Use a valid Egyptian mobile: 11 digits starting with 010, 011,

                  012, or 015, or +20 with the same number range.

                </p>

              )}

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


