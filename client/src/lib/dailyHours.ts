/** Build stored `hours` / `hoursShort` from same daily window (every day). */
export function buildDailyHours(
  open24: string,
  close24: string
): { hours: string; hoursShort: string } {
  const o = parseTimeHHmm(open24);
  const c = parseTimeHHmm(close24);
  const short = `${format12(o)} – ${format12(c)}`;
  return {
    hours: `Mon–Sun: ${short}`,
    hoursShort: short,
  };
}

function parseTimeHHmm(s: string): { h: number; m: number } {
  const [a, b] = s.split(":").map((x) => Number.parseInt(x, 10));
  const h = Number.isFinite(a) ? a : 0;
  const m = Number.isFinite(b) ? b : 0;
  return { h: Math.min(23, Math.max(0, h)), m: Math.min(59, Math.max(0, m)) };
}

function format12(t: { h: number; m: number }): string {
  const d = new Date(2000, 0, 1, t.h, t.m, 0, 0);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Best-effort parse from existing `hoursShort` or `hours` for edit form.
 * Defaults to 9:00–18:00 if unrecognized.
 */
export function parseDailyHoursToTimeInputs(
  hours: string,
  hoursShort?: string
): { open: string; close: string } {
  const raw = (hoursShort || hours || "").replace(/^Mon[–-]Sun:\s*/i, "").trim();
  const m = raw.match(
    /(\d{1,2}):(\d{2})\s*(AM|PM)\s*[–\u2013\-]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i
  );
  if (!m) {
    return { open: "09:00", close: "18:00" };
  }
  const h1 = Number.parseInt(m[1], 10);
  const min1 = Number.parseInt(m[2], 10);
  const h2 = Number.parseInt(m[4], 10);
  const min2 = Number.parseInt(m[5], 10);
  const o24 = to24h(h1, min1, m[3]);
  const c24 = to24h(h2, min2, m[6]);
  return { open: toHHmm(o24), close: toHHmm(c24) };
}

function to24h(
  hour12: number,
  minute: number,
  mer: string
): { h: number; m: number } {
  const pm = mer.toUpperCase() === "PM";
  const am = mer.toUpperCase() === "AM";
  let h = hour12;
  if (am) {
    if (hour12 === 12) h = 0;
  } else if (pm) {
    if (hour12 !== 12) h = hour12 + 12;
  }
  return { h, m: minute };
}

function toHHmm(t: { h: number; m: number }): string {
  return `${String(t.h).padStart(2, "0")}:${String(t.m).padStart(2, "0")}`;
}
