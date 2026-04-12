/**
 * Egyptian mobile: carriers use 010, 011, 012, 015 (+20 10/11/12/15…).
 * Accepts local (01…), national without leading 0 (1…), or international (+20 / 0020).
 */

const NSN = /^(10|11|12|15)\d{8}$/;

/**
 * Returns normalized 11-digit local form `01XXXXXXXXX`, or null if invalid.
 */
export function normalizeEgyptianMobile(input: string): string | null {
  let d = input.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("20") && d.length >= 12) {
    const rest = d.slice(2);
    if (NSN.test(rest)) return `0${rest}`;
  }
  if (/^0(10|11|12|15)\d{8}$/.test(d)) return d;
  if (NSN.test(d)) return `0${d}`;
  return null;
}

export function isValidEgyptianMobile(input: string): boolean {
  return normalizeEgyptianMobile(input) !== null;
}

/** Short masked label for lists (e.g. `010 ••• •789`). */
export function maskEgyptianMobileDisplay(input: string): string {
  const n = normalizeEgyptianMobile(input);
  if (!n || n.length < 4) return "••••";
  return `${n.slice(0, 3)} ••• •${n.slice(-3)}`;
}
