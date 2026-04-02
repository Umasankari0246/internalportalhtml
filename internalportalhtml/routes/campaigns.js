const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { mockSettings } = require('./settings');
const { originalContacts } = require('./contacts');
const templatesRouter = require('./templates');
const mockTemplates = templatesRouter.mockTemplates;

// Mock campaigns data
let mockCampaigns = [
  {
    _id: '1',
    name: 'Summer Newsletter',
    subject: 'Summer Updates from SHOWBAY',
    templateId: { _id: '2', name: 'Newsletter Template' },
    contacts: ['1', '2', '3'],
    status: 'sent',
    sentCount: 1247,
    failedCount: 0,
    totalContacts: 1247,
    sentAt: new Date('2024-03-28'),
    createdAt: new Date('2024-03-28')
  },
  {
    _id: '2',
    name: 'Product Launch',
    subject: 'New Product Available!',
    templateId: { _id: '3', name: 'Product Launch' },
    contacts: ['1', '2', '3', '4', '5'],
    status: 'draft',
    sentCount: 0,
    failedCount: 0,
    totalContacts: 5,
    createdAt: new Date('2024-03-27')
  },
  {
    _id: '3',
    name: 'Welcome Series',
    subject: 'Welcome to SHOWBAY',
    templateId: { _id: '1', name: 'Welcome Email' },
    contacts: ['1', '2'],
    status: 'active',
    sentCount: 892,
    failedCount: 5,
    totalContacts: 897,
    sentAt: new Date('2024-03-26'),
    createdAt: new Date('2024-03-26')
  }
];

let nextId = 4;

