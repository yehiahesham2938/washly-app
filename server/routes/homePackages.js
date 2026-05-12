const express = require('express');
const HomePackage = require('../models/HomePackage');
const { authRequired } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

const router = express.Router();

/* ── Public ── */
router.get('/', async (req, res) => {
  try {
    const list = await HomePackage.find().sort({ _id: 1 });
    res.json(list.map((d) => (d.toJSON ? d.toJSON() : d)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load home packages' });
  }
});

/* ── Admin: create ── */
router.post('/', authRequired, adminOnly, async (req, res) => {
  try {
    const { name, description, durationMin, price, features } = req.body ?? {};
    if (!name?.trim() || !durationMin || price === undefined) {
      return res.status(400).json({ message: 'name, durationMin and price are required' });
    }

    // generate a friendly id like home-<timestamp>
    const id = `home-${Date.now()}`;
    const doc = await HomePackage.create({
      _id: id,
      name: String(name).trim(),
      description: description ? String(description).trim() : '',
      durationMin: Number(durationMin),
      price: Number(price),
      features: Array.isArray(features) ? features.map((f) => String(f).trim()).filter(Boolean) : [],
    });
    return res.status(201).json(doc.toJSON());
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create package' });
  }
});

/* ── Admin: update ── */
router.put('/:id', authRequired, adminOnly, async (req, res) => {
  try {
    const { name, description, durationMin, price, features } = req.body ?? {};
    const update = {};
    if (name !== undefined) update.name = String(name).trim();
    if (description !== undefined) update.description = String(description).trim();
    if (durationMin !== undefined) update.durationMin = Number(durationMin);
    if (price !== undefined) update.price = Number(price);
    if (features !== undefined)
      update.features = Array.isArray(features)
        ? features.map((f) => String(f).trim()).filter(Boolean)
        : [];

    const doc = await HomePackage.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    );
    if (!doc) return res.status(404).json({ message: 'Package not found' });
    return res.json(doc.toJSON());
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update package' });
  }
});

/* ── Admin: delete ── */
router.delete('/:id', authRequired, adminOnly, async (req, res) => {
  try {
    const doc = await HomePackage.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Package not found' });
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to delete package' });
  }
});

module.exports = router;
