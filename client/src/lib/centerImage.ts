/** Local fallback when remote URL fails or is missing (always loads from same origin). */
export const CENTER_IMAGE_PLACEHOLDER = "/hero-bg.png";

/** Normalize stored image URLs for <img src> (https, protocol-relative, data URLs). */
export function normalizeCenterImageSrc(
  raw: string | undefined | null
): string | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  if (s.startsWith("data:")) return s;
  if (s.startsWith("//")) return `https:${s}`;
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("/")) return s;
  return `https://${s}`;
}