// Get all campaigns
router.get('/', async (req, res) => {
  try {
    res.json(mockCampaigns);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single campaign
router.get('/:id', async (req, res) => {
  try {
    const campaign = mockCampaigns.find(c => c._id === req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Not found' });
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create campaign
router.post('/', async (req, res) => {
  try {
    const { name, subject, templateId, contactIds } = req.body;
    const newCampaign = {
      _id: String(nextId++),
      name,
      subject,
      templateId: { _id: templateId, name: 'Template Name' },
      contacts: contactIds || [],
      status: 'draft',
      sentCount: 0,
      failedCount: 0,
      totalContacts: (contactIds || []).length,
      createdAt: new Date()
    };
    mockCampaigns.unshift(newCampaign);
    res.status(201).json(newCampaign);
  } catch (err) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

// Update campaign
router.put('/:id', async (req, res) => {
  try {
    const { name, subject, templateId, contactIds } = req.body;
    const index = mockCampaigns.findIndex(c => c._id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    
    mockCampaigns[index] = { 
      ...mockCampaigns[index], 
      name, 
      subject, 
      templateId: { _id: templateId, name: 'Template Name' },
      contacts: contactIds || [],
      totalContacts: (contactIds || []).length
    };
    res.json(mockCampaigns[index]);
  } catch (err) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

// Delete campaign
router.delete('/:id', async (req, res) => {
  try {
    const index = mockCampaigns.findIndex(c => c._id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    
    mockCampaigns.splice(index, 1);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Send test email (real implementation only)
router.post('/:id/test', async (req, res) => {
  try {
    const { testEmail } = req.body;
    if (!testEmail) return res.status(400).json({ error: 'Test email required' });

    const campaign = mockCampaigns.find(c => c._id === req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    if (!campaign.templateId) return res.status(400).json({ error: 'Template not selected' });

    // Check if SMTP is configured
    if (!mockSettings.smtpHost || !mockSettings.senderEmail || !mockSettings.appPassword || mockSettings.appPassword.includes('•')) {
      return res.status(400).json({ error: 'SMTP not configured. Please configure SMTP settings first.' });
    }

    // Create real transporter
    const transporter = nodemailer.createTransport({
      host: mockSettings.smtpHost,
      port: mockSettings.smtpPort,
      secure: mockSettings.smtpPort === 465,
      auth: { 
        user: mockSettings.senderEmail, 
        pass: mockSettings.appPassword 
      },
      tls: { rejectUnauthorized: false }
    });

    // Create test email content
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4fc3f7;">TEST EMAIL</h2>
        <p>This is a test email from campaign: <strong>${campaign.name}</strong></p>
        <p>Subject: ${campaign.subject}</p>
        <hr style="border: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">This is a test email sent from SHOWBAY Email Marketing System</p>
      </div>
    `;

    // Send test email
    await transporter.sendMail({
      from: `${mockSettings.senderName} <${mockSettings.senderEmail}>`,
      to: testEmail,
      subject: `[TEST] ${campaign.subject}`,
      html: html
    });

    res.json({ success: true, message: `Test email sent to ${testEmail}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send test email: ' + err.message });
  }
});

// Send bulk campaign (real implementation only)
router.post('/:id/send', async (req, res) => {
  try {
    const { cc, bcc, scheduleTime } = req.body; // Get CC/BCC and schedule time from request body
    const campaign = mockCampaigns.find(c => c._id === req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    if (!campaign.templateId) return res.status(400).json({ error: 'No template selected' });
    if (!campaign.contacts?.length) return res.status(400).json({ error: 'No contacts selected' });

    // Check if SMTP is configured
    if (!mockSettings.smtpHost || !mockSettings.senderEmail || !mockSettings.appPassword || mockSettings.appPassword.includes('•')) {
      return res.status(400).json({ error: 'SMTP not configured. Please configure SMTP settings first.' });
    }

    // If scheduling, update campaign status and return
    if (scheduleTime) {
      campaign.status = 'scheduled';
      campaign.scheduledAt = new Date(scheduleTime);
      campaign.cc = cc || '';
      campaign.bcc = bcc || '';
      
      // In a real implementation, you would use a job scheduler like node-cron
      // For now, we'll just mark it as scheduled
      return res.json({ 
        success: true, 
        message: `Campaign scheduled for ${new Date(scheduleTime).toLocaleString()}`,
        scheduled: true
      });
    }

    // Create real transporter
    const transporter = nodemailer.createTransport({
      host: mockSettings.smtpHost,
      port: mockSettings.smtpPort,
      secure: mockSettings.smtpPort === 465,
      auth: { 
        user: mockSettings.senderEmail, 
        pass: mockSettings.appPassword 
      },
      tls: { rejectUnauthorized: false }
    });

    // Get contacts for this campaign
    const campaignContacts = originalContacts.filter(c => campaign.contacts.includes(c._id));
    
    let sent = 0;
    let failed = 0;
    const errors = [];

    // Send emails to each contact
    for (const contact of campaignContacts) {
      try {
        // Get the template HTML if templateId exists
        let templateHtml = '';
        if (campaign.templateId) {
          const templateId = typeof campaign.templateId === 'object' ? campaign.templateId._id : campaign.templateId;
          const template = mockTemplates.find(t => t._id === templateId);
          if (template) {
            // Build proper HTML from template data
            const baseUrl = process.env.BASE_URL || `http://localhost:3000`;
            const fullImageUrl = template.imageUrl ? `${baseUrl}${template.imageUrl}` : '';
            
            templateHtml = `
              <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #ffffff; padding: 20px; border-radius: 8px;">
                ${fullImageUrl ? `<img src="${fullImageUrl}" style="width: 100%; max-width: 560px; height: auto; border-radius: 8px; margin-bottom: 20px; display: block;" alt="${template.name}" onerror="this.style.display='none';">` : ''}
                <h1 style="color: #2c3e50; font-size: 28px; margin-bottom: 20px; text-align: center;">${template.title || template.name}</h1>
                <div style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 25px; text-align: center;">
                  ${template.bodyContent || template.html || ''}
                </div>
                ${template.buttonText ? `
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${template.buttonLink || '#'}" style="background-color: #3498db; color: white; padding: 15px 35px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">${template.buttonText}</a>
                  </div>
                ` : ''}
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                  <p style="color: #666; font-size: 12px; margin: 0;">Sent from SHOWBAY Email Marketing System</p>
                </div>
              </div>
            `;
          }
        }

        const personalizedHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            ${templateHtml || `
              <h2 style="color: #4fc3f7;">Hello ${contact.name || 'Valued Customer'},</h2>
              <p>This email is from campaign: <strong>${campaign.name}</strong></p>
              <p>${campaign.subject}</p>
              <p>Company: ${contact.company || 'N/A'}</p>
            `}
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">Sent from SHOWBAY Email Marketing System</p>
          </div>
        `;

        // Prepare email options with CC/BCC support
        const mailOptions = {
          from: `${mockSettings.senderName} <${mockSettings.senderEmail}>`,
          to: contact.email,
          subject: campaign.subject,
          html: personalizedHtml
        };

        // Add CC if provided
        if (cc && cc.trim()) {
          mailOptions.cc = cc.split(',').map(email => email.trim()).filter(email => email);
        }

        // Add BCC if provided
        if (bcc && bcc.trim()) {
          mailOptions.bcc = bcc.split(',').map(email => email.trim()).filter(email => email);
        }

        await transporter.sendMail(mailOptions);
        
        sent++;
        
        // Add delay to avoid being flagged as spam
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        failed++;
        errors.push(`${contact.email}: ${error.message}`);
      }
    }

    // Update campaign status
    campaign.status = failed > 0 && sent === 0 ? 'failed' : 'sent';
    campaign.sentCount = sent;
    campaign.failedCount = failed;
    campaign.errors = errors.slice(0, 20); // Store first 20 errors
    campaign.sentAt = new Date();
    campaign.cc = cc || '';
    campaign.bcc = bcc || '';

    res.json({ 
      success: true, 
      sent, 
      failed, 
      errors,
      message: `Campaign sent successfully! ${sent} emails delivered, ${failed} failed.`
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send campaign: ' + err.message });
  }
});

module.exports = router;
