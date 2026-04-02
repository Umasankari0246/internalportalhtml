const express = require('express');
const router = express.Router();

// Mock dashboard data
router.get('/', async (req, res) => {
  try {
    const mockStats = {
      contacts: 1247,
      templates: 23,
      campaigns: 89,
      emailsSent: 15420
    };

    const mockRecentCampaigns = [
      { _id: '1', name: 'Summer Newsletter', status: 'sent', sentCount: 1247, createdAt: new Date('2024-03-28') },
      { _id: '2', name: 'Product Launch', status: 'draft', sentCount: 0, createdAt: new Date('2024-03-27') },
      { _id: '3', name: 'Welcome Series', status: 'active', sentCount: 892, createdAt: new Date('2024-03-26') },
      { _id: '4', name: 'Event Invitation', status: 'sent', sentCount: 534, createdAt: new Date('2024-03-25') },
      { _id: '5', name: 'Monthly Update', status: 'scheduled', sentCount: 0, createdAt: new Date('2024-03-24') }
    ];

    res.json({
      stats: mockStats,
      recentCampaigns: mockRecentCampaigns
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
