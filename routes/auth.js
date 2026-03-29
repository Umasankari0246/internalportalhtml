const express = require('express');
const router = express.Router();

// Shared user data (same as in settings)
let mockUsers = [
  { _id: 'admin-001', name: 'Admin', email: 'admin@showbay.com', password: 'showbay2024', role: 'admin' }
];

// Simple password comparison
const comparePassword = (inputPassword, storedPassword) => {
  return inputPassword === storedPassword;
};

// Get user by email (shared function)
const getUserByEmail = (email) => {
  return mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
};

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = getUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = comparePassword(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    req.session.userId = user._id;
    req.session.userName = user.name;
    req.session.userEmail = user.email;

    res.json({ success: true, name: user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

// Session check
router.get('/me', (req, res) => {
  if (req.session.userId) {
    res.json({ loggedIn: true, name: req.session.userName, email: req.session.userEmail });
  } else {
    res.json({ loggedIn: false });
  }
});

// Seed default admin (run once)
router.post('/seed', async (req, res) => {
  res.json({ message: 'Admin credentials: admin@showbay.com / showbay2024' });
});

// Export functions for use in other routes
module.exports = router;
module.exports.getUserByEmail = getUserByEmail;
module.exports.mockUsers = mockUsers;
