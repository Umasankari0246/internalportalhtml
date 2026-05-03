const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Template = require('../models/Template');

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

// Get all templates
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    let query = {};
    
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } },
          { type: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const templates = await Template.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Template.countDocuments(query);
    
    res.json({ templates, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Error fetching templates:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single template
router.get('/:id', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) return res.status(404).json({ error: 'Template not found' });
    res.json(template);
  } catch (err) {
    console.error('Error fetching template:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new template (handles both builder and legacy formats)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, title, bodyContent, buttonText, buttonLink, html, builderElements, builderBackground } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Template name is required' });
    }

    let templateData = {
      name,
      type: 'builder'
    };

    // Handle visual builder format
    if (builderElements) {
      templateData.html = html || '';
      try {
        // Parse builderElements from JSON string
        if (typeof builderElements === 'string') {
          templateData.builderElements = JSON.parse(builderElements);
        } else {
          templateData.builderElements = builderElements;
        }
      } catch (err) {
        console.error('Error parsing builderElements:', err, 'Received type:', typeof builderElements, 'Value:', builderElements);
        templateData.builderElements = [];
      }
      templateData.builderBackground = builderBackground || '#ffffff';
      
      // Extract first image as imageUrl if available
      const elements = templateData.builderElements;
      const imageElement = elements.find(el => el.type === 'image' && el.src);
      if (imageElement) {
        templateData.imageUrl = imageElement.src;
      }
    } else {
      // Handle legacy format
      templateData.title = title || name;
      templateData.bodyContent = bodyContent || '';
      templateData.buttonText = buttonText || 'Learn More';
      templateData.buttonLink = buttonLink || '#';
      templateData.html = html || buildHtml({
        title: title || name,
        bodyContent: bodyContent || '',
        imageUrl: req.file ? `/uploads/templates/${req.file.filename}` : null,
        buttonText: buttonText || 'Learn More',
        buttonLink: buttonLink || '#'
      });
      templateData.imageUrl = req.file ? `/uploads/templates/${req.file.filename}` : null;
    }

    const template = new Template(templateData);
    await template.save();
    res.status(201).json(template);
  } catch (err) {
    console.error('Error creating template:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Configure multer for HTML uploads (multiple files)
const htmlUpload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'htmlFile' && file.mimetype === 'text/html') {
      cb(null, true);
    } else if (file.fieldname === 'imageFile' && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload template HTML
router.post('/upload', htmlUpload.fields([
  { name: 'htmlFile', maxCount: 1 },
  { name: 'imageFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name } = req.body;
    const htmlFile = req.files && req.files.htmlFile ? req.files.htmlFile[0] : null;
    
    if (!name) {
      return res.status(400).json({ error: 'Template name is required' });
    }

    let html = '';
    let imageUrl = null;

    // Handle HTML file
    if (htmlFile) {
      const fs = require('fs');
      html = fs.readFileSync(htmlFile.path, 'utf8');
      fs.unlinkSync(htmlFile.path); // Clean up temp file
      
      // Validate that this is an email template, not a full web application
      if (html.length > 50000) {
        return res.status(400).json({ 
          error: 'File too large. Please upload an email template (max 50KB), not a full web application.' 
        });
      }
      
      // Check for indicators of full web application
      const suspiciousPatterns = [
        /<script\s+src=/gi,
        /document\.getElementById/gi,
        /addEventListener/gi,
        /window\.location/gi,
        /fetch\s*\(/gi,
        /const\s+App\s*=/gi,
        /class\s+Page\s*{/gi
      ];
      
      const hasSuspiciousContent = suspiciousPatterns.some(pattern => pattern.test(html));
      if (hasSuspiciousContent) {
        return res.status(400).json({ 
          error: 'Invalid file type. Please upload an email template, not a web application.' 
        });
      }
      
      // Check for email template indicators
      const hasEmailIndicators = [
        /<body[^>]*>.*<(table|div)[^>]*>.*<\/(table|div)>/gi,
        /<a[^>]*href=["']?(mailto|http)/gi,
        /{{[^}]*}}/g, // Template variables
        /email|template|newsletter/gi
      ].some(pattern => pattern.test(html));
      
      if (!hasEmailIndicators) {
        return res.status(400).json({ 
          error: 'This doesn\'t appear to be an email template. Please upload a proper email template.' 
        });
      }
      
    } else if (req.body.html) {
      // Fallback for direct HTML upload
      html = req.body.html;
    } else {
      return res.status(400).json({ error: 'HTML file is required' });
    }

    // Handle image file if uploaded
    const imageFile = req.files && req.files.imageFile ? req.files.imageFile[0] : null;
    if (imageFile) {
      imageUrl = `/uploads/templates/${imageFile.filename}`;
      // Replace {{IMAGE_URL}} placeholder with actual image URL
      html = html.replace(/\{\{IMAGE_URL\}\}/g, imageUrl);
    }

    const template = new Template({
      name,
      type: 'upload',
      html,
      imageUrl
    });

    await template.save();
    res.status(201).json(template);
  } catch (err) {
    console.error('Error uploading template:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// Update template
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, title, bodyContent, buttonText, buttonLink } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (title !== undefined) updateData.title = title;
    if (bodyContent !== undefined) updateData.bodyContent = bodyContent;
    if (buttonText !== undefined) updateData.buttonText = buttonText;
    if (buttonLink !== undefined) updateData.buttonLink = buttonLink;
    if (req.file) updateData.imageUrl = `/uploads/templates/${req.file.filename}`;

    // If updating builder template, rebuild HTML
    if (updateData.title !== undefined || updateData.bodyContent !== undefined || 
        updateData.buttonText !== undefined || updateData.buttonLink !== undefined || req.file) {
      const template = await Template.findById(req.params.id);
      if (!template) return res.status(404).json({ error: 'Template not found' });
      
      updateData.html = buildHtml({
        title: updateData.title !== undefined ? updateData.title : template.title,
        bodyContent: updateData.bodyContent !== undefined ? updateData.bodyContent : template.bodyContent,
        imageUrl: updateData.imageUrl !== undefined ? updateData.imageUrl : template.imageUrl,
        buttonText: updateData.buttonText !== undefined ? updateData.buttonText : template.buttonText,
        buttonLink: updateData.buttonLink !== undefined ? updateData.buttonLink : template.buttonLink
      });
    }

    const template = await Template.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!template) return res.status(404).json({ error: 'Template not found' });
    res.json(template);
  } catch (err) {
    console.error('Error updating template:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload image for template builder
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const imageUrl = `/uploads/templates/${req.file.filename}`;
    
    res.json({ 
      success: true, 
      imageUrl: imageUrl,
      filename: req.file.filename
    });
  } catch (err) {
    console.error('Error uploading image:', err);
    res.status(500).json({ error: 'Image upload failed: ' + err.message });
  }
});

// Delete template
router.delete('/:id', async (req, res) => {
  try {
    const template = await Template.findByIdAndDelete(req.params.id);
    if (!template) return res.status(404).json({ error: 'Template not found' });
    
    // Clean up uploaded image if exists
    if (template.imageUrl) {
      const imagePath = path.join(__dirname, '..', template.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    res.json({ message: 'Template deleted successfully' });
  } catch (err) {
    console.error('Error deleting template:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

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
  .content h2 { color: #0a0e27; font-size: 24px; margin: 0 0 20px; }
  .content p { color: #333; line-height: 1.6; margin: 0 0 20px; }
  .button { text-align: center; margin: 30px 0; }
  .button a { background: linear-gradient(135deg, #4fc3f7 0%, #0a0e27 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; display: inline-block; }
  .footer { background: #0a0e27; color: #b8c5d6; padding: 30px 40px; text-align: center; }
  .footer p { margin: 0; font-size: 12px; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>SHOWBAY</h1>
    <p>Email Marketing System</p>
  </div>
  ${imageUrl ? `<div class="banner"><img src="${imageUrl}" alt="${title}" style="width: 100%;"></div>` : ''}
  <div class="content">
    <h2>${title || 'Welcome'}</h2>
    <p>${bodyContent || 'Thank you for your interest in our services.'}</p>
    ${buttonText ? `<div class="button"><a href="${buttonLink || '#'}">${buttonText}</a></div>` : ''}
  </div>
  <div class="footer">
    <p>&copy; 2024 SHOWBAY. All rights reserved.</p>
  </div>
</div>
</body>
</html>`;
}

module.exports = router;
