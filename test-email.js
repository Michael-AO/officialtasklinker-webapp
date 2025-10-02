// Simple test script to check Brevo email functionality
const { EmailService } = require('./lib/email-service.ts');

async function testEmail() {
  console.log('Testing Brevo email service...');
  
  try {
    const result = await EmailService.sendEmail({
      to: "test@example.com",
      subject: "Test Email from TaskLinkers",
      htmlContent: "<p>This is a test email to verify Brevo integration.</p>"
    });
    
    console.log('Email test result:', result);
  } catch (error) {
    console.error('Email test error:', error);
  }
}

testEmail();
