import type { WashCenter, Weekday } from "@/types";
import {
  parseDailyHoursToTimeInputs,
  parseWorkingDaysFromHours,
  sortWeekdays,
} from "@/lib/dailyHours";
import { buildSlotsInRange } from "@/lib/timeSlots";

/** Weekday for a calendar `yyyy-MM-dd` (interpreted as that civil date in UTC). */
export function ymdToWeekday(ymd: string): Weekday {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const map: Weekday[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return map[dt.getUTCDay()]!;
}

export function getWorkingDaysForCenter(center: WashCenter): Weekday[] {
  if (center.workingDays && center.workingDays.length > 0) {
    return sortWeekdays(center.workingDays);
  }
  return parseWorkingDaysFromHours(center.hours);
}

export function isYmdOpenForCenter(center: WashCenter, ymd: string): boolean {
  return getWorkingDaysForCenter(center).includes(ymdToWeekday(ymd));
}

function openCloseToMinutes(center: WashCenter): { openMin: number; closeMin: number } {
  const { open, close } = parseDailyHoursToTimeInputs(
    center.hours,
    center.hoursShort
  );
  const [oh, om] = open.split(":").map((x) => Number.parseInt(x, 10));
  const [ch, cm] = close.split(":").map((x) => Number.parseInt(x, 10));
  return {
    openMin: oh * 60 + om,
    closeMin: ch * 60 + cm,
  };
}

/** All bookable slot labels for this center (same window on each working day). */
export function getCenterTimeSlots(center: WashCenter): string[] {
  const { openMin, closeMin } = openCloseToMinutes(center);
  return buildSlotsInRange(openMin, closeMin);
}

/** Slots available on a specific date, or empty if the center is closed that day. */
export function getCenterTimeSlotsForYmd(
  center: WashCenter,
  ymd: string
): string[] {
  if (!isYmdOpenForCenter(center, ymd)) return [];
  return getCenterTimeSlots(center);
}
