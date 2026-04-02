const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/templates/';
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Mock templates data with images
let mockTemplates = [
  {
    _id: '1',
    name: 'Welcome Email',
    type: 'builder',
    title: 'Welcome to SHOWBAY',
    bodyContent: 'Thank you for joining our email marketing platform. We are excited to have you on board!',
    imageUrl: '/images/templates/welcome-banner.svg',
    buttonText: 'Get Started',
    buttonLink: 'https://showbay.com',
    createdAt: new Date('2024-03-28')
  },
  {
    _id: '2',
    name: 'Newsletter Template',
    type: 'builder',
    title: 'Monthly Newsletter',
    bodyContent: 'Check out our latest updates and features for this month. We have exciting news to share with you!',
    imageUrl: '/images/templates/newsletter-header.svg',
    buttonText: 'Read More',
    buttonLink: 'https://showbay.com/newsletter',
    createdAt: new Date('2024-03-27')
  },
  {
    _id: '3',
    name: 'Product Launch',
    type: 'builder',
    title: 'New Product Available!',
    bodyContent: 'We are thrilled to announce our latest product. Discover how it can transform your business.',
    imageUrl: '/images/templates/product-launch.svg',
    buttonText: 'View Product',
    buttonLink: 'https://showbay.com/products',
    createdAt: new Date('2024-03-26')
  },
  {
    _id: '4',
    name: 'Event Invitation',
    type: 'builder',
    title: 'You\'re Invited!',
    bodyContent: 'Join us for an exclusive event. Network with industry leaders and discover new opportunities.',
    imageUrl: '/images/templates/event-invitation.svg',
    buttonText: 'RSVP Now',
    buttonLink: 'https://showbay.com/events',
    createdAt: new Date('2024-03-25')
  },
  {
    _id: '5',
    name: 'Holiday Special',
    type: 'builder',
    title: 'Holiday Special Offer',
    bodyContent: 'Celebrate the season with our special holiday offers. Limited time discounts available!',
    imageUrl: '/images/templates/holiday-special.svg',
    buttonText: 'Shop Now',
    buttonLink: 'https://showbay.com/holiday',
    createdAt: new Date('2024-03-24')
  },
  {
    _id: 'conf-001',
    name: 'Conference Invitation',
    type: 'predesigned',
    html: '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Conference</title></head><body style="margin:0;padding:20px;font-family:Arial"><div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px"><div style="background:#1a237e;color:white;padding:40px;text-align:center"><h1>&#x1F3AC; Annual Tech Conference 2024</h1><p>Join industry leaders</p></div><div style="padding:40px"><img src="/images/templates/conference-banner.jpg" style="width:100%;border-radius:8px"><h2>Event Details</h2><p><strong>Date:</strong> March 30, 2024</p><p><strong>Time:</strong> 9:00 AM - 6:00 PM</p><p><strong>Location:</strong> Tech Convention Center</p><div style="text-align:center;margin:30px 0"><a href="#" style="background:#4fc3f7;color:#0a0e27;text-decoration:none;padding:16px 32px;border-radius:8px;font-weight:600">RSVP Now</a></div></div></div></body></html>',
    createdAt: new Date('2024-03-23')
  },
  {
    _id: 'workshop-001',
    name: 'Workshop Promotion',
    type: 'predesigned',
    html: '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Workshop</title></head><body style="margin:0;padding:20px;font-family:Arial"><div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px"><div style="background:#4caf50;color:white;padding:40px;text-align:center"><h1>&#x1F6E0; Advanced Web Development Workshop</h1><p>Master modern web technologies</p></div><div style="padding:40px"><img src="/images/templates/workshop-promo.jpg" style="width:100%;border-radius:8px"><h3>What You’ll Learn:</h3><p>• React & Next.js best practices<br>• Advanced CSS techniques<br>• Performance optimization</p><div style="text-align:center;margin:30px 0"><a href="#" style="background:#4caf50;color:white;text-decoration:none;padding:16px 32px;border-radius:8px;font-weight:600">Register Now</a></div></div></div></body></html>',
    createdAt: new Date('2024-03-22')
  },
  {
    _id: 'corp-001',
    name: 'Corporate Event Announcement',
    type: 'predesigned',
    html: '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Corporate Event</title></head><body style="margin:0;padding:20px;font-family:Arial"><div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px"><div style="background:#2c3e50;color:white;padding:40px;text-align:center"><h1>&#x1F3E2; Quarterly Meeting</h1><p>Strategic planning session</p></div><div style="padding:40px"><img src="/images/templates/corporate-event.jpg" style="width:100%;border-radius:8px"><h3>Meeting Details:</h3><p><strong>Date:</strong> April 15, 2024</p><p><strong>Time:</strong> 2:00 PM - 5:00 PM</p><p><strong>Location:</strong> Corporate HQ</p><div style="text-align:center;margin:30px 0"><a href="#" style="background:#2c3e50;color:white;text-decoration:none;padding:16px 32px;border-radius:8px;font-weight:600">Confirm Attendance</a></div></div></div></body></html>',
    createdAt: new Date('2024-03-21')
  },
  {
    _id: 'product-001',
    name: 'Product Launch Email',
    type: 'predesigned',
    html: '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Product Launch</title></head><body style="margin:0;padding:20px;font-family:Arial"><div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px"><div style="background:#ff6b6b;color:white;padding:40px;text-align:center"><h1>&#x1F680; Product Launch: TechPro X1</h1><p>Revolutionary new product</p></div><div style="padding:40px"><img src="/images/templates/product-launch.jpg" style="width:100%;border-radius:8px"><h2>Revolutionary Features</h2><p>&#x26A1; Lightning Fast Processing<br>&#x1F510; Enterprise Security<br>&#x1F4C8; User-Friendly Interface</p><div style="text-align:center;margin:30px 0"><a href="#" style="background:#ff6b6b;color:white;text-decoration:none;padding:16px 32px;border-radius:8px;font-weight:600">Pre-Order Now</a></div></div></div></body></html>',
    createdAt: new Date('2024-03-20')
  },
  {
    _id: 'discount-001',
    name: 'Discount/Offer Email',
    type: 'predesigned',
    html: '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Special Offer</title></head><body style="margin:0;padding:20px;font-family:Arial"><div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px"><div style="background:#e91e63;color:white;padding:40px;text-align:center"><h1>&#x1F389; BLACK FRIDAY SPECIAL</h1><p>Biggest sale of the year</p></div><div style="padding:40px"><img src="/images/templates/discount-offer.jpg" style="width:100%;border-radius:8px"><div style="background:#fff3e0;padding:30px;text-align:center"><div style="background:#e91e63;color:white;padding:8px 16px;border-radius:50px;font-weight:bold;font-size:24px">50% OFF</div><h2>Everything Must Go!</h2></div><div style="text-align:center;margin:30px 0"><a href="#" style="background:#e91e63;color:white;text-decoration:none;padding:16px 32px;border-radius:8px;font-weight:600">Shop Now</a></div></div></div></body></html>',
    createdAt: new Date('2024-03-19')
  }
];

