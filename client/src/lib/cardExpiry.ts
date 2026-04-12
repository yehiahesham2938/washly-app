/**
 * Expiry as 4 digits: MMYY (e.g. 0628 = June 2028).
 * Valid through the end of the expiry month (local calendar).
 */
export function isCardExpiryValid(expiryDigits: string): boolean {
  const d = expiryDigits.replace(/\D/g, "").slice(0, 4);
  if (d.length !== 4) return false;
  const mm = parseInt(d.slice(0, 2), 10);
  const yy = parseInt(d.slice(2, 4), 10);
  if (Number.isNaN(mm) || Number.isNaN(yy) || mm < 1 || mm > 12) {
    return false;
  }
  const expYear = 2000 + yy;
  const now = new Date();
  const cy = now.getFullYear();
  const cm = now.getMonth() + 1;
  if (expYear > cy) return true;
  if (expYear < cy) return false;
  return mm >= cm;
}
