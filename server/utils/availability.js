/**
 * Center calendar: only these booking statuses hold a time slot.
 * `completed` and `cancelled` free the slot for new bookings.
 */
const SLOT_BLOCKING_STATUSES = ['pending', 'confirmed'];

module.exports = { SLOT_BLOCKING_STATUSES };
