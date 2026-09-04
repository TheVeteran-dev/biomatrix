const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  dosage: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    required: true,
    enum: ['once_daily', 'twice_daily', 'thrice_daily', 'custom']
  },
  times: [{
    type: String,
    required: true
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  totalQuantity: {
    type: Number,
    required: true
  },
  remainingQuantity: {
    type: Number,
    required: true
  },
  lowStockThreshold: {
    type: Number,
    default: 5
  },
  notes: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // NEW FIELDS FOR RISK ALERTS
  isCritical: {
    type: Boolean,
    default: false,
    comment: 'Mark as critical if missing this medicine is dangerous'
  },
  category: {
    type: String,
    enum: ['antibiotic', 'painkiller', 'cardiac', 'diabetes', 'blood_pressure', 'vitamin', 'other'],
    default: 'other'
  },
  interactsWith: [{
    type: String,
    comment: 'List of medicine names that interact with this medicine'
  }],
  contraindications: [{
    type: String,
    comment: 'Health conditions that contraindicate this medicine'
  }],
  maxDailyDoses: {
    type: Number,
    comment: 'Maximum doses allowed per day'
  },
  minimumGapHours: {
    type: Number,
    default: 4,
    comment: 'Minimum hours between doses'
  }
}, { timestamps: true });

module.exports = mongoose.model('Medicine', medicineSchema);