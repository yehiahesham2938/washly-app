/** 9:00 AM through 5:00 PM in 30-minute steps */
export function getTimeSlots(): string[] {
  const slots: string[] = [];
  let minutesFromMidnight = 9 * 60; // 9:00 AM
  const end = 17 * 60; // 5:00 PM

  while (minutesFromMidnight <= end) {
    const h24 = Math.floor(minutesFromMidnight / 60);
    const m = minutesFromMidnight % 60;
    const ampm = h24 >= 12 ? "PM" : "AM";
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    slots.push(`${h12}:${m === 0 ? "00" : "30"} ${ampm}`);
    minutesFromMidnight += 30;
  }

  return slots;
}
