# SMTP Testing Guide

## Quick Setup for Testing

### 1. Gmail Setup (Recommended)
1. **Enable 2-Step Verification** in your Google Account
2. **Create App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" for app
   - Generate 16-character password
   - Copy this password (shown only once)

### 2. Configure in SHOWBAY
1. **Login** to SHOWBAY (admin@showbay.com / showbay2024)
2. **Go to Settings** page
3. **Enter SMTP Settings:**
   - SMTP Host: `smtp.gmail.com`
   - SMTP Port: `587`
   - Sender Email: your@gmail.com
   - Sender Name: Your Name
   - App Password: paste the 16-character password
4. **Click "Save Settings"**
5. **Click "Test Connection"**

### 3. Send Test Email
1. **Go to Campaigns** → Create new campaign
2. **Select template** and contacts
3. **Click "Send Test Email"** 
4. **Enter your email** to receive test

## Common Issues & Solutions

### ❌ "Please enter and save your SMTP App Password first"
**Solution:** Enter your 16-character app password and click "Save Settings" first

### ❌ "SMTP test failed: Invalid login"
**Solutions:**
- Check Gmail 2-Step Verification is enabled
- Generate new App Password
- Ensure correct email format
- Try port 587 with TLS

### ❌ "SMTP test failed: Connection timeout"
**Solutions:**
- Check internet connection
- Verify SMTP host: smtp.gmail.com
- Try different port: 465 (SSL) or 587 (TLS)

## Other Email Providers

### Outlook
- Host: `smtp-mail.outlook.com`
- Port: `587`
- Use regular password (no app password needed)

### Yahoo
- Host: `smtp.mail.yahoo.com`
- Port: `587`
- Use Yahoo App Password

### Custom SMTP
- Check provider documentation
- Usually port 587 (TLS) or 465 (SSL)
- Use provider-specific credentials
