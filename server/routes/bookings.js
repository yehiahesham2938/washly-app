const express = require('express');
const Booking = require('../models/Booking');
const User = require('../models/User');
const CarWash = require('../models/CarWash');
const { authRequired } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const { bookingToRecord, legacyStatusToRecord } = require('../utils/bookingMap');
const { SLOT_BLOCKING_STATUSES } = require('../utils/availability');
const { getTimeSlots } = require('../utils/timeSlots');
const { getCenterSlotsForYmd } = require('../utils/centerScheduleSlots');

const router = express.Router();

/** Times held by active (pending/confirmed) center bookings on this date. */
router.get('/occupied-times', async (req, res) => {
  try {
    const { centerId, serviceId, date } = req.query;
    if (!centerId || !serviceId || !date) {
      return res.status(400).json({ message: 'centerId, serviceId, and date are required' });
    }
    const docs = await Booking.find({
      kind: 'center',
      centerId: String(centerId),
      serviceId: String(serviceId),
      date: String(date),
      status: { $in: SLOT_BLOCKING_STATUSES },
    })
      .select('time')
      .lean();
    const occupiedTimes = [...new Set(docs.map((d) => d.time).filter(Boolean))];
    return res.json({ occupiedTimes });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to load slot availability' });
  }
});

/** Dates in the given calendar month where every time slot is taken for this service. */
router.get('/fully-booked-dates', async (req, res) => {
  try {
    const { centerId, serviceId, year, month } = req.query;
    if (!centerId || !serviceId || year == null || month == null) {
      return res
        .status(400)
        .json({ message: 'centerId, serviceId, year, and month are required' });
    }
    const y = Number(year);
    const m = Number(month);
    if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) {
      return res.status(400).json({ message: 'Invalid year or month' });
    }
    const pad = (n) => String(n).padStart(2, '0');
    const lastDay = new Date(y, m, 0).getDate();
    const from = `${y}-${pad(m)}-01`;
    const to = `${y}-${pad(m)}-${pad(lastDay)}`;

    const docs = await Booking.find({
      kind: 'center',
      centerId: String(centerId),
      serviceId: String(serviceId),
      date: { $gte: from, $lte: to },
      status: { $in: SLOT_BLOCKING_STATUSES },
    })
      .select('date time')
      .lean();

    const center = await CarWash.findById(String(centerId)).lean();
    if (!center) {
      return res.status(404).json({ message: 'Center not found' });
    }

    const byDate = new Map();
    for (const row of docs) {
      if (!row.date || !row.time) continue;
      if (!byDate.has(row.date)) byDate.set(row.date, new Set());
      byDate.get(row.date).add(row.time);
    }

    const fullyBookedDates = [];
    let maxSlotsInMonth = 0;
    for (let day = 1; day <= lastDay; day++) {
      const ymd = `${y}-${pad(m)}-${pad(day)}`;
      const allowed = getCenterSlotsForYmd(center, ymd);
      const n = allowed.length;
      maxSlotsInMonth = Math.max(maxSlotsInMonth, n);
      if (n === 0) continue;
      const allowedSet = new Set(allowed);
      const booked = byDate.get(ymd);
      if (!booked) continue;
      const takenInWindow = [...booked].filter((t) => allowedSet.has(t)).length;
      if (takenInWindow >= n) fullyBookedDates.push(ymd);
    }
    return res.json({ fullyBookedDates, slotCount: maxSlotsInMonth });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to load calendar availability' });
  }
});

