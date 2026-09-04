const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'User'
  },
  age: {
    type: Number
  },
  weight: {
    type: Number,
    comment: 'Weight in kg'
  },
  allergies: [{
    type: String
  }],
  medicalConditions: [{
    type: String,
    enum: [
      'diabetes',
      'hypertension',
      'heart_disease',
      'kidney_disease',
      'liver_disease',
      'asthma',
      'pregnancy',
      'breastfeeding',
      'other'
    ]
  }],
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  doctorContact: {
    name: String,
    phone: String,
    specialization: String
  }
}, { timestamps: true });

module.exports = mongoose.model('UserProfile', userProfileSchema);