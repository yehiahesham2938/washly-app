const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

/** Matches client `User` (password never returned from API by default) */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const SALT_ROUNDS = 10;

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    ret.id = ret._id?.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
