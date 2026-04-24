const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Campaign = require('../models/Campaign');
const Template = require('../models/Template');
const Contact = require('../models/Contact');

// SMTP settings from environment variables
const smtpSettings = {
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: parseInt(process.env.SMTP_PORT) || 587,
  senderEmail: process.env.SENDER_EMAIL || '',
  senderName: process.env.SENDER_NAME || 'SHOWBAY Email Marketing',
  appPassword: process.env.APP_PASSWORD || ''
};

// Get all campaigns
router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find()
      .populate('templateId', 'name')
      .populate('contacts', 'name email')
      .sort({ createdAt: -1 });
    
    const formattedCampaigns = campaigns.map(campaign => ({
      _id: campaign._id,
      name: campaign.name,
      subject: campaign.subject,
      templateId: campaign.templateId,
      contacts: campaign.contacts.map(c => c._id),
      cc: campaign.cc || [],
      bcc: campaign.bcc || [],
      status: campaign.status,
      isScheduled: campaign.isScheduled || false,
      scheduledAt: campaign.scheduledAt,
      timezone: campaign.timezone || 'UTC',
      sentCount: campaign.sentCount,
      failedCount: campaign.failedCount,
      totalContacts: campaign.totalContacts,
      sentAt: campaign.sentAt,
      createdAt: campaign.createdAt
    }));
    
    res.json(formattedCampaigns);
  } catch (err) {
    console.error('Error fetching campaigns:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single campaign
router.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('templateId', 'name')
      .populate('contacts', 'name email');
    
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    
    const formattedCampaign = {
      _id: campaign._id,
      name: campaign.name,
      subject: campaign.subject,
      templateId: campaign.templateId,
      contacts: campaign.contacts.map(c => c._id),
      cc: campaign.cc || [],
      bcc: campaign.bcc || [],
      status: campaign.status,
      isScheduled: campaign.isScheduled || false,
      scheduledAt: campaign.scheduledAt,
      timezone: campaign.timezone || 'UTC',
      sentCount: campaign.sentCount,
      failedCount: campaign.failedCount,
      totalContacts: campaign.totalContacts,
      sentAt: campaign.sentAt,
      createdAt: campaign.createdAt
    };
    
    res.json(formattedCampaign);
  } catch (err) {
    console.error('Error fetching campaign:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create campaign with scheduling support
router.post('/', async (req, res) => {
  try {
    const { name, subject, templateId, contactIds, cc, bcc, isScheduled, scheduledAt, timezone } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Campaign name is required' });
    }
    
    if (isScheduled && !scheduledAt) {
      return res.status(400).json({ error: 'Scheduled date and time is required when scheduling a campaign' });
    }
    
    const campaign = new Campaign({
      name,
      subject,
      templateId,
      contacts: contactIds || [],
      cc: cc || [],
      bcc: bcc || [],
      status: isScheduled ? 'scheduled' : 'draft',
      isScheduled: isScheduled || false,
      scheduledAt: isScheduled ? new Date(scheduledAt) : null,
      timezone: timezone || 'UTC',
      sentCount: 0,
      failedCount: 0,
      totalContacts: (contactIds || []).length
    });

    await campaign.save();
    
    // Populate template and contact references for response
    await campaign.populate('templateId', 'name');
    await campaign.populate('contacts', 'name email');
    
    const formattedCampaign = {
      _id: campaign._id,
      name: campaign.name,
      subject: campaign.subject,
      templateId: campaign.templateId,
      contacts: campaign.contacts.map(c => c._id),
      cc: campaign.cc || [],
      bcc: campaign.bcc || [],
      status: campaign.status,
      isScheduled: campaign.isScheduled || false,
      scheduledAt: campaign.scheduledAt,
      timezone: campaign.timezone || 'UTC',
      sentCount: campaign.sentCount,
      failedCount: campaign.failedCount,
      totalContacts: campaign.totalContacts,
      sentAt: campaign.sentAt,
      createdAt: campaign.createdAt
    };
    
    res.status(201).json(formattedCampaign);
  } catch (err) {
    console.error('Error creating campaign:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update campaign
router.put('/:id', async (req, res) => {
  try {
    const { name, subject, templateId, contactIds, cc, bcc, isScheduled, scheduledAt, timezone } = req.body;
    
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    
    // Update campaign fields
    if (name) campaign.name = name;
    if (subject) campaign.subject = subject;
    if (templateId) campaign.templateId = templateId;
    if (contactIds) campaign.contacts = contactIds;
    if (cc) campaign.cc = cc;
    if (bcc) campaign.bcc = bcc;
    if (isScheduled !== undefined) campaign.isScheduled = isScheduled;
    if (scheduledAt) campaign.scheduledAt = new Date(scheduledAt);
    if (timezone) campaign.timezone = timezone;
    campaign.totalContacts = (contactIds || campaign.contacts || []).length;
    
    // Update status based on scheduling
    if (isScheduled && scheduledAt) {
      campaign.status = 'scheduled';
    } else if (!isScheduled && campaign.status === 'scheduled') {
      campaign.status = 'draft';
    }
    
    await campaign.save();
    
    // Populate template and contact references for response
    await campaign.populate('templateId', 'name');
    await campaign.populate('contacts', 'name email');
    
    const formattedCampaign = {
      _id: campaign._id,
      name: campaign.name,
      subject: campaign.subject,
      templateId: campaign.templateId,
      contacts: campaign.contacts.map(c => c._id),
      cc: campaign.cc || [],
      bcc: campaign.bcc || [],
      status: campaign.status,
      isScheduled: campaign.isScheduled || false,
      scheduledAt: campaign.scheduledAt,
      timezone: campaign.timezone || 'UTC',
      sentCount: campaign.sentCount,
      failedCount: campaign.failedCount,
      totalContacts: campaign.totalContacts,
      sentAt: campaign.sentAt,
      createdAt: campaign.createdAt
    };
    
    res.json(formattedCampaign);
  } catch (err) {
    console.error('Error updating campaign:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete campaign
router.delete('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    
    res.json({ message: 'Campaign deleted successfully' });
  } catch (err) {
    console.error('Error deleting campaign:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send test email
router.post('/:id/test', async (req, res) => {
  try {
    const { testEmail } = req.body;
    if (!testEmail) return res.status(400).json({ error: 'Test email required' });

    const campaign = await Campaign.findById(req.params.id).populate('templateId');
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    if (!campaign.templateId) return res.status(400).json({ error: 'Template not selected' });

    // Check if SMTP is configured
    if (!smtpSettings.smtpHost || !smtpSettings.senderEmail || !smtpSettings.appPassword) {
      return res.status(400).json({ error: 'SMTP not configured. Please configure SMTP settings first.' });
    }

    // Create real transporter
    const transporter = nodemailer.createTransport({
      host: smtpSettings.smtpHost,
      port: smtpSettings.smtpPort,
      secure: smtpSettings.smtpPort === 465,
      auth: { 
        user: smtpSettings.senderEmail, 
        pass: smtpSettings.appPassword 
      },
      tls: { rejectUnauthorized: false }
    });

    // Create test email content
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4fc3f7;">TEST EMAIL</h2>
        <p>This is a test email from campaign: <strong>${campaign.name}</strong></p>
        <p>Subject: ${campaign.subject}</p>
        ${campaign.cc && campaign.cc.length > 0 ? `<p>CC: ${campaign.cc.join(', ')}</p>` : ''}
        ${campaign.bcc && campaign.bcc.length > 0 ? `<p>BCC: ${campaign.bcc.join(', ')}</p>` : ''}
        ${campaign.isScheduled ? `<p>Scheduled for: ${campaign.scheduledAt} (${campaign.timezone})</p>` : ''}
        <hr style="border: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">This is a test email sent from SHOWBAY Email Marketing System</p>
      </div>
    `;

    // Send test email
    await transporter.sendMail({
      from: `${smtpSettings.senderName} <${smtpSettings.senderEmail}>`,
      to: testEmail,
      cc: campaign.cc && campaign.cc.length > 0 ? campaign.cc.join(', ') : undefined,
      bcc: campaign.bcc && campaign.bcc.length > 0 ? campaign.bcc.join(', ') : undefined,
      subject: `[TEST] ${campaign.subject}`,
      html: html
    });

    res.json({ success: true, message: `Test email sent to ${testEmail}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send test email: ' + err.message });
  }
});

// Send bulk campaign
router.post('/:id/send', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('templateId').populate('contacts');
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    if (!campaign.templateId) return res.status(400).json({ error: 'No template selected' });
    if (!campaign.contacts?.length) return res.status(400).json({ error: 'No contacts selected' });

    // Check if SMTP is configured
    if (!smtpSettings.smtpHost || !smtpSettings.senderEmail || !smtpSettings.appPassword) {
      return res.status(400).json({ error: 'SMTP not configured. Please configure SMTP settings first.' });
    }

    // Create real transporter
    const transporter = nodemailer.createTransport({
      host: smtpSettings.smtpHost,
      port: smtpSettings.smtpPort,
      secure: smtpSettings.smtpPort === 465,
      auth: { 
        user: smtpSettings.senderEmail, 
        pass: smtpSettings.appPassword 
      },
      tls: { rejectUnauthorized: false }
    });

    // Update campaign status to sending
    campaign.status = 'sending';
    await campaign.save();

    let sent = 0;
    let failed = 0;
    const errors = [];

    // Send emails to all contacts
    for (const contact of campaign.contacts) {
      try {
        const personalizedHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4fc3f7;">Hello ${contact.name}</h2>
            <p>This email was sent as part of campaign: <strong>${campaign.name}</strong></p>
            <hr style="border: 1px solid #eee;">
            <div>${campaign.templateId.html || '<p>Email content not available</p>'}</div>
            <hr style="border: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">This email was sent from SHOWBAY Email Marketing System</p>
          </div>
        `;

        await transporter.sendMail({
          from: `${smtpSettings.senderName} <${smtpSettings.senderEmail}>`,
          to: contact.email,
          cc: campaign.cc && campaign.cc.length > 0 ? campaign.cc.join(', ') : undefined,
          bcc: campaign.bcc && campaign.bcc.length > 0 ? campaign.bcc.join(', ') : undefined,
          subject: campaign.subject,
          html: personalizedHtml
        });

        sent++;
      } catch (err) {
        failed++;
        errors.push(`${contact.email}: ${err.message}`);
      }
    }

    // Update campaign status and counts
    campaign.status = failed > 0 ? 'failed' : 'sent';
    campaign.sentCount = sent;
    campaign.failedCount = failed;
    campaign.sentAt = new Date();
    campaign.errors = errors;
    await campaign.save();

    res.json({ 
      success: true, 
      sent, 
      failed, 
      total: campaign.contacts.length,
      errors: errors.slice(0, 5) // Return first 5 errors
    });
  } catch (err) {
    console.error('Error sending campaign:', err);
    res.status(500).json({ error: 'Failed to send campaign: ' + err.message });
  }
});

// Schedule campaign endpoint
router.post('/:id/schedule', async (req, res) => {
  try {
    const { scheduledAt, timezone } = req.body;
    
    if (!scheduledAt) {
      return res.status(400).json({ error: 'Scheduled date and time is required' });
    }
    
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    
    if (campaign.status === 'sent') {
      return res.status(400).json({ error: 'Cannot schedule a campaign that has already been sent' });
    }
    
    campaign.isScheduled = true;
    campaign.scheduledAt = new Date(scheduledAt);
    campaign.timezone = timezone || 'UTC';
    campaign.status = 'scheduled';
    
    await campaign.save();
    
    res.json({ 
      success: true, 
      message: 'Campaign scheduled successfully',
      scheduledAt: campaign.scheduledAt,
      timezone: campaign.timezone
    });
  } catch (err) {
    console.error('Error scheduling campaign:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Resend failed emails
router.post('/:id/resend-failed', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('templateId').populate('contacts');
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    if (!campaign.templateId) return res.status(400).json({ error: 'No template selected' });
    if (!campaign.contacts?.length) return res.status(400).json({ error: 'No contacts selected' });
    if (campaign.status !== 'failed' && campaign.failedCount === 0) {
      return res.status(400).json({ error: 'No failed deliveries to resend' });
    }

    // Check if SMTP is configured
    if (!smtpSettings.smtpHost || !smtpSettings.senderEmail || !smtpSettings.appPassword) {
      return res.status(400).json({ error: 'SMTP not configured. Please configure SMTP settings first.' });
    }

    // Create real transporter
    const transporter = nodemailer.createTransport({
      host: smtpSettings.smtpHost,
      port: smtpSettings.smtpPort,
      secure: smtpSettings.smtpPort === 465,
      auth: { 
        user: smtpSettings.senderEmail, 
        pass: smtpSettings.appPassword 
      },
      tls: { rejectUnauthorized: false }
    });

    let resent = 0;
    let stillFailed = 0;
    const newErrors = [];

    // Extract failed emails from error messages
    const failedEmails = campaign.errors.map(err => err.split(':')[0].trim());
    
    // Get contacts that failed to send
    const failedContacts = campaign.contacts.filter(contact => 
      failedEmails.includes(contact.email)
    );

    // Retry sending to failed contacts
    for (const contact of failedContacts) {
      try {
        const personalizedHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4fc3f7;">Hello ${contact.name}</h2>
            <p>This email was sent as part of campaign: <strong>${campaign.name}</strong></p>
            <p style="color: #666; font-size: 12px;"><em>(Resend attempt)</em></p>
            <hr style="border: 1px solid #eee;">
            <div>${campaign.templateId.html || '<p>Email content not available</p>'}</div>
            <hr style="border: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">This email was sent from SHOWBAY Email Marketing System</p>
          </div>
        `;

        await transporter.sendMail({
          from: `${smtpSettings.senderName} <${smtpSettings.senderEmail}>`,
          to: contact.email,
          cc: campaign.cc && campaign.cc.length > 0 ? campaign.cc.join(', ') : undefined,
          bcc: campaign.bcc && campaign.bcc.length > 0 ? campaign.bcc.join(', ') : undefined,
          subject: campaign.subject,
          html: personalizedHtml
        });

        resent++;
      } catch (err) {
        stillFailed++;
        newErrors.push(`${contact.email}: ${err.message}`);
      }
    }

    // Update campaign counts and errors
    campaign.sentCount += resent;
    campaign.failedCount = stillFailed;
    
    // Update errors array - remove successful resent emails and keep still failing ones
    const successfulEmails = failedContacts.filter((_, index) => index < resent).map(c => c.email);
    campaign.errors = campaign.errors.filter(err => 
      !successfulEmails.includes(err.split(':')[0].trim())
    ).concat(newErrors);
    
    // Update status if all failed emails were resent successfully
    if (stillFailed === 0) {
      campaign.status = 'sent';
    }
    
    await campaign.save();

    res.json({ 
      success: true, 
      resent, 
      stillFailed, 
      totalFailed: failedContacts.length,
      message: `Resent ${resent} email${resent !== 1 ? 's' : ''} successfully${stillFailed > 0 ? `. ${stillFailed} still failed.` : '.'}`
    });
  } catch (err) {
    console.error('Error resending campaign:', err);
    res.status(500).json({ error: 'Failed to resend campaign: ' + err.message });
  }
});

// Get campaign delivery details with recipient information
router.get('/:id/delivery-details', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('templateId', 'name')
      .populate('contacts', 'name email company');
    
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    
    // Extract failed emails from error messages
    const failedEmails = campaign.errors.map(err => err.split(':')[0].trim());
    
    // Categorize contacts
    const deliveredContacts = campaign.contacts.filter(contact => 
      !failedEmails.includes(contact.email)
    );
    
    const failedContacts = campaign.contacts.filter(contact => 
      failedEmails.includes(contact.email)
    );
    
    // Create error map for failed contacts
    const errorMap = {};
    campaign.errors.forEach(err => {
      const email = err.split(':')[0].trim();
      const error = err.split(':').slice(1).join(':').trim();
      errorMap[email] = error;
    });
    
    res.json({
      campaign: {
        _id: campaign._id,
        name: campaign.name,
        subject: campaign.subject,
        templateName: campaign.templateId?.name,
        status: campaign.status,
        sentCount: campaign.sentCount,
        failedCount: campaign.failedCount,
        totalContacts: campaign.totalContacts,
        sentAt: campaign.sentAt,
        createdAt: campaign.createdAt
      },
      deliveredContacts: deliveredContacts.map(contact => ({
        _id: contact._id,
        name: contact.name,
        email: contact.email,
        company: contact.company
      })),
      failedContacts: failedContacts.map(contact => ({
        _id: contact._id,
        name: contact.name,
        email: contact.email,
        company: contact.company,
        error: errorMap[contact.email] || 'Unknown error'
      })),
      cc: campaign.cc || [],
      bcc: campaign.bcc || [],
      errors: campaign.errors || []
    });
  } catch (err) {
    console.error('Error fetching delivery details:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
