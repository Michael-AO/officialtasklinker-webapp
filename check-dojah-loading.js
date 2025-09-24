// Simple test to see if Dojah SDK can load
const https = require('https');

console.log('🔍 Testing Dojah SDK loading...');

// Test 1: Check if CORRECT CDN is accessible
https.get('https://widget.dojah.io/dojah-widget.js', (res) => {
  console.log('📦 CDN Status:', res.statusCode);
  if (res.statusCode === 200) {
    console.log('✅ Dojah CDN is accessible');
  } else {
    console.log('❌ Dojah CDN access issue:', res.statusCode);
  }
}).on('error', (err) => {
  console.log('❌ Network error accessing Dojah CDN:', err.message);
});

// Test 2: Check API connectivity
const req = https.request({
  hostname: 'api.dojah.io',
  path: '/api/v1/kyc/bvn',
  method: 'GET',
  headers: {
    'AppId': process.env.NEXT_PUBLIC_DOJAH_APP_ID || 'test',
    'Authorization': process.env.NEXT_PUBLIC_DOJAH_PUBLIC_KEY || 'test',
  }
}, (res) => {
  console.log('🌐 API Status:', res.statusCode);
});

req.on('error', (err) => {
  console.log('🌐 API Connection error:', err.message);
});

req.end();

// Test 3: Check environment variables
console.log('\n🔧 Environment Variables:');
console.log('APP_ID:', process.env.NEXT_PUBLIC_DOJAH_APP_ID ? 'SET' : 'MISSING');
console.log('PUBLIC_KEY:', process.env.NEXT_PUBLIC_DOJAH_PUBLIC_KEY ? 'SET' : 'MISSING');
