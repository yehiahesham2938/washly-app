const { randomBytes } = require('crypto');
const express = require('express');
const User = require('../models/User');
const CarWash = require('../models/CarWash');
const VendorCenterRequest = require('../models/VendorCenterRequest');
const { authRequired } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

const router = express.Router();

function newCenterId() {
  return `c_${randomBytes(5).toString('hex')}`;
}

function formatRequest(doc) {
  return doc.toJSON ? doc.toJSON() : doc;
}

function validateCenterDraft(body) {
  if (!body || typeof body !== 'object') return 'Invalid center data';
  const {
    name,
    image,
    area,
    address,
    phone,
    hours,
    services,
  } = body;
  if (!name?.trim()) return 'Center name is required';
  if (!image?.trim()) return 'Center image is required';
  if (!area) return 'Area is required';
  if (!address?.trim()) return 'Address is required';
  if (!phone?.trim()) return 'Phone is required';
  if (!hours?.trim()) return 'Hours are required';
  if (!Array.isArray(services)) return 'Services must be an array';
  return null;
}

router.post('/', authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ message: 'User not found' });

    const body = req.body ?? {};
    const centerDraft = body.centerDraft ?? body.center ?? body;
    const gallery = Array.isArray(body.gallery) ? body.gallery : [];

    const err = validateCenterDraft(centerDraft);
    if (err) return res.status(400).json({ message: err });

    const doc = await VendorCenterRequest.create({
      user: req.userId,
      applicantSnapshot: {
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      centerDraft,
      gallery,
      status: 'pending',
    });

    return res.status(201).json(formatRequest(doc));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to submit request' });
  }
});

router.get('/me', authRequired, async (req, res) => {
  try {
    const list = await VendorCenterRequest.find({ user: req.userId }).sort({
      createdAt: -1,
    });
    res.json(list.map((d) => formatRequest(d)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load requests' });
  }
});

router.get('/', authRequired, adminOnly, async (req, res) => {
  try {
    const list = await VendorCenterRequest.find().sort({ createdAt: -1 });
    res.json(list.map((d) => formatRequest(d)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load vendor requests' });
  }
});

router.patch('/:id/approve', authRequired, adminOnly, async (req, res) => {
  try {
    const reqDoc = await VendorCenterRequest.findById(req.params.id);
    if (!reqDoc) return res.status(404).json({ message: 'Request not found' });
    if (reqDoc.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not pending' });
    }

    const draft = reqDoc.centerDraft;
    const err = validateCenterDraft(draft);
    if (err) return res.status(400).json({ message: `Invalid stored draft: ${err}` });

    const _id = newCenterId();
    const exists = await CarWash.findById(_id);
    if (exists) {
      return res.status(409).json({ message: 'Id collision; retry approve' });
    }

    const {
      name,
      image,
      rating = 0,
      reviewCount = 0,
      area,
      address,
      locationLine,
      phone,
      hours,
      hoursShort,
      workingDays,
      description = '',
      services = [],
    } = draft;

    const createPayload = {
      _id,
      name: String(name).trim(),
      image: String(image).trim(),
      rating: Number(rating),
      reviewCount: Number(reviewCount),
      area,
      address: String(address).trim(),
      locationLine: locationLine ? String(locationLine).trim() : undefined,
      phone: String(phone).trim(),
      hours: String(hours),
      hoursShort: hoursShort ? String(hoursShort) : undefined,
      description: String(description),
      services,
      ownerUserId: reqDoc.user,
    };

    if (Array.isArray(workingDays) && workingDays.length > 0) {
      createPayload.workingDays = workingDays;
    }

    const g = Array.isArray(reqDoc.gallery) ? reqDoc.gallery.filter(Boolean) : [];
    if (g.length > 0) createPayload.gallery = g;

    await CarWash.create(createPayload);

    reqDoc.status = 'approved';
    reqDoc.publishedCenterId = _id;
    reqDoc.decidedAt = new Date();
    await reqDoc.save();

    return res.json(formatRequest(reqDoc));
  } catch (e) {
    console.error(e);
    if (e.name === 'ValidationError') {
      return res.status(400).json({ message: e.message });
    }
    return res.status(500).json({ message: 'Failed to approve request' });
  }
});

router.patch('/:id/reject', authRequired, adminOnly, async (req, res) => {
  try {
    const reqDoc = await VendorCenterRequest.findById(req.params.id);
    if (!reqDoc) return res.status(404).json({ message: 'Request not found' });
    if (reqDoc.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not pending' });
    }

    reqDoc.status = 'rejected';
    reqDoc.decidedAt = new Date();
    await reqDoc.save();

    return res.json(formatRequest(reqDoc));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to reject request' });
  }
});

module.exports = router;
