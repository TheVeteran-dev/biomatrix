const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const MedicationLog = require('../models/MedicationLog');

// Get all medicines
router.get('/', async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ createdAt: -1 });
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single medicine
router.get('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    res.json(medicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create medicine
router.post('/', async (req, res) => {
  try {
    const medicine = new Medicine(req.body);
    const savedMedicine = await medicine.save();
    
    // Create initial medication logs
    await createMedicationLogs(savedMedicine);
    
    res.status(201).json(savedMedicine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update medicine
router.put('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(medicine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete medicine
router.delete('/:id', async (req, res) => {
  try {
    await Medicine.findByIdAndDelete(req.params.id);
    await MedicationLog.deleteMany({ medicineId: req.params.id });
    res.json({ message: 'Medicine deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to create medication logs
async function createMedicationLogs(medicine) {
  const logs = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const endDate = medicine.endDate ? new Date(medicine.endDate) : new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  for (let d = new Date(medicine.startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    for (let time of medicine.times) {
      logs.push({
        medicineId: medicine._id,
        medicineName: medicine.name,
        scheduledTime: time,
        scheduledDate: new Date(d),
        status: 'pending'
      });
    }
  }
  
  await MedicationLog.insertMany(logs);
}

module.exports = router;