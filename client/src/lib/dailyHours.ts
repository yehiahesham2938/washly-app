import type { Weekday } from "@/types";

/** Weekday keys (Mon–Sun), same as stored `workingDays` and hour prefixes. */
export const DAY_ORDER: Weekday[] = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

export const ALL_WEEKDAYS: Weekday[] = [...DAY_ORDER];

export type { Weekday } from "@/types";

export function sortWeekdays(days: Weekday[]): Weekday[] {
  return [...new Set(days)].sort(
    (a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b)
  );
}

/** Keep only valid weekday tokens; empty input → full week. */
export function normalizeWorkingDays(
  days: Weekday[] | undefined | null
): Weekday[] {
  if (!days?.length) return [...ALL_WEEKDAYS];
  const valid = days.filter((d): d is Weekday =>
    DAY_ORDER.includes(d as Weekday)
  );
  const sorted = sortWeekdays(valid);
  return sorted.length ? sorted : [...ALL_WEEKDAYS];
}

/** "Mon–Fri", "Mon, Wed", "Mon–Wed, Fri–Sun", … */
export function formatWorkingDaysPrefix(days: Weekday[]): string {
  const sorted = sortWeekdays(days);
  if (sorted.length === 0) return "Mon–Sun";
  if (sorted.length === 7) return "Mon–Sun";

  const runs: Weekday[][] = [];
  let current: Weekday[] = [sorted[0]!];
  for (let i = 1; i < sorted.length; i++) {
    const prev = DAY_ORDER.indexOf(sorted[i - 1]!);
    const cur = DAY_ORDER.indexOf(sorted[i]!);
    if (cur === prev + 1) {
      current.push(sorted[i]!);
    } else {
      runs.push(current);
      current = [sorted[i]!];
    }
  }
  runs.push(current);

  return runs
    .map((run) =>
      run.length === 1 ? run[0] : `${run[0]}–${run[run.length - 1]}`
    )
    .join(", ");
}

function parseWeekdayToken(s: string): Weekday | null {
  const t = s.trim();
  if (t.length < 3) return null;
  const head = t.slice(0, 3);
  const hit = DAY_ORDER.find((d) => d.toLowerCase() === head.toLowerCase());
  return hit ?? null;
}

/** Expand "Mon–Fri", "Wed–Mon" (wrap), "Mon, Wed", … */
export function expandDayPrefix(prefix: string): Weekday[] {
  const norm = prefix
    .replace(/\s+/g, " ")
    .replace(/[—]/g, "–")
    .trim();
  if (!norm) return [...ALL_WEEKDAYS];

  const chunks = norm.split(",").map((c) => c.trim()).filter(Boolean);
  const out: Weekday[] = [];

  for (const chunk of chunks) {
    const parts = chunk.split(/\s*[–-]\s*/).map((p) => p.trim());
    if (parts.length === 2 && parts[0] && parts[1]) {
      const a = parseWeekdayToken(parts[0]);
      const b = parseWeekdayToken(parts[1]);
      if (a && b) {
        let i0 = DAY_ORDER.indexOf(a);
        const i1 = DAY_ORDER.indexOf(b);
        if (i0 <= i1) {
          for (let i = i0; i <= i1; i++) out.push(DAY_ORDER[i]!);
        } else {
          for (let i = i0; i <= 6; i++) out.push(DAY_ORDER[i]!);
          for (let i = 0; i <= i1; i++) out.push(DAY_ORDER[i]!);
        }
        continue;
      }
    }
    const one = parseWeekdayToken(chunk);
    if (one) out.push(one);
  }

  return sortWeekdays(Array.from(new Set(out)));
}

/** Infer open days from stored `hours` line (before ":"). */
export function parseWorkingDaysFromHours(hours: string): Weekday[] {
  const s = hours?.trim() ?? "";
  if (!s) return [...ALL_WEEKDAYS];
  const colon = s.indexOf(":");
  if (colon < 0) return [...ALL_WEEKDAYS];
  const prefix = s.slice(0, colon).trim();
  if (!prefix) return [...ALL_WEEKDAYS];
  const expanded = expandDayPrefix(prefix);
  return expanded.length ? expanded : [...ALL_WEEKDAYS];
}

function stripDayPrefixFromHours(hours: string): string {
  return hours.replace(/^[^:]+:\s*/, "").trim();
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

/** Build stored `hours` / `hoursShort` from selected days and daily window. */
export function buildCenterSchedule(
  workingDays: Weekday[],
  open24: string,
  close24: string
): { hours: string; hoursShort: string } {
  const days = sortWeekdays(workingDays);
  const effective = days.length ? days : [...ALL_WEEKDAYS];
  const dayPrefix = formatWorkingDaysPrefix(effective);
  const o = parseTimeHHmm(open24);
  const c = parseTimeHHmm(close24);
  const short = `${format12(o)} – ${format12(c)}`;
  const fullLine = `${dayPrefix}: ${short}`;
  const hoursShort =
    effective.length === 7 ? short : `${dayPrefix} · ${short}`;
  return { hours: fullLine, hoursShort };
}

/** @deprecated Prefer {@link buildCenterSchedule} with explicit days. */
export function buildDailyHours(
  open24: string,
  close24: string
): { hours: string; hoursShort: string } {
  return buildCenterSchedule(ALL_WEEKDAYS, open24, close24);
}

/**
 * Parse open/close for time inputs from existing `hoursShort` or `hours`.
 * Defaults to 9:00–18:00 if unrecognized.
 */
function stripDaySummaryFromHoursShort(s: string): string {
  const t = s.trim();
  if (!t) return t;
  if (t.includes("·")) return t.split("·").pop()?.trim() ?? t;
  return t;
}

export function parseDailyHoursToTimeInputs(
  hours: string,
  hoursShort?: string
): { open: string; close: string } {
  const fromShort = (hoursShort && hoursShort.trim() ? hoursShort : "").trim();
  const raw =
    stripDaySummaryFromHoursShort(fromShort) ||
    stripDayPrefixFromHours(hours || "");
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
