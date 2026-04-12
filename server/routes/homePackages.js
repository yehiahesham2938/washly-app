const express = require('express');
const HomePackage = require('../models/HomePackage');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const list = await HomePackage.find().sort({ _id: 1 });
    res.json(list.map((d) => (d.toJSON ? d.toJSON() : d)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load home packages' });
  }
});

module.exports = router;
