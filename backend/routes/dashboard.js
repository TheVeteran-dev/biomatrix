const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const MedicationLog = require('../models/MedicationLog');

// Get dashboard data
router.get('/', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Today's logs
    const todayLogs = await MedicationLog.find({
      scheduledDate: { $gte: today, $lt: tomorrow }
    });
    
    const taken = todayLogs.filter(log => log.status === 'taken').length;
    const pending = todayLogs.filter(log => log.status === 'pending').length;
    const missed = todayLogs.filter(log => log.status === 'missed').length;
    const skipped = todayLogs.filter(log => log.status === 'skipped').length;
    
    // Today's adherence
    const scheduled = todayLogs.length;
    const todayAdherence = scheduled > 0 ? ((taken / scheduled) * 100).toFixed(1) : 0;
    
    // Weekly adherence
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weekLogs = await MedicationLog.find({
      scheduledDate: { $gte: weekAgo, $lt: tomorrow }
    });
    
    const weekTaken = weekLogs.filter(log => log.status === 'taken').length;
    const weekScheduled = weekLogs.length;
    const weeklyAdherence = weekScheduled > 0 ? ((weekTaken / weekScheduled) * 100).toFixed(1) : 0;
    
    // Overall adherence
    const allLogs = await MedicationLog.find({
      scheduledDate: { $lt: tomorrow }
    });
    
    const allTaken = allLogs.filter(log => log.status === 'taken').length;
    const allScheduled = allLogs.length;
    const overallAdherence = allScheduled > 0 ? ((allTaken / allScheduled) * 100).toFixed(1) : 0;
    
    // Low stock medicines
    const lowStock = await Medicine.find({
      $expr: { $lte: ['$remainingQuantity', '$lowStockThreshold'] },
      isActive: true
    });
    
    // Active medicines count
    const activeMedicines = await Medicine.countDocuments({ isActive: true });
    
    res.json({
      today: {
        taken,
        pending,
        missed,
        skipped,
        total: scheduled,
        adherence: todayAdherence
      },
      weekly: {
        adherence: weeklyAdherence
      },
      overall: {
        adherence: overallAdherence
      },
      lowStock,
      activeMedicines
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get adherence history (for charts)
router.get('/adherence-history', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const history = [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const logs = await MedicationLog.find({
        scheduledDate: { $gte: date, $lt: nextDay }
      });
      
      const taken = logs.filter(log => log.status === 'taken').length;
      const scheduled = logs.length;
      const adherence = scheduled > 0 ? ((taken / scheduled) * 100).toFixed(1) : 0;
      
      history.push({
        date: date.toISOString().split('T')[0],
        adherence: parseFloat(adherence),
        taken,
        scheduled
      });
    }
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;