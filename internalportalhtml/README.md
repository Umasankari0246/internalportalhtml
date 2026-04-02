# SHOWBAY — Internal Email Marketing System

A secure, full-stack internal email marketing platform built for event management companies. Built with Node.js, Express, MongoDB, and vanilla JavaScript.

## 🆕 **NEW FEATURES**
- **Real Email Sending** - Send actual emails through SMTP (Gmail, Outlook, etc.)
- **Password Management** - Change your account password from the Settings page
- **16-Character App Password Support** - Full support for Gmail App Passwords
- **Template Image Upload** - Upload images for email templates with drag & drop
- **Sample Template Images** - Pre-built professional template images included
- **🎨 Visual Template Editor** - Canva-like drag-and-drop template designer
- **Design Tools** - Text, images, buttons, shapes with full customization
- **Live Preview** - See your template design in real-time
- **Dark Blue AI Theme** - Modern dark theme with animations and particle effects

---

## 📁 Project Structure

```
showbay/
├── server.js              # Main Express app
├── setup.js               # One-time setup script
├── .env.example           # Environment variable template
├── package.json
│
├── models/                # MongoDB schemas
│   ├── User.js
│   ├── Contact.js
│   ├── Template.js
│   ├── Campaign.js
│   └── Settings.js
│
├── routes/                # API route handlers
│   ├── auth.js
│   ├── contacts.js
│   ├── templates.js
│   ├── campaigns.js
│   ├── settings.js
│   └── dashboard.js
│
├── middleware/
│   └── auth.js            # Session authentication
│
├── utils/
│   └── mailer.js          # Nodemailer email sender
│
├── uploads/               # Uploaded files (auto-created)
│   ├── tmp/
│   └── templates/
│
└── public/                # Frontend (served statically)
    ├── index.html         # Main app shell
    ├── login.html         # Login page
    ├── css/
    │   └── app.css
    └── js/
        ├── api.js         # Fetch wrapper
        ├── app.js         # Router, modal, toast
        ├── dashboard.js
        ├── contacts.js
        ├── templates.js
        ├── campaigns.js
        └── settings.js
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+
- **MongoDB** v6+ (local or MongoDB Atlas)

---

### Step 1 — Install Dependencies

```bash
cd showbay
npm install
```

---

### Step 2 — Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
MONGO_URI=mongodb://localhost:27017/showbay
SESSION_SECRET=your-long-random-secret-here
PORT=3000
```

> For **MongoDB Atlas**, use a connection string like:
> `MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/showbay`

---

### Step 3 — Run Setup Script (once)

```bash
node setup.js
```

This creates the admin user and upload directories.

**Default credentials:**
- Email: `admin@showbay.com`
- Password: `showbay2024`

> ⚠️ Change the password after first login by editing the user in MongoDB.

---

### Step 4 — Start the Server

```bash
# Production
npm start

# Development (auto-restart)
npm run dev
```

Open: **http://localhost:3000**

---

## ⚙️ SMTP Configuration & Real Email Sending

### **Setup Instructions**

1. **Go to Settings Page** after logging in
2. **Configure SMTP Settings:**

| Provider       | Host                       | Port | Notes |
|----------------|----------------------------|------|-------|
| Gmail          | smtp.gmail.com             | 587  | Requires App Password |
| Outlook        | smtp-mail.outlook.com      | 587  | Use regular password |
| Yahoo          | smtp.mail.yahoo.com        | 587  | Use App Password |
| Custom SMTP    | Your provider's host       | 587/465 | Check provider docs |

### **Gmail Setup (Recommended)**

1. **Enable 2-Step Verification** in your Google Account
2. **Create App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" for app
   - Generate 16-character password
   - **Copy this password** - it's shown only once
3. **Enter in Settings:**
   - SMTP Host: `smtp.gmail.com`
   - SMTP Port: `587`
   - Sender Email: your@gmail.com
   - App Password: paste the 16-character password
4. **Test Connection** - Click "Test Connection" button

### **Password Management**

- **Change Password:** Go to Settings → Password Management
- **Requirements:** Minimum 6 characters
- **Current Password Required:** For security

### **Real Email Features**

✅ **Test Emails** - Send test emails to any address  
✅ **Bulk Campaigns** - Send to multiple contacts with personalization  
✅ **SMTP Verification** - Test your SMTP connection before sending  
✅ **Error Handling** - Detailed error reporting for failed sends  
✅ **Rate Limiting** - Built-in delays to avoid spam filters  

---

## 🔐 **Security Features**

- **Session-based Authentication**
- **Password Masking** - SMTP passwords are masked in UI
- **Input Validation** - All inputs validated server-side
- **XSS Protection** - Content sanitized
- **Secure Headers** - Built-in Express security
| Custom SMTP    | your-host                  | 587  |

### Gmail App Password Setup
1. Enable 2-Step Verification on your Google account
2. Go to: Google Account → Security → App Passwords
3. Create a new App Password for "Mail"
4. Use that 16-character code as the App Password in Settings

---

## 🔄 Complete Workflow