router.get('/me', authRequired, async (req, res) => {
  try {
    const list = await Booking.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(list.map((d) => bookingToRecord(d)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load bookings' });
  }
});

/** Center bookings for locations the current user owns (vendor dashboard). */
router.get('/for-my-centers', authRequired, async (req, res) => {
  try {
    const owned = await CarWash.find({ ownerUserId: req.userId })
      .select('_id')
      .lean();
    const ids = owned.map((c) => String(c._id));
    if (ids.length === 0) {
      return res.json([]);
    }
    const list = await Booking.find({
      kind: 'center',
      centerId: { $in: ids },
    }).sort({ createdAt: -1 });
    res.json(list.map((d) => bookingToRecord(d)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load center bookings' });
  }
});

router.post('/', authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ message: 'User not found' });

    const body = req.body ?? {};
    const {
      kind,
      centerId,
      centerName,
      serviceId,
      serviceName,
      date,
      time,
      vehicle,
      notes,
      address,
      price,
      status: legacyStatus,
      packageId,
      paymentMethod,
      contactName,
      contactPhone,
    } = body;

    if (!kind || !serviceName || !date || !time || !vehicle || price === undefined) {
      return res.status(400).json({ message: 'Missing required booking fields' });
    }

    if (kind === 'center' && centerId && serviceId) {
      const center = await CarWash.findById(String(centerId)).lean();
      if (!center) {
        return res.status(400).json({ message: 'Center not found' });
      }
      const allowed = getCenterSlotsForYmd(center, String(date));
      if (allowed.length === 0) {
        return res.status(400).json({ message: 'This center is closed on the selected date' });
      }
      const validTimes = new Set(allowed);
      if (!validTimes.has(String(time))) {
        return res.status(400).json({ message: 'Invalid time slot for this center' });
      }

      const clash = await Booking.findOne({
        kind: 'center',
        centerId: String(centerId),
        serviceId: String(serviceId),
        date: String(date),
        time: String(time),
        status: { $in: SLOT_BLOCKING_STATUSES },
      }).lean();
      if (clash) {
        return res.status(409).json({
          message: 'This time slot is already booked for this service. Choose another time or date.',
        });
      }
    } else if (kind === 'center') {
      const validTimes = new Set(getTimeSlots());
      if (!validTimes.has(String(time))) {
        return res.status(400).json({ message: 'Invalid time slot' });
      }
    }

    const recordStatus =
      kind === 'center'
        ? 'pending'
        : legacyStatusToRecord(legacyStatus);

    const doc = await Booking.create({
      user: req.userId,
      userEmail: user.email,
      kind,
      centerId,
      centerName,
      serviceId,
      serviceName: String(serviceName).trim(),
      date: String(date),
      time: String(time),
      vehicle: String(vehicle),
      notes,
      address,
      price: Number(price),
      status: recordStatus,
      packageId,
      paymentMethod,
      contactName,
      contactPhone,
    });

    return res.status(201).json(bookingToRecord(doc));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create booking' });
  }
});

router.get('/', authRequired, adminOnly, async (req, res) => {
  try {
    const list = await Booking.find().sort({ createdAt: -1 });
    res.json(list.map((d) => bookingToRecord(d)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load bookings' });
  }
});

router.patch('/:id', authRequired, async (req, res) => {
  try {
    const { status } = req.body ?? {};
    if (!status) {
      return res.status(400).json({ message: 'status is required' });
    }
    const allowed = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const existing = await Booking.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Booking not found' });

    let mayEdit = req.userRole === 'admin';
    if (!mayEdit) {
      const u = await User.findById(req.userId).select('role').lean();
      mayEdit = u?.role === 'admin';
    }
    if (!mayEdit && existing.kind === 'center' && existing.centerId) {
      const owned = await CarWash.findOne({
        _id: String(existing.centerId),
        ownerUserId: req.userId,
      }).lean();
      mayEdit = Boolean(owned);
    }
    if (!mayEdit) {
      return res.status(403).json({ message: 'Not allowed to update this booking' });
    }

    const doc = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!doc) return res.status(404).json({ message: 'Booking not found' });
    return res.json(bookingToRecord(doc));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update booking' });
  }
});

router.delete('/:id', authRequired, adminOnly, async (req, res) => {
  try {
    const doc = await Booking.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Booking not found' });
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to delete booking' });
  }
});

module.exports = router;
