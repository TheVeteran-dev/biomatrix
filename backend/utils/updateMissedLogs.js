const MedicationLog = require('../models/MedicationLog');

async function updateMissedLogs() {
  try {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find all pending logs from previous days
    const pendingLogs = await MedicationLog.find({
      status: 'pending',
      scheduledDate: { $lt: today }
    });
    
    // Update to missed
    for (let log of pendingLogs) {
      log.status = 'missed';
      await log.save();
    }
    
    console.log(`Updated ${pendingLogs.length} logs to missed`);
  } catch (error) {
    console.error('Error updating missed logs:', error);
  }
}

// Run every hour
setInterval(updateMissedLogs, 60 * 60 * 1000);

// Run on startup
updateMissedLogs();

module.exports = updateMissedLogs;