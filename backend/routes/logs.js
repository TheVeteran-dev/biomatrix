const express = require('express');
const router = express.Router();
const MedicationLog = require('../models/MedicationLog');
const Medicine = require('../models/Medicine');

// Get logs by date
router.get('/date/:date', async (req, res) => {
  try {
    const date = new Date(req.params.date);
    date.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const logs = await MedicationLog.find({
      scheduledDate: { $gte: date, $lt: nextDay }
    }).sort({ scheduledTime: 1 });
    
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all logs for a medicine
router.get('/medicine/:medicineId', async (req, res) => {
  try {
    const logs = await MedicationLog.find({ 
      medicineId: req.params.medicineId 
    }).sort({ scheduledDate: -1, scheduledTime: -1 });
    
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update log status (Take/Skip)
router.put('/:id', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const log = await MedicationLog.findById(req.params.id);
    
    if (!log) return res.status(404).json({ message: 'Log not found' });
    
    log.status = status;
    log.notes = notes;
    
    if (status === 'taken') {
      log.takenAt = new Date();
      
      // Reduce medicine inventory
      const medicine = await Medicine.findById(log.medicineId);
      if (medicine && medicine.remainingQuantity > 0) {
        medicine.remainingQuantity -= 1;
        await medicine.save();
      }
    }
    
    await log.save();
    res.json(log);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;