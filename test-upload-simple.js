const http = require('http');
const fs = require('fs');
const path = require('path');

// Create a simple test image
const testImagePath = path.join(__dirname, 'test-upload.jpg');
const testContent = Buffer.from('fake-image-content-for-testing');
fs.writeFileSync(testImagePath, testContent);

// Read the file
const fileContent = fs.readFileSync(testImagePath);

// Create multipart form data boundary
const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';

// Build the multipart form data
let formData = `--${boundary}\r\n`;
formData += `Content-Disposition: form-data; name="image"; filename="test.jpg"\r\n`;
formData += `Content-Type: image/jpeg\r\n\r\n`;
formData += fileContent.toString('base64');
formData += `\r\n--${boundary}--\r\n`;

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/templates/upload-image',
  method: 'POST',
  headers: {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'Content-Length': Buffer.byteLength(formData)
  }
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
    
    // Clean up
    fs.unlinkSync(testImagePath);
    console.log('Test completed');
  });
});

req.on('error', (err) => {
  console.error('Error:', err.message);
  fs.unlinkSync(testImagePath);
});

req.write(formData);
req.end();
