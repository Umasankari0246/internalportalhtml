# SHOWBAY Email Marketing System - Render Deployment Guide

## 🚀 Quick Deploy to Render

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 2. Deploy on Render
1. Go to [render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure deployment settings

### 3. Environment Variables (Set in Render Dashboard)
```
NODE_ENV=production
PORT=10000
MONGO_URI=your-mongodb-atlas-connection-string
SESSION_SECRET=your-strong-production-secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=your-email@gmail.com
SENDER_NAME=SHOWBAY Email Marketing
APP_PASSWORD=your-app-password
ADMIN_PASSWORD=your-production-admin-password
```

### 4. Database Setup
- Use MongoDB Atlas for production
- Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
- Add your IP to whitelist
- Get the connection string and set as `MONGO_URI`

### 5. Health Check
Your app will be available at: `https://your-app-name.onrender.com`
Health check endpoint: `https://your-app-name.onrender.com/health`

## 📋 Deployment Features

✅ **Production Ready Server**
- Uses `process.env.PORT` (Render requirement)
- Proper static file serving with caching
- Security headers for production
- Health check endpoint
- Graceful shutdown handling

✅ **Environment Configuration**
- Development vs Production modes
- Secure session cookies in production
- MongoDB connection with timeout handling
- Error handling and logging

✅ **Performance Optimizations**
- Static file caching (1 day)
- Gzip compression ready
- Trust proxy configuration
- Proper error responses

✅ **Security Features**
- HTTPS-only cookies in production
- Security headers
- Session management
- Input validation

## 🔧 Troubleshooting

### Common Issues:
1. **Database Connection**: Ensure MongoDB URI is correct and IP is whitelisted
2. **Port Issues**: Render automatically sets PORT=10000
3. **Static Files**: Check that public folder exists and is accessible
4. **Sessions**: Verify SESSION_SECRET is set

### Logs:
Check Render logs for any deployment issues or runtime errors.

## 🌟 Features After Deployment
- Dark blue AI-themed design
- Glassmorphism effects
- Email marketing functionality
- Contact management
- Template system
- Campaign tracking
- Settings management

## 📞 Support
For deployment issues, check:
1. Render deployment logs
2. MongoDB Atlas connection
3. Environment variables
4. GitHub repository status
