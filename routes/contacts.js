const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parse');
const xlsx = require('xlsx');
const Contact = require('../models/Contact');

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/tmp/',
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Get all contacts
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    let query = {};
    
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Contact.countDocuments(query);
    
    res.json({ contacts, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Error fetching contacts:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single contact
router.get('/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    res.json(contact);
  } catch (err) {
    console.error('Error fetching contact:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new contact
router.post('/', async (req, res) => {
  try {
    const { name, email, company, phone, tags } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Check if contact with email already exists
    const existingContact = await Contact.findOne({ email: email.toLowerCase() });
    if (existingContact) {
      return res.status(400).json({ error: 'Contact with this email already exists' });
    }

    const contact = new Contact({
      name,
      email: email.toLowerCase(),
      company: company || '',
      phone: phone || '',
      tags: Array.isArray(tags) ? tags : []
    });

    await contact.save();
    res.status(201).json(contact);
  } catch (err) {
    console.error('Error creating contact:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update contact
router.put('/:id', async (req, res) => {
  try {
    const { name, email, company, phone, tags } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) {
      // Check if email is being changed and if new email already exists
      const existingContact = await Contact.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: req.params.id }
      });
      if (existingContact) {
        return res.status(400).json({ error: 'Contact with this email already exists' });
      }
      updateData.email = email.toLowerCase();
    }
    if (company !== undefined) updateData.company = company;
    if (phone !== undefined) updateData.phone = phone;
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    res.json(contact);
  } catch (err) {
    console.error('Error updating contact:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete contact
router.delete('/:id', async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    res.json({ message: 'Contact deleted successfully' });
  } catch (err) {
    console.error('Error deleting contact:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete multiple contacts
router.post('/delete-many', async (req, res) => {
  try {
    const { ids } = req.body;
    const result = await Contact.deleteMany({ _id: { $in: ids } });
    res.json({ message: `Deleted ${result.deletedCount} contacts successfully` });
  } catch (err) {
    console.error('Error deleting contacts:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload CSV/Excel file and parse contacts
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    let contacts = [];

    // Parse CSV or Excel file
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      // Parse CSV
      const fs = require('fs');
      const fileContent = fs.readFileSync(file.path, 'utf8');
      
      csv.parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      }, (err, records) => {
        if (err) {
          fs.unlinkSync(file.path); // Clean up temp file
          return res.status(400).json({ error: 'Error parsing CSV file' });
        }

        contacts = records.map(record => ({
          name: record.name || record.Name || record.NAME || '',
          email: record.email || record.Email || record.EMAIL || '',
          company: record.company || record.Company || record.COMPANY || '',
          phone: record.phone || record.Phone || record.PHONE || ''
        })).filter(c => c.name && c.email);

        fs.unlinkSync(file.path); // Clean up temp file
        processBulkImport(contacts, res);
      });
    } else if (file.mimetype.includes('sheet') || file.originalname.endsWith('.xlsx') || file.originalname.endsWith('.xls')) {
      // Parse Excel
      const workbook = xlsx.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const records = xlsx.utils.sheet_to_json(worksheet);

      contacts = records.map(record => ({
        name: record.name || record.Name || record.NAME || '',
        email: record.email || record.Email || record.EMAIL || '',
        company: record.company || record.Company || record.COMPANY || '',
        phone: record.phone || record.Phone || record.PHONE || ''
      })).filter(c => c.name && c.email);

      const fs = require('fs');
      fs.unlinkSync(file.path); // Clean up temp file
      processBulkImport(contacts, res);
    } else {
      const fs = require('fs');
      fs.unlinkSync(file.path); // Clean up temp file
      return res.status(400).json({ error: 'Invalid file type. Please upload CSV or Excel files only.' });
    }
  } catch (err) {
    console.error('Error processing upload:', err);
    if (req.file) {
      const fs = require('fs');
      fs.unlinkSync(req.file.path); // Clean up temp file
    }
    res.status(500).json({ error: 'Error processing file' });
  }
});

// Helper function to process bulk import
async function processBulkImport(contacts, res) {
  try {
    const results = [];
    const errors = [];

    for (let i = 0; i < contacts.length; i++) {
      const contactData = contacts[i];
      
      if (!contactData.name || !contactData.email) {
        errors.push({ row: i + 1, error: 'Name and email are required' });
        continue;
      }

      try {
        // Check if contact already exists
        const existingContact = await Contact.findOne({ email: contactData.email.toLowerCase() });
        if (existingContact) {
          errors.push({ row: i + 1, error: 'Contact with this email already exists' });
          continue;
        }

        const contact = new Contact({
          name: contactData.name,
          email: contactData.email.toLowerCase(),
          company: contactData.company || '',
          phone: contactData.phone || '',
          tags: Array.isArray(contactData.tags) ? contactData.tags : []
        });

        await contact.save();
        results.push(contact);
      } catch (err) {
        errors.push({ row: i + 1, error: err.message });
      }
    }

    res.json({
      imported: results.length,
      skipped: errors.length,
      errors: errors.map(e => `Row ${e.row}: ${e.error}`)
    });
  } catch (err) {
    console.error('Error bulk importing contacts:', err);
    res.status(500).json({ error: 'Server error during import' });
  }
}

// Bulk import contacts
router.post('/bulk', async (req, res) => {
  try {
    const { contacts } = req.body;
    
    if (!Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({ error: 'Contacts array is required' });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < contacts.length; i++) {
      const contactData = contacts[i];
      
      if (!contactData.name || !contactData.email) {
        errors.push({ row: i + 1, error: 'Name and email are required' });
        continue;
      }

      try {
        // Check if contact already exists
        const existingContact = await Contact.findOne({ email: contactData.email.toLowerCase() });
        if (existingContact) {
          errors.push({ row: i + 1, error: 'Contact with this email already exists' });
          continue;
        }

        const contact = new Contact({
          name: contactData.name,
          email: contactData.email.toLowerCase(),
          company: contactData.company || '',
          phone: contactData.phone || '',
          tags: Array.isArray(contactData.tags) ? contactData.tags : []
        });

        await contact.save();
        results.push(contact);
      } catch (err) {
        errors.push({ row: i + 1, error: err.message });
      }
    }

    res.status(201).json({
      message: `Successfully imported ${results.length} contacts`,
      imported: results,
      errors: errors
    });
  } catch (err) {
    console.error('Error bulk importing contacts:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
