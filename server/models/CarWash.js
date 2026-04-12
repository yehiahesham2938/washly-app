const mongoose = require('mongoose');

/** Matches client `Area` in client/src/types/index.ts */
const AREA_ENUM = [
  'Downtown',
  'Suburbs',
  'Waterfront',
  'Northside',
  'East End',
  'Westside',
];

/** Matches client `Service` */
const serviceSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    durationMin: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

/** Matches client `WashCenter` (id is stored as string _id for parity with the app) */
const carWashSchema = new mongoose.Schema(
  {
    _id: { type: String },
    name: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    area: { type: String, required: true, enum: AREA_ENUM },
    address: { type: String, required: true, trim: true },
    locationLine: { type: String, trim: true },
    phone: { type: String, required: true, trim: true },
    hours: { type: String, required: true },
    hoursShort: { type: String, trim: true },
    description: { type: String, trim: true, default: '' },
    services: { type: [serviceSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
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

carWashSchema.virtual('id').get(function getId() {
  return this._id;
});

module.exports = mongoose.model('CarWash', carWashSchema);
