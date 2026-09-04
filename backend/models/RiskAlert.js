const mongoose = require('mongoose');

const riskAlertSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'drug_interaction',
      'missed_critical',
      'overdose_risk',
      'low_adherence',
      'contraindication',
      'allergy_warning'
    ]
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  medicineIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine'
  }],
  medicineNames: [{
    type: String
  }],
  actionRequired: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDismissed: {
    type: Boolean,
    default: false
  },
  dismissedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('RiskAlert', riskAlertSchema);