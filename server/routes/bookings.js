const express = require('express');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { authRequired } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const { bookingToRecord, legacyStatusToRecord } = require('../utils/bookingMap');

const router = express.Router();

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
