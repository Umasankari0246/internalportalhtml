const fs = require('fs');

// Read current .env file
let envContent = '';
try {
  envContent = fs.readFileSync('.env', 'utf8');
} catch (err) {
  console.log('No .env file found, creating new one...');
  envContent = '';
}

// Update SMTP settings
const smtpConfig = `
# SHOWBAY Email Marketing System - Environment Variables

# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/showbay

# Session Secret (change this to a strong random string)
SESSION_SECRET=showbay-super-secret-key-change-this-in-production

# Server Port
PORT=3000

# SMTP Configuration for Email Sending
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=umasankari0246@gmail.com
SENDER_NAME=SHOWBAY Email Marketing
APP_PASSWORD=fdqs qbjx xubf xrxp
`;

// Write updated .env file
fs.writeFileSync('.env', smtpConfig);

console.log('✅ SMTP configuration updated successfully!');
console.log('📧 Email: umasankari0246@gmail.com');
console.log('🔑 Password: fdqs qbjx xubf xrxp');
console.log('🔄 Please restart the server to apply changes.');
