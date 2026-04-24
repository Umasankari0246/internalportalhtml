const mongoose = require('mongoose');
const Template = require('./models/Template');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/showbay', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB for populating templates...');
  
  // Clear existing templates
  return Template.deleteMany({});
})
.then(() => {
  console.log('Cleared existing templates');
  
  // Sample templates data
  const templates = [
    {
      name: 'Welcome Email',
      type: 'builder',
      title: 'Welcome to SHOWBAY!',
      bodyContent: 'Thank you for joining our email marketing platform. We are excited to have you on board! Get started with our powerful features and create amazing email campaigns.',
      buttonText: 'Get Started',
      buttonLink: 'https://showbay.io/',
      html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Welcome to SHOWBAY!</title>
<style>body{font-family:Arial,sans-serif;margin:0;padding:20px;background:#f4f4f4}
.wrapper{max-width:600px;margin:0 auto;background:#fff;border-radius:8px}
.header{background:linear-gradient(135deg,#0a0e27 0%,#1a237e 100%);color:white;padding:40px;text-align:center}
.header h1{color:#4fc3f7;margin:0;font-size:28px}
.content{padding:40px}
.content h2{color:#0a0e27;font-size:24px;margin:0 0 20px}
.content p{color:#333;line-height:1.6;margin:0 0 20px}
.button{text-align:center;margin:30px 0}
.button a{background:linear-gradient(135deg,#4fc3f7 0%,#0a0e27 100%);color:white;text-decoration:none;padding:16px 32px;border-radius:8px;font-weight:600;display:inline-block}
.footer{background:#0a0e27;color:#b8c5d6;padding:30px;text-align:center}
</style></head>
<body>
<div class="wrapper">
  <div class="header"><h1>SHOWBAY</h1></div>
  <div class="content">
    <h2>Welcome to SHOWBAY!</h2>
    <p>Thank you for joining our email marketing platform. We are excited to have you on board! Get started with our powerful features and create amazing email campaigns.</p>
    <div class="button"><a href="https://showbay.io/">Get Started</a></div>
  </div>
  <div class="footer"><p>&copy; 2024 SHOWBAY. All rights reserved.</p></div>
</div>
</body></html>`
    },
    {
      name: 'Monthly Newsletter',
      type: 'builder',
      title: 'Your Monthly Marketing Insights',
      bodyContent: 'Check out our latest updates and features for this month. We have exciting news to share with you about new email marketing tools and best practices to boost your campaigns.',
      buttonText: 'Read More',
      buttonLink: 'https://showbay.io/',
      html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Monthly Newsletter</title>
<style>body{font-family:Arial,sans-serif;margin:0;padding:20px;background:#f4f4f4}
.wrapper{max-width:600px;margin:0 auto;background:#fff;border-radius:8px}
.header{background:linear-gradient(135deg,#4caf50 0%,#2e7d32 100%);color:white;padding:40px;text-align:center}
.header h1{color:#ffffff;margin:0;font-size:28px}
.content{padding:40px}
.content h2{color:#2e7d32;font-size:24px;margin:0 0 20px}
.content p{color:#333;line-height:1.6;margin:0 0 20px}
.button{text-align:center;margin:30px 0}
.button a{background:linear-gradient(135deg,#4caf50 0%,#2e7d32 100%);color:white;text-decoration:none;padding:16px 32px;border-radius:8px;font-weight:600;display:inline-block}
.footer{background:#2e7d32;color:#e8f5e9;padding:30px;text-align:center}
</style></head>
<body>
<div class="wrapper">
  <div class="header"><h1>Monthly Newsletter</h1></div>
  <div class="content">
    <h2>Your Monthly Marketing Insights</h2>
    <p>Check out our latest updates and features for this month. We have exciting news to share with you about new email marketing tools and best practices to boost your campaigns.</p>
    <div class="button"><a href="https://showbay.io/">Read More</a></div>
  </div>
  <div class="footer"><p>&copy; 2024 SHOWBAY. All rights reserved.</p></div>
</div>
</body></html>`
    },
    {
      name: 'Product Launch',
      type: 'builder',
      title: 'New Product Available!',
      bodyContent: 'We are thrilled to announce our latest product. Discover how it can transform your business marketing with advanced automation and analytics features.',
      buttonText: 'View Product',
      buttonLink: 'https://showbay.io/',
      html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Product Launch</title>
<style>body{font-family:Arial,sans-serif;margin:0;padding:20px;background:#f4f4f4}
.wrapper{max-width:600px;margin:0 auto;background:#fff;border-radius:8px}
.header{background:linear-gradient(135deg,#ff6b6b 0%,#c62828 100%);color:white;padding:40px;text-align:center}
.header h1{color:#ffffff;margin:0;font-size:28px}
.content{padding:40px}
.content h2{color:#c62828;font-size:24px;margin:0 0 20px}
.content p{color:#333;line-height:1.6;margin:0 0 20px}
.button{text-align:center;margin:30px 0}
.button a{background:linear-gradient(135deg,#ff6b6b 0%,#c62828 100%);color:white;text-decoration:none;padding:16px 32px;border-radius:8px;font-weight:600;display:inline-block}
.footer{background:#c62828;color:#ffebee;padding:30px;text-align:center}
</style></head>
<body>
<div class="wrapper">
  <div class="header"><h1>Product Launch</h1></div>
  <div class="content">
    <h2>New Product Available!</h2>
    <p>We are thrilled to announce our latest product. Discover how it can transform your business marketing with advanced automation and analytics features.</p>
    <div class="button"><a href="https://showbay.io/">View Product</a></div>
  </div>
  <div class="footer"><p>&copy; 2024 SHOWBAY. All rights reserved.</p></div>
</div>
</body></html>`
    },
    {
      name: 'Event Invitation',
      type: 'builder',
      title: 'You\'re Invited!',
      bodyContent: 'Join us for an exclusive event. Network with industry leaders and discover new opportunities in email marketing and digital transformation.',
      buttonText: 'RSVP Now',
      buttonLink: 'https://showbay.io/',
      html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Event Invitation</title>
<style>body{font-family:Arial,sans-serif;margin:0;padding:20px;background:#f4f4f4}
.wrapper{max-width:600px;margin:0 auto;background:#fff;border-radius:8px}
.header{background:linear-gradient(135deg,#9c27b0 0%,#6a1b9a 100%);color:white;padding:40px;text-align:center}
.header h1{color:#ffffff;margin:0;font-size:28px}
.content{padding:40px}
.content h2{color:#6a1b9a;font-size:24px;margin:0 0 20px}
.content p{color:#333;line-height:1.6;margin:0 0 20px}
.button{text-align:center;margin:30px 0}
.button a{background:linear-gradient(135deg,#9c27b0 0%,#6a1b9a 100%);color:white;text-decoration:none;padding:16px 32px;border-radius:8px;font-weight:600;display:inline-block}
.footer{background:#6a1b9a;color:#f3e5f5;padding:30px;text-align:center}
</style></head>
<body>
<div class="wrapper">
  <div class="header"><h1>Event Invitation</h1></div>
  <div class="content">
    <h2>You're Invited!</h2>
    <p>Join us for an exclusive event. Network with industry leaders and discover new opportunities in email marketing and digital transformation.</p>
    <div class="button"><a href="https://showbay.io/">RSVP Now</a></div>
  </div>
  <div class="footer"><p>&copy; 2024 SHOWBAY. All rights reserved.</p></div>
</div>
</body></html>`
    },
    {
      name: 'Holiday Special',
      type: 'builder',
      title: 'Holiday Special Offer',
      bodyContent: 'Special holiday discounts on all our services! Limited time offer with up to 50% off on premium features and enterprise plans.',
      buttonText: 'Shop Now',
      buttonLink: 'https://showbay.io/',
      html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Holiday Special</title>
<style>body{font-family:Arial,sans-serif;margin:0;padding:20px;background:#f4f4f4}
.wrapper{max-width:600px;margin:0 auto;background:#fff;border-radius:8px}
.header{background:linear-gradient(135deg,#e91e63 0%,#ad1457 100%);color:white;padding:40px;text-align:center}
.header h1{color:#ffffff;margin:0;font-size:28px}
.content{padding:40px}
.content h2{color:#ad1457;font-size:24px;margin:0 0 20px}
.content p{color:#333;line-height:1.6;margin:0 0 20px}
.button{text-align:center;margin:30px 0}
.button a{background:linear-gradient(135deg,#e91e63 0%,#ad1457 100%);color:white;text-decoration:none;padding:16px 32px;border-radius:8px;font-weight:600;display:inline-block}
.footer{background:#ad1457;color:#fce4ec;padding:30px;text-align:center}
</style></head>
<body>
<div class="wrapper">
  <div class="header"><h1>Holiday Special</h1></div>
  <div class="content">
    <h2>Holiday Special Offer</h2>
    <p>Special holiday discounts on all our services! Limited time offer with up to 50% off on premium features and enterprise plans.</p>
    <div class="button"><a href="https://showbay.io/">Shop Now</a></div>
  </div>
  <div class="footer"><p>&copy; 2024 SHOWBAY. All rights reserved.</p></div>
</div>
</body></html>`
    },
    {
      name: 'Webinar Announcement',
      type: 'builder',
      title: 'Free Email Marketing Webinar',
      bodyContent: 'Join our expert-led webinar on advanced email marketing strategies. Learn how to increase open rates, engagement, and conversions with proven techniques.',
      buttonText: 'Register Now',
      buttonLink: 'https://showbay.io/',
      html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Webinar Announcement</title>
<style>body{font-family:Arial,sans-serif;margin:0;padding:20px;background:#f4f4f4}
.wrapper{max-width:600px;margin:0 auto;background:#fff;border-radius:8px}
.header{background:linear-gradient(135deg,#2196f3 0%,#1565c0 100%);color:white;padding:40px;text-align:center}
.header h1{color:#ffffff;margin:0;font-size:28px}
.content{padding:40px}
.content h2{color:#1565c0;font-size:24px;margin:0 0 20px}
.content p{color:#333;line-height:1.6;margin:0 0 20px}
.button{text-align:center;margin:30px 0}
.button a{background:linear-gradient(135deg,#2196f3 0%,#1565c0 100%);color:white;text-decoration:none;padding:16px 32px;border-radius:8px;font-weight:600;display:inline-block}
.footer{background:#1565c0;color:#e3f2fd;padding:30px;text-align:center}
</style></head>
<body>
<div class="wrapper">
  <div class="header"><h1>Webinar Announcement</h1></div>
  <div class="content">
    <h2>Free Email Marketing Webinar</h2>
    <p>Join our expert-led webinar on advanced email marketing strategies. Learn how to increase open rates, engagement, and conversions with proven techniques.</p>
    <div class="button"><a href="https://showbay.io/">Register Now</a></div>
  </div>
  <div class="footer"><p>&copy; 2024 SHOWBAY. All rights reserved.</p></div>
</div>
</body></html>`
    },
    {
      name: 'Customer Survey',
      type: 'builder',
      title: 'We Value Your Feedback',
      bodyContent: 'Help us improve our services by sharing your experience. Your feedback is important to us and helps us create better email marketing solutions.',
      buttonText: 'Take Survey',
      buttonLink: 'https://showbay.io/',
      html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Customer Survey</title>
<style>body{font-family:Arial,sans-serif;margin:0;padding:20px;background:#f4f4f4}
.wrapper{max-width:600px;margin:0 auto;background:#fff;border-radius:8px}
.header{background:linear-gradient(135deg,#607d8b 0%,#37474f 100%);color:white;padding:40px;text-align:center}
.header h1{color:#ffffff;margin:0;font-size:28px}
.content{padding:40px}
.content h2{color:#37474f;font-size:24px;margin:0 0 20px}
.content p{color:#333;line-height:1.6;margin:0 0 20px}
.button{text-align:center;margin:30px 0}
.button a{background:linear-gradient(135deg,#607d8b 0%,#37474f 100%);color:white;text-decoration:none;padding:16px 32px;border-radius:8px;font-weight:600;display:inline-block}
.footer{background:#37474f;color:#eceff1;padding:30px;text-align:center}
</style></head>
<body>
<div class="wrapper">
  <div class="header"><h1>Customer Survey</h1></div>
  <div class="content">
    <h2>We Value Your Feedback</h2>
    <p>Help us improve our services by sharing your experience. Your feedback is important to us and helps us create better email marketing solutions.</p>
    <div class="button"><a href="https://showbay.io/">Take Survey</a></div>
  </div>
  <div class="footer"><p>&copy; 2024 SHOWBAY. All rights reserved.</p></div>
</div>
</body></html>`
    },
    {
      name: 'Flash Sale',
      type: 'builder',
      title: '⚡ Flash Sale - 24 Hours Only!',
      bodyContent: 'Limited time flash sale! Get 40% off all premium features. This offer ends in 24 hours. Don\'t miss out on this incredible deal.',
      buttonText: 'Claim Discount',
      buttonLink: 'https://showbay.io/',
      html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Flash Sale</title>
<style>body{font-family:Arial,sans-serif;margin:0;padding:20px;background:#f4f4f4}
.wrapper{max-width:600px;margin:0 auto;background:#fff;border-radius:8px}
.header{background:linear-gradient(135deg,#ff9800 0%,#e65100 100%);color:white;padding:40px;text-align:center}
.header h1{color:#ffffff;margin:0;font-size:28px}
.content{padding:40px}
.content h2{color:#e65100;font-size:24px;margin:0 0 20px}
.content p{color:#333;line-height:1.6;margin:0 0 20px}
.button{text-align:center;margin:30px 0}
.button a{background:linear-gradient(135deg,#ff9800 0%,#e65100 100%);color:white;text-decoration:none;padding:16px 32px;border-radius:8px;font-weight:600;display:inline-block}
.footer{background:#e65100;color:#fff3e0;padding:30px;text-align:center}
</style></head>
<body>
<div class="wrapper">
  <div class="header"><h1>Flash Sale</h1></div>
  <div class="content">
    <h2>⚡ Flash Sale - 24 Hours Only!</h2>
    <p>Limited time flash sale! Get 40% off all premium features. This offer ends in 24 hours. Don't miss out on this incredible deal.</p>
    <div class="button"><a href="https://showbay.io/">Claim Discount</a></div>
  </div>
  <div class="footer"><p>&copy; 2024 SHOWBAY. All rights reserved.</p></div>
</div>
</body></html>`
    },
    {
      name: 'New Feature Update',
      type: 'builder',
      title: 'Exciting New Features Available!',
      bodyContent: 'We\'ve just launched powerful new features including advanced analytics, A/B testing, and automation workflows. Upgrade your email marketing game today.',
      buttonText: 'Explore Features',
      buttonLink: 'https://showbay.io/',
      html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>New Feature Update</title>
<style>body{font-family:Arial,sans-serif;margin:0;padding:20px;background:#f4f4f4}
.wrapper{max-width:600px;margin:0 auto;background:#fff;border-radius:8px}
.header{background:linear-gradient(135deg,#4caf50 0%,#1b5e20 100%);color:white;padding:40px;text-align:center}
.header h1{color:#ffffff;margin:0;font-size:28px}
.content{padding:40px}
.content h2{color:#1b5e20;font-size:24px;margin:0 0 20px}
.content p{color:#333;line-height:1.6;margin:0 0 20px}
.button{text-align:center;margin:30px 0}
.button a{background:linear-gradient(135deg,#4caf50 0%,#1b5e20 100%);color:white;text-decoration:none;padding:16px 32px;border-radius:8px;font-weight:600;display:inline-block}
.footer{background:#1b5e20;color:#e8f5e9;padding:30px;text-align:center}
</style></head>
<body>
<div class="wrapper">
  <div class="header"><h1>New Feature Update</h1></div>
  <div class="content">
    <h2>Exciting New Features Available!</h2>
    <p>We've just launched powerful new features including advanced analytics, A/B testing, and automation workflows. Upgrade your email marketing game today.</p>
    <div class="button"><a href="https://showbay.io/">Explore Features</a></div>
  </div>
  <div class="footer"><p>&copy; 2024 SHOWBAY. All rights reserved.</p></div>
</div>
</body></html>`
    },
    {
      name: 'Abandoned Cart Recovery',
      type: 'builder',
      title: 'Did You Forget Something?',
      bodyContent: 'We noticed you left some items in your cart. Complete your purchase now and enjoy free shipping on all orders. Your items are waiting for you!',
      buttonText: 'Complete Purchase',
      buttonLink: 'https://showbay.io/',
      html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Abandoned Cart</title>
<style>body{font-family:Arial,sans-serif;margin:0;padding:20px;background:#f4f4f4}
.wrapper{max-width:600px;margin:0 auto;background:#fff;border-radius:8px}
.header{background:linear-gradient(135deg,#ff5722 0%,#bf360c 100%);color:white;padding:40px;text-align:center}
.header h1{color:#ffffff;margin:0;font-size:28px}
.content{padding:40px}
.content h2{color:#bf360c;font-size:24px;margin:0 0 20px}
.content p{color:#333;line-height:1.6;margin:0 0 20px}
.button{text-align:center;margin:30px 0}
.button a{background:linear-gradient(135deg,#ff5722 0%,#bf360c 100%);color:white;text-decoration:none;padding:16px 32px;border-radius:8px;font-weight:600;display:inline-block}
.footer{background:#bf360c;color:#fbe9e7;padding:30px;text-align:center}
</style></head>
<body>
<div class="wrapper">
  <div class="header"><h1>Abandoned Cart</h1></div>
  <div class="content">
    <h2>Did You Forget Something?</h2>
    <p>We noticed you left some items in your cart. Complete your purchase now and enjoy free shipping on all orders. Your items are waiting for you!</p>
    <div class="button"><a href="https://showbay.io/">Complete Purchase</a></div>
  </div>
  <div class="footer"><p>&copy; 2024 SHOWBAY. All rights reserved.</p></div>
</div>
</body></html>`
    },
    {
      name: 'Thank You Email',
      type: 'builder',
      title: 'Thank You for Your Purchase!',
      bodyContent: 'We appreciate your business! Your order has been confirmed and you\'ll receive tracking information shortly. Check out these helpful resources to get started.',
      buttonText: 'View Resources',
      buttonLink: 'https://showbay.io/',
      html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Thank You</title>
<style>body{font-family:Arial,sans-serif;margin:0;padding:20px;background:#f4f4f4}
.wrapper{max-width:600px;margin:0 auto;background:#fff;border-radius:8px}
.header{background:linear-gradient(135deg,#8bc34a 0%,#558b2f 100%);color:white;padding:40px;text-align:center}
.header h1{color:#ffffff;margin:0;font-size:28px}
.content{padding:40px}
.content h2{color:#558b2f;font-size:24px;margin:0 0 20px}
.content p{color:#333;line-height:1.6;margin:0 0 20px}
.button{text-align:center;margin:30px 0}
.button a{background:linear-gradient(135deg,#8bc34a 0%,#558b2f 100%);color:white;text-decoration:none;padding:16px 32px;border-radius:8px;font-weight:600;display:inline-block}
.footer{background:#558b2f;color:#f1f8e9;padding:30px;text-align:center}
</style></head>
<body>
<div class="wrapper">
  <div class="header"><h1>Thank You</h1></div>
  <div class="content">
    <h2>Thank You for Your Purchase!</h2>
    <p>We appreciate your business! Your order has been confirmed and you'll receive tracking information shortly. Check out these helpful resources to get started.</p>
    <div class="button"><a href="https://showbay.io/">View Resources</a></div>
  </div>
  <div class="footer"><p>&copy; 2024 SHOWBAY. All rights reserved.</p></div>
</div>
</body></html>`
    },
    {
      name: 'Birthday Special',
      type: 'builder',
      title: 'Happy Birthday! 🎂',
      bodyContent: 'It\'s your special day! Enjoy 25% off on all our premium features as our birthday gift to you. This exclusive offer is valid for 7 days only.',
      buttonText: 'Claim Your Gift',
      buttonLink: 'https://showbay.io/',
      html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Birthday Special</title>
<style>body{font-family:Arial,sans-serif;margin:0;padding:20px;background:#f4f4f4}
.wrapper{max-width:600px;margin:0 auto;background:#fff;border-radius:8px}
.header{background:linear-gradient(135deg,#e91e63 0%,#880e4f 100%);color:white;padding:40px;text-align:center}
.header h1{color:#ffffff;margin:0;font-size:28px}
.content{padding:40px}
.content h2{color:#880e4f;font-size:24px;margin:0 0 20px}
.content p{color:#333;line-height:1.6;margin:0 0 20px}
.button{text-align:center;margin:30px 0}
.button a{background:linear-gradient(135deg,#e91e63 0%,#880e4f 100%);color:white;text-decoration:none;padding:16px 32px;border-radius:8px;font-weight:600;display:inline-block}
.footer{background:#880e4f;color:#fce4ec;padding:30px;text-align:center}
</style></head>
<body>
<div class="wrapper">
  <div class="header"><h1>Birthday Special</h1></div>
  <div class="content">
    <h2>Happy Birthday! 🎂</h2>
    <p>It's your special day! Enjoy 25% off on all our premium features as our birthday gift to you. This exclusive offer is valid for 7 days only.</p>
    <div class="button"><a href="https://showbay.io/">Claim Your Gift</a></div>
  </div>
  <div class="footer"><p>&copy; 2024 SHOWBAY. All rights reserved.</p></div>
</div>
</body></html>`
    },
    {
      name: 'Re-engagement Campaign',
      type: 'builder',
      title: 'We Miss You! Come Back Soon',
      bodyContent: 'It\'s been a while since your last login. We\'ve added exciting new features and have a special welcome back offer just for you. Don\'t miss out!',
      buttonText: 'Come Back Now',
      buttonLink: 'https://showbay.io/',
      html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Re-engagement Campaign</title>
<style>body{font-family:Arial,sans-serif;margin:0;padding:20px;background:#f4f4f4}
.wrapper{max-width:600px;margin:0 auto;background:#fff;border-radius:8px}
.header{background:linear-gradient(135deg,#3f51b5 0%,#1a237e 100%);color:white;padding:40px;text-align:center}
.header h1{color:#ffffff;margin:0;font-size:28px}
.content{padding:40px}
.content h2{color:#1a237e;font-size:24px;margin:0 0 20px}
.content p{color:#333;line-height:1.6;margin:0 0 20px}
.button{text-align:center;margin:30px 0}
.button a{background:linear-gradient(135deg,#3f51b5 0%,#1a237e 100%);color:white;text-decoration:none;padding:16px 32px;border-radius:8px;font-weight:600;display:inline-block}
.footer{background:#1a237e;color:#e8eaf6;padding:30px;text-align:center}
</style></head>
<body>
<div class="wrapper">
  <div class="header"><h1>Re-engagement Campaign</h1></div>
  <div class="content">
    <h2>We Miss You! Come Back Soon</h2>
    <p>It's been a while since your last login. We've added exciting new features and have a special welcome back offer just for you. Don't miss out!</p>
    <div class="button"><a href="https://showbay.io/">Come Back Now</a></div>
  </div>
  <div class="footer"><p>&copy; 2024 SHOWBAY. All rights reserved.</p></div>
</div>
</body></html>`
    },
    {
      name: 'Product Update',
      type: 'builder',
      title: 'Important Product Update',
      bodyContent: 'We\'ve made significant improvements to our platform based on your feedback. Enhanced performance, new templates, and better analytics are now available.',
      buttonText: 'Learn More',
      buttonLink: 'https://showbay.io/',
      html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Product Update</title>
<style>body{font-family:Arial,sans-serif;margin:0;padding:20px;background:#f4f4f4}
.wrapper{max-width:600px;margin:0 auto;background:#fff;border-radius:8px}
.header{background:linear-gradient(135deg,#009688 0%,#004d40 100%);color:white;padding:40px;text-align:center}
.header h1{color:#ffffff;margin:0;font-size:28px}
.content{padding:40px}
.content h2{color:#004d40;font-size:24px;margin:0 0 20px}
.content p{color:#333;line-height:1.6;margin:0 0 20px}
.button{text-align:center;margin:30px 0}
.button a{background:linear-gradient(135deg,#009688 0%,#004d40 100%);color:white;text-decoration:none;padding:16px 32px;border-radius:8px;font-weight:600;display:inline-block}
.footer{background:#004d40;color:#e0f2f1;padding:30px;text-align:center}
</style></head>
<body>
<div class="wrapper">
  <div class="header"><h1>Product Update</h1></div>
  <div class="content">
    <h2>Important Product Update</h2>
    <p>We've made significant improvements to our platform based on your feedback. Enhanced performance, new templates, and better analytics are now available.</p>
    <div class="button"><a href="https://showbay.io/">Learn More</a></div>
  </div>
  <div class="footer"><p>&copy; 2024 SHOWBAY. All rights reserved.</p></div>
</div>
</body></html>`
    },
    {
      name: 'Seasonal Promotion',
      type: 'builder',
      title: '🌸 Spring Sale is Here!',
      bodyContent: 'Spring into savings with our seasonal promotion! Get 30% off on all annual plans and enjoy fresh new templates perfect for your spring campaigns.',
      buttonText: 'Shop Spring Sale',
      buttonLink: 'https://showbay.io/',
      html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Seasonal Promotion</title>
<style>body{font-family:Arial,sans-serif;margin:0;padding:20px;background:#f4f4f4}
.wrapper{max-width:600px;margin:0 auto;background:#fff;border-radius:8px}
.header{background:linear-gradient(135deg,#ffeb3b 0%,#f57f17 100%);color:white;padding:40px;text-align:center}
.header h1{color:#ffffff;margin:0;font-size:28px}
.content{padding:40px}
.content h2{color:#f57f17;font-size:24px;margin:0 0 20px}
.content p{color:#333;line-height:1.6;margin:0 0 20px}
.button{text-align:center;margin:30px 0}
.button a{background:linear-gradient(135deg,#ffeb3b 0%,#f57f17 100%);color:white;text-decoration:none;padding:16px 32px;border-radius:8px;font-weight:600;display:inline-block}
.footer{background:#f57f17;color:#fffde7;padding:30px;text-align:center}
</style></head>
<body>
<div class="wrapper">
  <div class="header"><h1>Seasonal Promotion</h1></div>
  <div class="content">
    <h2>🌸 Spring Sale is Here!</h2>
    <p>Spring into savings with our seasonal promotion! Get 30% off on all annual plans and enjoy fresh new templates perfect for your spring campaigns.</p>
    <div class="button"><a href="https://showbay.io/">Shop Spring Sale</a></div>
  </div>
  <div class="footer"><p>&copy; 2024 SHOWBAY. All rights reserved.</p></div>
</div>
</body></html>`
    },
    {
      name: 'Corporate Newsletter',
      type: 'builder',
      title: 'Q1 Business Insights & Updates',
      bodyContent: 'Quarterly business performance review with key metrics, strategic initiatives, and upcoming product roadmap. Stay informed about our company\'s progress and future plans.',
      buttonText: 'Read Full Report',
      buttonLink: 'https://showbay.io/',
      html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Corporate Newsletter</title>
<style>body{font-family:Arial,sans-serif;margin:0;padding:20px;background:#f4f4f4}
.wrapper{max-width:600px;margin:0 auto;background:#fff;border-radius:8px}
.header{background:linear-gradient(135deg,#546e7a 0%,#263238 100%);color:white;padding:40px;text-align:center}
.header h1{color:#ffffff;margin:0;font-size:28px}
.content{padding:40px}
.content h2{color:#263238;font-size:24px;margin:0 0 20px}
.content p{color:#333;line-height:1.6;margin:0 0 20px}
.button{text-align:center;margin:30px 0}
.button a{background:linear-gradient(135deg,#546e7a 0%,#263238 100%);color:white;text-decoration:none;padding:16px 32px;border-radius:8px;font-weight:600;display:inline-block}
.footer{background:#263238;color:#eceff1;padding:30px;text-align:center}
</style></head>
<body>
<div class="wrapper">
  <div class="header"><h1>Corporate Newsletter</h1></div>
  <div class="content">
    <h2>Q1 Business Insights & Updates</h2>
    <p>Quarterly business performance review with key metrics, strategic initiatives, and upcoming product roadmap. Stay informed about our company's progress and future plans.</p>
    <div class="button"><a href="https://showbay.io/">Read Full Report</a></div>
  </div>
  <div class="footer"><p>&copy; 2024 SHOWBAY. All rights reserved.</p></div>
</div>
</body></html>`
    },
    {
      name: 'Educational Content',
      type: 'builder',
      title: 'Master Email Marketing: Free Guide',
      bodyContent: 'Download our comprehensive guide to email marketing success. Learn best practices, advanced techniques, and industry secrets from our expert team.',
      buttonText: 'Download Guide',
      buttonLink: 'https://showbay.io/',
      html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Educational Content</title>
<style>body{font-family:Arial,sans-serif;margin:0;padding:20px;background:#f4f4f4}
.wrapper{max-width:600px;margin:0 auto;background:#fff;border-radius:8px}
.header{background:linear-gradient(135deg,#673ab7 0%,#311b92 100%);color:white;padding:40px;text-align:center}
.header h1{color:#ffffff;margin:0;font-size:28px}
.content{padding:40px}
.content h2{color:#311b92;font-size:24px;margin:0 0 20px}
.content p{color:#333;line-height:1.6;margin:0 0 20px}
.button{text-align:center;margin:30px 0}
.button a{background:linear-gradient(135deg,#673ab7 0%,#311b92 100%);color:white;text-decoration:none;padding:16px 32px;border-radius:8px;font-weight:600;display:inline-block}
.footer{background:#311b92;color:#ede7f6;padding:30px;text-align:center}
</style></head>
<body>
<div class="wrapper">
  <div class="header"><h1>Educational Content</h1></div>
  <div class="content">
    <h2>Master Email Marketing: Free Guide</h2>
    <p>Download our comprehensive guide to email marketing success. Learn best practices, advanced techniques, and industry secrets from our expert team.</p>
    <div class="button"><a href="https://showbay.io/">Download Guide</a></div>
  </div>
  <div class="footer"><p>&copy; 2024 SHOWBAY. All rights reserved.</p></div>
</div>
</body></html>`
    }
])
  .insertMany(templates)
.then(insertedTemplates => {
  console.log(`✅ Successfully added ${insertedTemplates.length} sample templates to the database!`);
  console.log('\n📧 Template Categories Added:');
  console.log('  - Welcome & Onboarding');
  console.log('  - Newsletters');
  console.log('  - Product Launches');
  console.log('  - Event Invitations');
  console.log('  - Holiday & Seasonal');
  console.log('  - Promotions & Sales');
  console.log('  - Customer Engagement');
  console.log('  - Educational Content');
  console.log('  - Corporate Communications');
})
.catch(err => {
  console.error('❌ Error adding templates:', err.message);
})
.finally(() => {
  mongoose.disconnect();
  console.log('\n🎉 Template population complete!');
  console.log('🌐 Check your SHOWBAY application at https://localhost:3000');
});
