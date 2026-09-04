const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');

// Get user profile
router.get('/', async (req, res) => {
  try {
    let profile = await UserProfile.findOne();
    
    // Create default profile if doesn't exist
    if (!profile) {
      profile = await UserProfile.create({
        name: 'User',
        allergies: [],
        medicalConditions: []
      });
    }
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/', async (req, res) => {
  try {
    let profile = await UserProfile.findOne();
    
    if (!profile) {
      profile = await UserProfile.create(req.body);
    } else {
      profile = await UserProfile.findByIdAndUpdate(
        profile._id,
        req.body,
        { new: true }
      );
    }
    
    res.json(profile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;