const express = require('express');
const router = express.Router();

// Mock contacts data - including user's email for testing
let mockContacts = [
  { _id: '1', name: 'John Doe', email: 'john@example.com', company: 'Tech Corp', phone: '555-0101', createdAt: new Date('2024-03-28') },
  { _id: '2', name: 'Jane Smith', email: 'jane@example.com', company: 'Design Inc', phone: '555-0102', createdAt: new Date('2024-03-27') },
  { _id: '3', name: 'Uma Sankari', email: 'umasankari0246@gmail.com', company: 'SHOWBAY Testing', phone: '555-0103', createdAt: new Date('2024-03-26') },
  { _id: '4', name: 'Alice Brown', email: 'alice@example.com', company: 'Sales Co', phone: '555-0104', createdAt: new Date('2024-03-25') },
  { _id: '5', name: 'Charlie Wilson', email: 'charlie@example.com', company: 'Consulting Ltd', phone: '555-0105', createdAt: new Date('2024-03-24') }
];

let nextId = 6;

// Get all contacts
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    let filtered = mockContacts;
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = mockContacts.filter(c => 
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
    const contact = mockContacts.find(c => c._id === req.params.id);
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
    mockContacts.unshift(newContact);
    res.status(201).json(newContact);
  } catch (err) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

// Update contact
router.put('/:id', async (req, res) => {
  try {
    const index = mockContacts.findIndex(c => c._id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    
    mockContacts[index] = { ...mockContacts[index], ...req.body };
    res.json(mockContacts[index]);
  } catch (err) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

// Delete contact
router.delete('/:id', async (req, res) => {
  try {
    const index = mockContacts.findIndex(c => c._id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    
    mockContacts.splice(index, 1);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete multiple
router.post('/delete-many', async (req, res) => {
  try {
    const { ids } = req.body;
    mockContacts = mockContacts.filter(c => !ids.includes(c._id));
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
module.exports.mockContacts = mockContacts;
