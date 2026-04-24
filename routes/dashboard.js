const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const Template = require('../models/Template');
const Contact = require('../models/Contact');

// Real dashboard data from MongoDB
router.get('/', async (req, res) => {
  try {
    // Fetch real data from MongoDB
    const [contactsCount, templatesCount, campaigns, recentCampaignsList] = await Promise.all([
      Contact.countDocuments(),
      Template.countDocuments(),
      Campaign.find(),
      Campaign.find().populate('templateId', 'name').sort({ createdAt: -1 }).limit(5)
    ]);

    // Calculate total emails sent
    const emailsSent = campaigns.reduce((total, campaign) => total + (campaign.sentCount || 0), 0);

    // Format recent campaigns for display
    const recentCampaigns = recentCampaignsList.map(campaign => ({
      _id: campaign._id,
      name: campaign.name,
      subject: campaign.subject,
      status: campaign.status,
      sentCount: campaign.sentCount || 0,
      failedCount: campaign.failedCount || 0,
      templateId: campaign.templateId,
      createdAt: campaign.createdAt,
      scheduledAt: campaign.scheduledAt,
      isScheduled: campaign.isScheduled || false
    }));

    const stats = {
      contacts: contactsCount,
      templates: templatesCount,
      campaigns: campaigns.length,
      emailsSent: emailsSent
    };

    res.json({
      stats: stats,
      recentCampaigns: recentCampaigns
    });
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
