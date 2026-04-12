/** Must match client `getTimeSlots` in client/src/lib/timeSlots.ts */
function getTimeSlots() {
  const slots = [];
  let minutesFromMidnight = 9 * 60;
  const end = 17 * 60;
  while (minutesFromMidnight <= end) {
    const h24 = Math.floor(minutesFromMidnight / 60);
    const m = minutesFromMidnight % 60;
    const ampm = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    slots.push(`${h12}:${m === 0 ? '00' : '30'} ${ampm}`);
    minutesFromMidnight += 30;
  }
  return slots;
}

const SLOT_COUNT = getTimeSlots().length;

module.exports = { getTimeSlots, SLOT_COUNT };
