const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const http = require('http');

// Create a simple test image file
const testImagePath = path.join(__dirname, 'test-image.jpg');
const testImageContent = Buffer.from('/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A');

fs.writeFileSync(testImagePath, testImageContent);

// Test the image upload endpoint
const form = new FormData();
form.append('image', fs.createReadStream(testImagePath));

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/templates/upload-image',
  method: 'POST',
  headers: form.getHeaders()
};

const req = http.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    
    // Clean up test file
    fs.unlinkSync(testImagePath);
    console.log('Test completed');
  });
});

req.on('error', (err) => {
  console.error('Error:', err.message);
  fs.unlinkSync(testImagePath);
});

form.pipe(req);
