const express = require('express');
const router = express.Router();
const { originalContacts } = require('./contacts');

// Real dashboard data based on actual contacts
router.get('/', async (req, res) => {
  try {
    const realStats = {
      contacts: originalContacts.length,
      templates: 0,
      campaigns: 0,
      emailsSent: 0
    };

    const realRecentCampaigns = [];

    res.json({
      stats: realStats,
      recentCampaigns: realRecentCampaigns
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
