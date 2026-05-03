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

/** Matches client `Weekday` */
const WEEKDAY_ENUM = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
    workingDays: {
      type: [{ type: String, enum: WEEKDAY_ENUM }],
      default: undefined,
      validate: {
        validator(arr) {
          return arr == null || arr.length > 0;
        },
        message: 'workingDays must include at least one day when set',
      },
    },
    description: { type: String, trim: true, default: '' },
    services: { type: [serviceSchema], default: [] },
    /** Set when a vendor request is approved; admin-created centers omit this. */
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    /** Extra photos beyond `image` (data URLs or remote URLs). */
    gallery: { type: [String], default: undefined },
    createdAt: { type: Date, default: Date.now },
  },
  {
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        if (ret.ownerUserId) {
          ret.ownerUserId =
            typeof ret.ownerUserId === 'object' && ret.ownerUserId.toString
              ? ret.ownerUserId.toString()
              : String(ret.ownerUserId);
        }
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
