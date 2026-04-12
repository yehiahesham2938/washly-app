/** Map mongoose booking doc to API / client BookingRecord shape */
function bookingToRecord(doc) {
  const o = doc.toObject ? doc.toObject() : doc;
  const uid = o.user?._id ?? o.user;
  return {
    id: o._id.toString(),
    userId: uid?.toString?.() ?? String(uid),
    userEmail: o.userEmail,
    kind: o.kind,
    centerId: o.centerId,
    centerName: o.centerName,
    serviceId: o.serviceId,
    serviceName: o.serviceName,
    date: o.date,
    time: o.time,
    vehicle: o.vehicle,
    notes: o.notes,
    address: o.address,
    price: o.price,
    status: o.status,
    createdAt:
      o.createdAt instanceof Date ? o.createdAt.toISOString() : String(o.createdAt),
  };
}

function legacyStatusToRecord(status) {
  if (!status) return 'pending';
  const m = {
    Pending: 'pending',
    Confirmed: 'confirmed',
    Completed: 'completed',
    Cancelled: 'cancelled',
  };
  return m[status] ?? 'pending';
}

module.exports = { bookingToRecord, legacyStatusToRecord };
