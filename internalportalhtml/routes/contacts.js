const express = require('express');
const router = express.Router();

// Original contacts data provided by user
let originalContacts = [
  { _id: '1', name: 'Sureka', email: 'surekabala311@gmail.com', company: '', phone: '', createdAt: new Date() },
  { _id: '2', name: 'Vinotha', email: 'vinotharkp2005@gmail.com', company: '', phone: '', createdAt: new Date() },
  { _id: '3', name: 'Sanju', email: 'sanjuvxyz@gmail.com', company: '', phone: '', createdAt: new Date() },
  { _id: '4', name: 'Shankari', email: 'usankari0246@gmail.com', company: '', phone: '', createdAt: new Date() }
];

let nextId = 5;

// Get all contacts
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    let filtered = originalContacts;
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = originalContacts.filter(c => 
        c.name.toLowerCase().includes(searchLower) ||
        c.email.toLowerCase().includes(searchLower) ||
        c.company.toLowerCase().includes(searchLower)
      );
    }
    
    const total = filtered.length;
    const start = (page - 1) * limit;
    const contacts = filtered.slice(start, start + Number(limit));
    
    res.json({ contacts, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single contact
router.get('/:id', async (req, res) => {
  try {
    const contact = originalContacts.find(c => c._id === req.params.id);
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create contact
router.post('/', async (req, res) => {
  try {
    const newContact = {
      _id: String(nextId++),
      ...req.body,
      createdAt: new Date()
    };
    originalContacts.unshift(newContact);
    res.status(201).json(newContact);
  } catch (err) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

// Update contact
router.put('/:id', async (req, res) => {
  try {
    const index = originalContacts.findIndex(c => c._id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    
    originalContacts[index] = { ...originalContacts[index], ...req.body };
    res.json(originalContacts[index]);
  } catch (err) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

// Delete contact
router.delete('/:id', async (req, res) => {
  try {
    const index = originalContacts.findIndex(c => c._id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    
    originalContacts.splice(index, 1);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete multiple
router.post('/delete-many', async (req, res) => {
  try {
    const { ids } = req.body;
    originalContacts = originalContacts.filter(c => !ids.includes(c._id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload CSV/Excel (mock)
router.post('/upload', (req, res) => {
  res.json({ 
    success: true, 
    imported: 10, 
    skipped: 2, 
    errors: ['invalid@email.com', 'duplicate@email.com'] 
  });
});

module.exports = router;
module.exports.originalContacts = originalContacts;
