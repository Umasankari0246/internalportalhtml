require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('📧 SHOWBAY Email Marketing System starting...');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session (using memory store)
app.use(session({
  secret: process.env.SESSION_SECRET || 'showbay-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 8 } // 8 hours
}));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/campaigns', require('./routes/campaigns'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Serve login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve main app (with authentication check)
app.get('*', (req, res) => {
  // If user is not logged in and not on login page, redirect to login
  if (!req.session.userId && req.path !== '/login') {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 SHOWBAY Email Marketing System running on http://localhost:${PORT}`);
  console.log(`🎨 Dark blue AI-powered theme applied`);
  console.log(`📧 Features: Contacts, Templates, Campaigns, Settings`);
});
