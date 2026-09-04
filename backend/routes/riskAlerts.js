const express = require('express');
const router = express.Router();
const RiskAlert = require('../models/RiskAlert');
const riskDetectionService = require('../services/riskDetectionService');

// Get all active alerts
router.get('/', async (req, res) => {
  try {
    const alerts = await RiskAlert.find({ 
      isActive: true,
      isDismissed: false
    }).sort({ severity: -1, createdAt: -1 });
    
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get alerts by severity
router.get('/severity/:severity', async (req, res) => {
  try {
    const alerts = await RiskAlert.find({ 
      severity: req.params.severity,
      isActive: true,
      isDismissed: false
    }).sort({ createdAt: -1 });
    
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get alerts by type
router.get('/type/:type', async (req, res) => {
  try {
    const alerts = await RiskAlert.find({ 
      type: req.params.type,
      isActive: true,
      isDismissed: false
    }).sort({ createdAt: -1 });
    
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Dismiss an alert
router.put('/:id/dismiss', async (req, res) => {
  try {
    const alert = await RiskAlert.findByIdAndUpdate(
      req.params.id,
      { 
        isDismissed: true,
        dismissedAt: new Date()
      },
      { new: true }
    );
    
    res.json(alert);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Mark alert as inactive
router.put('/:id/deactivate', async (req, res) => {
  try {
    const alert = await RiskAlert.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    res.json(alert);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Manually trigger risk detection
router.post('/detect', async (req, res) => {
  try {
    const alerts = await riskDetectionService.runAllChecks();
    res.json({ 
      message: 'Risk detection completed',
      alertsFound: alerts.length,
      alerts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get alert statistics
router.get('/stats', async (req, res) => {
  try {
    const total = await RiskAlert.countDocuments({ 
      isActive: true,
      isDismissed: false 
    });
    
    const critical = await RiskAlert.countDocuments({ 
      severity: 'critical',
      isActive: true,
      isDismissed: false 
    });
    
    const high = await RiskAlert.countDocuments({ 
      severity: 'high',
      isActive: true,
      isDismissed: false 
    });
    
    const medium = await RiskAlert.countDocuments({ 
      severity: 'medium',
      isActive: true,
      isDismissed: false 
    });
    
    const low = await RiskAlert.countDocuments({ 
      severity: 'low',
      isActive: true,
      isDismissed: false 
    });
    
    const byType = await RiskAlert.aggregate([
      { 
        $match: { 
          isActive: true,
          isDismissed: false 
        } 
      },
      { 
        $group: { 
          _id: '$type', 
          count: { $sum: 1 } 
        } 
      }
    ]);
    
    res.json({
      total,
      bySeverity: { critical, high, medium, low },
      byType
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;