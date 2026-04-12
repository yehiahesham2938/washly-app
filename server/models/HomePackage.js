const mongoose = require('mongoose');

/**
 * Catalog for home wash packages — mirrors `HOME_PACKAGES` in client HomeBooking.tsx
 * (name, durationMin, price, features; id stored as string _id e.g. home-1)
 */
const homePackageSchema = new mongoose.Schema(
  {
    _id: { type: String },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    durationMin: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    features: { type: [String], default: [] },
  },
  {
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

homePackageSchema.virtual('id').get(function getId() {
  return this._id;
});

module.exports = mongoose.model('HomePackage', homePackageSchema);