```
1. Login → admin@showbay.com / showbay2024
2. Settings → Enter SMTP credentials → Test Connection
3. Contacts → Add manually or Import CSV/Excel
4. Templates → Use Builder or Upload HTML
5. Campaigns → Create campaign → Select template & contacts
6. Campaigns → Send Test Email → Verify it works
7. Campaigns → Send Bulk → Emails delivered to all contacts
8. Dashboard → View stats and campaign history
```

---

## 📤 CSV Import Format

Your CSV must have these columns (case-insensitive):

```csv
name,email,company,phone
John Doe,john@example.com,ACME Corp,+1555000000
Jane Smith,jane@example.com,Tech Ltd,+1555111111
```

Download the template from the Contacts page.

---

## 🎨 Template Personalization & Images

### **Personalization Tags**
Use these tags in your templates — they are automatically replaced per contact during bulk send:

| Tag           | Replaced With     |
|---------------|-------------------|
| `{{name}}`    | Contact's name    |
| `{{email}}`   | Contact's email   |
| `{{company}}` | Contact's company |

### **Template Images**
✅ **Image Upload** - Upload custom images for templates (JPG, PNG, GIF, max 5MB)  
✅ **Drag & Drop** - Simply drag image files to upload  
✅ **Sample Images** - Pre-built professional template images included:  
   - Welcome Banner
   - Newsletter Header  
   - Product Launch
   - Event Invitation
   - Holiday Special

### **Template Builder Features**
- **Visual Builder** - Create templates with WYSIWYG editor
- **HTML Support** - Use HTML tags in body content
- **Image Integration** - Add images via URL or upload
- **Live Preview** - See how your email looks before sending
- **Responsive Design** - Templates work on all devices

### **🎨 Visual Editor (Canva-like)**
✅ **Drag & Drop Canvas** - 600x400px email design canvas  
✅ **Design Tools Panel** - All design elements in one place:  
   - 📝 Text elements with editable content
   - 🖼 Image elements with sample images
   - 🔘 Button elements with customizable styling
   - ⬜ Rectangle shapes
   - ⭕ Circle shapes
   - ➖ Line elements
✅ **Properties Panel** - Real-time editing of selected elements:  
   - Font size, color, weight for text
   - Dimensions for images
   - Colors and text for buttons
   - Background and border colors for shapes
✅ **Element Selection** - Click to select, drag to move
✅ **Live Preview** - Open template in new window to test
✅ **Save & Export** - Save as HTML template for campaigns

### **How to Use Visual Editor:**
1. **Go to Templates** → Click "Visual Editor" tab
2. **Add Elements:** Use the Design Tools panel on the left
3. **Edit Elements:** Click any element to see properties on the right
4. **Move Elements:** Drag elements to position them on canvas
5. **Edit Text:** Click text elements to edit content inline
6. **Customize:** Use properties panel to change colors, sizes, etc.
7. **Preview:** Click "Preview" to see final email
8. **Save:** Click "Save Template" and give it a name

---

## 🔐 Security Notes

- Session-based authentication with MongoDB session store
- Passwords hashed with bcrypt (12 rounds)
- All routes protected by `requireAuth` middleware
- SMTP credentials stored in database (not hardcoded)
- App Password masked in Settings UI after saving

---

## 📊 Database Collections

| Collection  | Purpose                      |
|-------------|------------------------------|
| `users`     | Login accounts               |
| `contacts`  | Email recipients             |
| `templates` | HTML email templates         |
| `campaigns` | Campaign records + stats     |
| `settings`  | SMTP configuration           |
| `sessions`  | Express session store        |

---

## 🛠️ Adding More Users

Use MongoDB shell or a GUI like MongoDB Compass:

```js
// In MongoDB shell
use showbay
db.users.insertOne({
  name: "Jane Marketing",
  email: "jane@showbay.com",
  password: "<bcrypt-hashed-password>",
  role: "staff",
  createdAt: new Date()
})
```

Or use the seed endpoint (development only):
```bash
curl -X POST http://localhost:3000/auth/seed
```

---

## 🐛 Troubleshooting

| Problem                | Solution                                          |
|------------------------|---------------------------------------------------|
| Can't connect to DB    | Check MONGO_URI in .env                           |
| Login fails            | Run `node setup.js` first                         |
| Emails not sending     | Check Settings → Test Connection                  |
| Gmail auth fails       | Use App Password, not Gmail password              |
| File upload fails      | Ensure `uploads/` directory exists               |
| Port in use            | Change PORT in .env                               |

---

## 🏗️ Tech Stack

- **Backend**: Node.js, Express 4
- **Database**: MongoDB with Mongoose
- **Auth**: express-session + connect-mongo
- **Email**: Nodemailer
- **File Uploads**: Multer
- **CSV Parsing**: csv-parse
- **Excel Parsing**: xlsx
- **Frontend**: Vanilla HTML/CSS/JS (no framework)
- **Fonts**: Google Fonts (Cinzel + Lato)

---

*Built for SHOWBAY Event Management — Internal Use Only*
