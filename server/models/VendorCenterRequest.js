const mongoose = require('mongoose');

const vendorCenterRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true,
  },
  applicantSnapshot: {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
  },
  /** Same shape as a `WashCenter` payload (services, hours, area, …). */
  centerDraft: { type: mongoose.Schema.Types.Mixed, required: true },
  gallery: { type: [String], default: [] },
  publishedCenterId: { type: String, trim: true },
  decidedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

vendorCenterRequestSchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    ret.id = ret._id?.toString();
    delete ret._id;
    delete ret.__v;
    if (ret.user) {
      ret.userId =
        typeof ret.user === 'object' && ret.user.toString
          ? ret.user.toString()
          : String(ret.user);
      delete ret.user;
    }
    return ret;
  },
});

module.exports = mongoose.model('VendorCenterRequest', vendorCenterRequestSchema);
