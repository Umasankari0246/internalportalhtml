const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { mockUsers } = require('./auth');

// Mock settings data - User's Gmail configuration
let mockSettings = {
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  senderEmail: 'umasankari0246@gmail.com',
  senderName: 'SHOWBAY Events',
  appPassword: 'bkbd sbnh hkxm dyuf', // User's app password
  updatedAt: new Date('2024-03-28')
};

// Get settings
router.get('/', async (req, res) => {
  try {
    // Mask password
    const data = { ...mockSettings };
    if (data.appPassword && !data.appPassword.includes('•')) {
      data.appPassword = '••••••••••••';
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update settings
router.post('/', async (req, res) => {
  try {
    const { smtpHost, smtpPort, senderEmail, senderName, appPassword } = req.body;

    const update = { 
      smtpHost, 
      smtpPort: Number(smtpPort), 
      senderEmail, 
      senderName, 
      updatedAt: new Date() 
    };
    
    // Only update password if provided and not masked
    if (appPassword && !appPassword.includes('•')) {
      update.appPassword = appPassword;
    }

    mockSettings = { ...mockSettings, ...update };
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

// Change password
router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Find the user (using shared user data)
    const user = mockUsers.find(u => u.email === 'admin@showbay.com');
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Validate current password
    if (currentPassword !== user.password) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to change password' });
  }
});

// Test SMTP connection (real implementation only)
router.post('/test', async (req, res) => {
  try {
    if (!mockSettings.smtpHost || !mockSettings.senderEmail) {
      return res.status(400).json({ error: 'Please configure SMTP Host and Sender Email first' });
    }

    // If password is not set or masked, can't test connection
    if (!mockSettings.appPassword || mockSettings.appPassword.includes('•')) {
      return res.status(400).json({ 
        error: 'Please enter and save your SMTP App Password first',
        help: 'For Gmail: Create a 16-character App Password and save it before testing'
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

    // Test connection
    await transporter.verify();
    res.json({ success: true, message: 'SMTP connection verified successfully!' });
  } catch (err) {
    res.status(400).json({ 
      error: 'SMTP test failed: ' + err.message,
      help: 'Check your SMTP settings and App Password. For Gmail, ensure 2-Step Verification is enabled.'
    });
  }
});

// Export settings for use in other routes
module.exports = router;
module.exports.mockSettings = mockSettings;
