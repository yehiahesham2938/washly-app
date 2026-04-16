/** Slot label used in booking UI and API (12-hour, e.g. "9:00 AM"). */
function minutesToSlotLabel(minutesFromMidnight: number): string {
  const h24 = Math.floor(minutesFromMidnight / 60);
  const m = minutesFromMidnight % 60;
  const ampm = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const mm = String(m).padStart(2, "0");
  return `${h12}:${mm} ${ampm}`;
}

/** 30-minute steps from open through close (inclusive of both ends as slot start times). */
export function buildSlotsInRange(
  openMinutes: number,
  closeMinutes: number
): string[] {
  const slots: string[] = [];
  let t = openMinutes;
  while (t <= closeMinutes) {
    slots.push(minutesToSlotLabel(t));
    t += 30;
  }
  return slots;
}

/** Default home-booking window: 9:00 AM through 5:00 PM (legacy catalog). */
export function getTimeSlots(): string[] {
  return buildSlotsInRange(9 * 60, 17 * 60);
}
