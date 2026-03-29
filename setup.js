#!/usr/bin/env node
/**
 * SHOWBAY Setup Script
 * Run once: node setup.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/showbay';

// Ensure upload directories exist
const dirs = ['uploads', 'uploads/tmp', 'uploads/templates'];
dirs.forEach(d => { if (!fs.existsSync(d)) { fs.mkdirSync(d, { recursive: true }); console.log(`✅ Created: ${d}/`); }});

async function setup() {
  try {
    console.log('\n🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Define inline to avoid import issues
    const userSchema = new mongoose.Schema({
      name: String,
      email: { type: String, unique: true },
      password: String,
      role: { type: String, default: 'admin' }
    });
    const User = mongoose.models.User || mongoose.model('User', userSchema);

    const existing = await User.findOne({ email: 'admin@showbay.com' });
    if (existing) {
      console.log('ℹ️  Admin user already exists — skipping creation');
    } else {
      const hash = await bcrypt.hash('showbay2024', 12);
      await User.create({ name: 'Admin', email: 'admin@showbay.com', password: hash, role: 'admin' });
      console.log('\n👤 Default admin created:');
      console.log('   Email:    admin@showbay.com');
      console.log('   Password: showbay2024');
      console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    }

    console.log('\n🎉 Setup complete! Run "npm start" to launch SHOWBAY.');
    console.log(`🌐 Open: http://localhost:${process.env.PORT || 3000}\n`);
  } catch (err) {
    console.error('❌ Setup failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

setup();
