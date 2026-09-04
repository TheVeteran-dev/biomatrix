const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/medicines', require('./routes/medicines'));
app.use('/api/logs', require('./routes/logs'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/risk-alerts', require('./routes/riskAlerts')); // NEW
app.use('/api/user-profile', require('./routes/userProfile')); // NEW

// Risk detection scheduler
const riskDetectionService = require('./services/riskDetectionService');

// Run risk detection every hour
setInterval(() => {
  riskDetectionService.runAllChecks();
  console.log('Risk detection check completed');
}, 60 * 60 * 1000); // 1 hour

// Run on startup
riskDetectionService.runAllChecks();

// Also run when medicines are updated
require('./utils/updateMissedLogs');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));