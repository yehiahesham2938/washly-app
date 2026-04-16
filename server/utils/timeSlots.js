/** Must match client `buildSlotsInRange` / `getTimeSlots` in client/src/lib/timeSlots.ts */

function minutesToSlotLabel(minutesFromMidnight) {
  const h24 = Math.floor(minutesFromMidnight / 60);
  const m = minutesFromMidnight % 60;
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const mm = String(m).padStart(2, '0');
  return `${h12}:${mm} ${ampm}`;
}

function buildSlotsInRange(openMinutes, closeMinutes) {
  const slots = [];
  let t = openMinutes;
  while (t <= closeMinutes) {
    slots.push(minutesToSlotLabel(t));
    t += 30;
  }
  return slots;
}

function getTimeSlots() {
  return buildSlotsInRange(9 * 60, 17 * 60);
}

const SLOT_COUNT = getTimeSlots().length;

module.exports = { getTimeSlots, SLOT_COUNT, buildSlotsInRange, minutesToSlotLabel };
