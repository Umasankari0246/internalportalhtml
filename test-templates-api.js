const mongoose = require('mongoose');
const Template = require('./models/Template');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/showbay', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB for testing templates API...');
  
  // Test fetching templates like the API would
  return Template.find().sort({ createdAt: -1 });
})
.then(templates => {
  console.log(`Found ${templates.length} templates in database:`);
  
  templates.forEach((template, index) => {
    console.log(`${index + 1}. ${template.name} (${template.type})`);
    console.log(`   ID: ${template._id}`);
    console.log(`   Created: ${template.createdAt}`);
    console.log(`   Has HTML: ${template.html ? 'Yes' : 'No'}`);
    console.log('');
  });
  
  // Test the API response format
  const apiResponse = {
    templates: templates.map(t => ({
      _id: t._id,
      name: t.name,
      type: t.type,
      title: t.title,
      createdAt: t.createdAt
    })),
    total: templates.length,
    page: 1,
    pages: Math.ceil(templates.length / 50)
  };
  
  console.log('API Response Format:');
  console.log(JSON.stringify(apiResponse, null, 2));
})
.catch(err => {
  console.error('Error:', err.message);
})
.finally(() => {
  mongoose.disconnect();
  console.log('Test complete');
});
