/** Detect payment network from partial card number (IIN / BIN rules, simplified). */
export type CardBrand =
  | "visa"
  | "mastercard"
  | "amex"
  | "discover"
  | "diners"
  | "jcb"
  | "unionpay"
  | "unknown";

export function detectCardBrand(digits: string): CardBrand {
  const d = digits.replace(/\D/g, "");
  if (!d.length) return "unknown";

  if (d[0] === "4") return "visa";

  if (d[0] === "2" && d.length >= 4) {
    const p4 = parseInt(d.slice(0, 4), 10);
    if (p4 >= 2221 && p4 <= 2720) return "mastercard";
  }

  if (d[0] === "5") {
    const p2 = parseInt(d.slice(0, 2), 10);
    if (p2 >= 51 && p2 <= 55) return "mastercard";
  }

  if (d[0] === "3") {
    if (d.startsWith("34") || d.startsWith("37")) return "amex";
    if (d.startsWith("36") || d.startsWith("38")) return "diners";
    if (d.length >= 4) {
      const p4 = parseInt(d.slice(0, 4), 10);
      if (p4 >= 3528 && p4 <= 3589) return "jcb";
    }
  }

  if (d[0] === "6") {
    if (d.startsWith("6011")) return "discover";
    if (d.startsWith("65")) return "discover";
    if (d.length >= 3) {
      const p3 = parseInt(d.slice(0, 3), 10);
      if (p3 >= 644 && p3 <= 649) return "discover";
    }
    if (d.startsWith("62")) return "unionpay";
  }

  return "unknown";
}

/** Full PAN length for validation (most cards). */
export function expectedPanLength(brand: CardBrand): number {
  if (brand === "amex") return 15;
  return 16;
}

/** Max digits to accept in the number field. */
export function maxPanDigits(brand: CardBrand): number {
  if (brand === "amex") return 15;
  return 16;
}

export function expectedCvvLength(brand: CardBrand): number {
  if (brand === "amex") return 4;
  return 3;
}
