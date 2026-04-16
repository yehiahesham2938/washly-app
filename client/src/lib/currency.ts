const egpFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

/** Format amounts in Egyptian Pounds (Western digits, stable across browsers). */
export function formatEgp(amount: number): string {
  const n = Number.isFinite(amount) ? Math.round(Number(amount)) : 0;
  return `${egpFormatter.format(n)} EGP`;
}
