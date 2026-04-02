const nodemailer = require('nodemailer');
const Settings = require('../models/Settings');

async function getTransporter() {
  const settings = await Settings.findOne({ key: 'smtp' });
  if (!settings || !settings.smtpHost || !settings.senderEmail || !settings.appPassword) {
    throw new Error('SMTP settings not configured. Please go to Settings and configure email.');
  }

  return {
    transporter: nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort || 587,
      secure: settings.smtpPort === 465,
      auth: {
        user: settings.senderEmail,
        pass: settings.appPassword
      },
      tls: { rejectUnauthorized: false }
    }),
    from: `"${settings.senderName || 'SHOWBAY Events'}" <${settings.senderEmail}>`
  };
}

async function sendEmail({ to, subject, html }) {
  const { transporter, from } = await getTransporter();
  return transporter.sendMail({ from, to, subject, html });
}

async function sendBulkEmails({ contacts, subject, html }) {
  const { transporter, from } = await getTransporter();
  let sent = 0, failed = 0, errors = [];

  for (const contact of contacts) {
    try {
      // Personalize
      let personalizedHtml = html
        .replace(/{{name}}/gi, contact.name || '')
        .replace(/{{email}}/gi, contact.email || '')
        .replace(/{{company}}/gi, contact.company || '');

      await transporter.sendMail({
        from,
        to: `"${contact.name}" <${contact.email}>`,
        subject,
        html: personalizedHtml
      });
      sent++;
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 100));
    } catch (err) {
      failed++;
      errors.push(`${contact.email}: ${err.message}`);
    }
  }

  return { sent, failed, errors };
}

module.exports = { sendEmail, sendBulkEmails };
