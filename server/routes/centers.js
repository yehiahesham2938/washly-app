const { randomBytes } = require('crypto');
const express = require('express');
const CarWash = require('../models/CarWash');
const User = require('../models/User');
const { authRequired } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

const router = express.Router();

function newCenterId() {
  return `c_${randomBytes(5).toString('hex')}`;
}

function newOfferId() {
  return `offer_${randomBytes(5).toString('hex')}`;
}

function normalizeOffers(value) {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) return { error: 'Offers must be an array' };

  const offers = [];
  for (const rawOffer of value) {
    if (!rawOffer || typeof rawOffer !== 'object') {
      return { error: 'Invalid offer entry' };
    }
    const title = String(rawOffer.title ?? '').trim();
    if (!title) return { error: 'Offer title is required' };

    const washCount = Number(rawOffer.washCount);
    if (!Number.isFinite(washCount) || washCount < 1) {
      return { error: 'Offer wash count must be at least 1' };
    }

    const discountPercent = Number(rawOffer.discountPercent);
    if (
      !Number.isFinite(discountPercent) ||
      discountPercent < 0 ||
      discountPercent > 100
    ) {
      return { error: 'Offer discount must be between 0 and 100' };
    }

    offers.push({
      id:
        rawOffer.id && String(rawOffer.id).trim()
          ? String(rawOffer.id).trim()
          : newOfferId(),
      title,
      washCount,
      discountPercent,
      description:
        rawOffer.description !== undefined
          ? String(rawOffer.description).trim()
          : '',
    });
  }

  return { value: offers };
}

async function canEditCenter(req, center) {
  if (req.userRole === 'admin') return true;
  try {
    const user = await User.findById(req.userId).select('role');
    if (user?.role === 'admin') return true;
  } catch {
    // fall through
  }
  return center.ownerUserId?.toString() === String(req.userId);
}

function formatCenter(doc) {
  return doc.toJSON ? doc.toJSON() : doc;
}

/** Centers owned by the current user (approved vendor listings). */
router.get('/mine/vendor', authRequired, async (req, res) => {
  try {
    const list = await CarWash.find({ ownerUserId: req.userId }).sort({ _id: 1 });
    res.json(list.map((d) => formatCenter(d)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load your centers' });
  }
});

router.get('/', async (req, res) => {
  try {
    const list = await CarWash.find().sort({ _id: 1 });
    res.json(list.map((d) => formatCenter(d)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load centers' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const doc = await CarWash.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Center not found' });
    return res.json(formatCenter(doc));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load center' });
  }
});

router.post('/', authRequired, adminOnly, async (req, res) => {
  try {
    const body = req.body ?? {};
    const _id = body.id && String(body.id).trim() ? String(body.id).trim() : newCenterId();
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
      offers,
      gallery,
    } = body;

    if (!name?.trim() || !image?.trim() || !area || !address?.trim() || !phone?.trim() || !hours) {
      return res.status(400).json({ message: 'Missing required center fields' });
    }

    const exists = await CarWash.findById(_id);
    if (exists) {
      return res.status(409).json({ message: 'A center with this id already exists' });
    }

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
    };
    const normalizedOffers = normalizeOffers(offers);
    if (normalizedOffers?.error) {
      return res.status(400).json({ message: normalizedOffers.error });
    }
    if (normalizedOffers?.value !== undefined) {
      createPayload.offers = normalizedOffers.value;
    }
    if (Array.isArray(workingDays) && workingDays.length > 0) {
      createPayload.workingDays = workingDays;
    }
    if (Array.isArray(gallery) && gallery.length > 0) {
      createPayload.gallery = gallery;
    }

    await CarWash.create(createPayload);

    const doc = await CarWash.findById(_id);
    return res.status(201).json(formatCenter(doc));
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: 'Failed to create center' });
  }
});

router.put('/:id', authRequired, adminOnly, async (req, res) => {
  try {
    const body = req.body ?? {};
    const {
      name,
      image,
      rating,
      reviewCount,
      area,
      address,
      locationLine,
      phone,
      hours,
      hoursShort,
      workingDays,
      description,
      services,
      offers,
      gallery,
    } = body;

    const update = {};
    if (name !== undefined) update.name = String(name).trim();
    if (image !== undefined) update.image = String(image).trim();
    if (rating !== undefined) update.rating = Number(rating);
    if (reviewCount !== undefined) update.reviewCount = Number(reviewCount);
    if (area !== undefined) update.area = area;
    if (address !== undefined) update.address = String(address).trim();
    if (locationLine !== undefined) update.locationLine = locationLine ? String(locationLine).trim() : '';
    if (phone !== undefined) update.phone = String(phone).trim();
    if (hours !== undefined) update.hours = String(hours);
    if (hoursShort !== undefined) update.hoursShort = hoursShort ? String(hoursShort) : '';
    if (workingDays !== undefined) {
      update.workingDays = Array.isArray(workingDays) ? workingDays : [];
    }
    if (description !== undefined) update.description = String(description);
    if (services !== undefined) update.services = services;
    if (offers !== undefined) {
      const normalizedOffers = normalizeOffers(offers);
      if (normalizedOffers?.error) {
        return res.status(400).json({ message: normalizedOffers.error });
      }
      update.offers = normalizedOffers.value ?? [];
    }
    if (gallery !== undefined) {
      update.gallery = Array.isArray(gallery) && gallery.length > 0 ? gallery : [];
    }

    const doc = await CarWash.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ message: 'Center not found' });
    return res.json(formatCenter(doc));
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: 'Failed to update center' });
  }
});

router.patch('/:id/offers', authRequired, async (req, res) => {
  try {
    const doc = await CarWash.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Center not found' });
    if (!(await canEditCenter(req, doc))) {
      return res.status(403).json({ message: 'You can only edit your own center' });
    }

    const normalizedOffers = normalizeOffers(req.body?.offers);
    if (normalizedOffers?.error) {
      return res.status(400).json({ message: normalizedOffers.error });
    }

    doc.offers = normalizedOffers?.value ?? [];
    await doc.save();
    return res.json(formatCenter(doc));
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: 'Failed to update center offers' });
  }
});

router.delete('/:id', authRequired, adminOnly, async (req, res) => {
  try {
    const doc = await CarWash.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Center not found' });
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to delete center' });
  }
});

module.exports = router;