let nextId = 6;

// Build HTML from template fields
function buildHtml(data) {
  const { title, bodyContent, imageUrl, buttonText, buttonLink } = data;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title || 'SHOWBAY'}</title>
<style>
  body { margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f4f4; }
  .wrapper { max-width: 620px; margin: 0 auto; background: #fff; }
  .header { background: linear-gradient(135deg, #0a0e27 0%, #1a237e 100%); padding: 30px 40px; text-align: center; }
  .header h1 { color: #4fc3f7; margin: 0; font-size: 28px; letter-spacing: 3px; font-weight: 700; }
  .header p { color: #b8c5d6; margin: 5px 0 0; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; }
  .banner img { width: 100%; display: block; }
  .content { padding: 40px; }
  .content h2 { color: #0a0e27; font-size: 24px; margin: 0 0 20px; font-weight: 600; }
  .content p { color: #555; line-height: 1.8; font-size: 16px; margin-bottom: 20px; }
  .btn-wrap { text-align: center; margin: 30px 0; }
  .btn { display: inline-block; background: linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%); color: #0a0e27; padding: 14px 36px; text-decoration: none; font-weight: 600; letter-spacing: 1px; font-size: 14px; border-radius: 8px; transition: all 0.3s ease; }
  .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(79, 195, 247, 0.4); }
  .footer { background: #0a0e27; padding: 25px 40px; text-align: center; }
  .footer p { color: #64b5f6; font-size: 12px; margin: 0; }
  .footer span { color: #4fc3f7; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>SHOWBAY</h1>
    <p>Email Marketing</p>
  </div>
  ${imageUrl ? `<div class="banner"><img src="${imageUrl}" alt="Banner" style="max-width: 100%; height: auto;"></div>` : ''}
  <div class="content">
    ${title ? `<h2>${title}</h2>` : ''}
    <div>${bodyContent || ''}</div>
    ${buttonText && buttonLink ? `<div class="btn-wrap"><a href="${buttonLink}" class="btn">${buttonText}</a></div>` : ''}
  </div>
  <div class="footer">
    <p>&copy; ${new Date().getFullYear()} <span>SHOWBAY</span> Email Marketing. All rights reserved.</p>
    <p style="margin-top:8px;">You received this because you are on our mailing list.</p>
  </div>
</div>
</body>
</html>`;
}

// Get all templates
router.get('/', async (req, res) => {
  try {
    const templates = mockTemplates.map(t => {
      const copy = { ...t };
      delete copy.html;
      return copy;
    });
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single template with HTML
router.get('/:id', async (req, res) => {
  try {
    const template = mockTemplates.find(t => t._id === req.params.id);
    if (!template) return res.status(404).json({ error: 'Not found' });
    
    // Add HTML if not present
    if (!template.html && template.type === 'builder') {
      template.html = buildHtml(template);
    }
    
    res.json(template);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create builder template
router.post('/builder', async (req, res) => {
  try {
    const { name, title, bodyContent, imageUrl, buttonText, buttonLink } = req.body;
    const html = buildHtml({ title, bodyContent, imageUrl, buttonText, buttonLink });
    const newTemplate = {
      _id: String(nextId++),
      name,
      type: 'builder',
      title,
      bodyContent,
      imageUrl,
      buttonText,
      buttonLink,
      html,
      createdAt: new Date()
    };
    mockTemplates.unshift(newTemplate);
    res.status(201).json(newTemplate);
  } catch (err) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

// Update builder template
router.put('/builder/:id', async (req, res) => {
  try {
    const { name, title, bodyContent, imageUrl, buttonText, buttonLink } = req.body;
    const html = buildHtml({ title, bodyContent, imageUrl, buttonText, buttonLink });
    const index = mockTemplates.findIndex(t => t._id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    
    mockTemplates[index] = { ...mockTemplates[index], name, title, bodyContent, imageUrl, buttonText, buttonLink, html };
    res.json(mockTemplates[index]);
  } catch (err) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

// Upload image for template
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    // Move file to public images directory
    const publicImagePath = path.join(__dirname, '../public/images/templates', req.file.filename);
    fs.renameSync(req.file.path, publicImagePath);

    const imageUrl = `/images/templates/${req.file.filename}`;
    
    res.json({ 
      success: true, 
      imageUrl: imageUrl,
      filename: req.file.filename
    });
  } catch (err) {
    res.status(400).json({ error: 'Image upload failed: ' + err.message });
  }
});

// Upload HTML template + optional image
router.post('/upload', upload.fields([
  { name: 'htmlFile', maxCount: 1 },
  { name: 'imageFile', maxCount: 1 }
]), async (req, res) => {
  try {
    if (!req.files?.htmlFile) return res.status(400).json({ error: 'HTML file required' });

    const htmlPath = req.files.htmlFile[0].path;
    let html = fs.readFileSync(htmlPath, 'utf8');
    fs.unlinkSync(htmlPath);

    let uploadedImagePath = null;
    if (req.files?.imageFile) {
      // Move image to public directory
      const publicImagePath = path.join(__dirname, '../public/images/templates', req.files.imageFile[0].filename);
      fs.renameSync(req.files.imageFile[0].path, publicImagePath);
      uploadedImagePath = `/images/templates/${req.files.imageFile[0].filename}`;
      
      // Embed image reference in HTML if placeholder exists
      html = html.replace(/{{IMAGE_URL}}/g, uploadedImagePath);
    }

    const newTemplate = {
      _id: String(nextId++),
      name: req.body.name || 'Uploaded Template',
      type: 'upload',
      html,
      uploadedImagePath,
      createdAt: new Date()
    };
    mockTemplates.unshift(newTemplate);
    res.status(201).json(newTemplate);
  } catch (err) {
    res.status(400).json({ error: 'Upload failed: ' + err.message });
  }
});

// Delete template
router.delete('/:id', async (req, res) => {
  try {
    const index = mockTemplates.findIndex(t => t._id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    
    // Delete associated image file if it exists
    const template = mockTemplates[index];
    if (template.imageUrl && template.imageUrl.includes('/images/templates/')) {
      const imagePath = path.join(__dirname, '../public', template.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    mockTemplates.splice(index, 1);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
module.exports.mockTemplates = mockTemplates;
