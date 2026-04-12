const mongoose = require('mongoose');

/** Matches client `BookingRecord` / booking payloads in client/src/types/index.ts */
const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  kind: {
    type: String,
    enum: ['center', 'home'],
    required: true,
  },
  centerId: { type: String, trim: true },
  centerName: { type: String, trim: true },
  serviceId: { type: String, trim: true },
  serviceName: {
    type: String,
    required: true,
    trim: true,
  },
  /** yyyy-MM-dd from the booking UI */
  date: {
    type: String,
    required: true,
    trim: true,
  },
  time: {
    type: String,
    required: true,
    trim: true,
  },
  vehicle: {
    type: String,
    required: true,
    trim: true,
  },
  notes: { type: String, trim: true },
  address: { type: String, trim: true },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  },
  /** Home wash: package id e.g. home-1 (optional; also reflected in serviceId) */
  packageId: { type: String, trim: true },
  /** Parsed from HomeBooking / Booking forms when stored explicitly */
  paymentMethod: {
    type: String,
    enum: ['card', 'cash', 'wallet'],
  },
  contactName: { type: String, trim: true },
  contactPhone: { type: String, trim: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

bookingSchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    ret.id = ret._id?.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Booking', bookingSchema);
