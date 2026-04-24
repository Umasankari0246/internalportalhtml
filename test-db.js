const mongoose = require('mongoose');
const Contact = require('./models/Contact');
const Template = require('./models/Template');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/showbay', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB for testing...');
  
  // Test creating a contact
  const testContact = new Contact({
    name: 'Test User',
    email: 'test@example.com',
    company: 'Test Company',
    phone: '123-456-7890',
    tags: ['test', 'sample']
  });
  
  return testContact.save();
})
.then(contact => {
  console.log('✅ Contact created successfully:', contact.name);
  
  // Test creating a template
  const testTemplate = new Template({
    name: 'Test Template',
    type: 'builder',
    title: 'Test Email',
    bodyContent: 'This is a test email template',
    buttonText: 'Click Here',
    buttonLink: 'https://example.com',
    html: '<h1>Test Template</h1><p>This is a test</p>'
  });
  
  return testTemplate.save();
})
.then(template => {
  console.log('✅ Template created successfully:', template.name);
  
  // Test fetching data
  return Promise.all([
    Contact.find(),
    Template.find()
  ]);
})
.then(([contacts, templates]) => {
  console.log('✅ Contacts in database:', contacts.length);
  console.log('✅ Templates in database:', templates.length);
  
  contacts.forEach(contact => {
    console.log(`  - ${contact.name} (${contact.email})`);
  });
  
  templates.forEach(template => {
    console.log(`  - ${template.name} (${template.type})`);
  });
  
  console.log('\n🎉 Database operations working correctly!');
})
.catch(err => {
  console.error('❌ Error:', err.message);
})
.finally(() => {
  mongoose.disconnect();
  console.log('Disconnected from MongoDB');
});
