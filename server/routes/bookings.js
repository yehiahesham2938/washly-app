const express = require('express');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { authRequired } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const { bookingToRecord, legacyStatusToRecord } = require('../utils/bookingMap');
const { getTimeSlots, SLOT_COUNT } = require('../utils/timeSlots');

const router = express.Router();

/** Times already booked for this center service on this date (non-cancelled). */
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
      status: { $nin: ['cancelled'] },
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
      status: { $nin: ['cancelled'] },
    })
      .select('date time')
      .lean();

    const byDate = new Map();
    for (const row of docs) {
      if (!row.date || !row.time) continue;
      if (!byDate.has(row.date)) byDate.set(row.date, new Set());
      byDate.get(row.date).add(row.time);
    }

    const fullyBookedDates = [];
    for (const [d, times] of byDate) {
      if (times.size >= SLOT_COUNT) fullyBookedDates.push(d);
    }
    return res.json({ fullyBookedDates, slotCount: SLOT_COUNT });
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
      const clash = await Booking.findOne({
        kind: 'center',
        centerId: String(centerId),
        serviceId: String(serviceId),
        date: String(date),
        time: String(time),
        status: { $nin: ['cancelled'] },
      }).lean();
      if (clash) {
        return res.status(409).json({
          message: 'This time slot is already booked for this service. Choose another time or date.',
        });
      }
    }

    const validTimes = new Set(getTimeSlots());
    if (kind === 'center' && !validTimes.has(String(time))) {
      return res.status(400).json({ message: 'Invalid time slot' });
    }

    const recordStatus = legacyStatusToRecord(legacyStatus);

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

router.patch('/:id', authRequired, adminOnly, async (req, res) => {
  try {
    const { status } = req.body ?? {};
    if (!status) {
      return res.status(400).json({ message: 'status is required' });
    }
    const allowed = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
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
