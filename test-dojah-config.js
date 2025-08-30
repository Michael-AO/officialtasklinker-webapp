// Test Dojah Configuration
console.log('🔍 Testing Dojah Configuration...');

// Check environment variables
const appId = process.env.NEXT_PUBLIC_DOJAH_APP_ID || "6875f7ffcb4d46700c74336e";
const publicKey = process.env.NEXT_PUBLIC_DOJAH_PUBLIC_KEY || "prod_pk_deSgNF4R6LJVWU29lSfZ41aW4";

console.log('📋 Dojah Config:');
console.log('- App ID:', appId);
console.log('- Public Key:', publicKey);
console.log('- Environment:', process.env.NEXT_PUBLIC_DOJAH_ENVIRONMENT || 'not set');

// Test API connectivity
async function testDojahAPI() {
  try {
    console.log('🌐 Testing Dojah API connectivity...');
    
    // Test basic API endpoint
    const response = await fetch('https://api.dojah.io/api/v1/kyc/nin_verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicKey}`,
        'AppId': appId
      },
      body: JSON.stringify({
        nin: '12345678901' // Test NIN
      })
    });
    
    console.log('📡 API Response Status:', response.status);
    console.log('📡 API Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Test Successful:', data);
    } else {
      const error = await response.text();
      console.log('❌ API Test Failed:', error);
    }
  } catch (error) {
    console.log('❌ API Test Error:', error.message);
  }
}

// Test widget script loading
function testWidgetScript() {
  console.log('📜 Testing Dojah widget script...');
  
  const script = document.createElement('script');
  script.src = 'https://widget.dojah.io/widget.js';
  script.onload = () => {
    console.log('✅ Widget script loaded successfully');
  };
  script.onerror = () => {
    console.log('❌ Widget script failed to load');
  };
  
  document.head.appendChild(script);
}

// Run tests
if (typeof window !== 'undefined') {
  // Browser environment
  testWidgetScript();
} else {
  // Node.js environment
  testDojahAPI();
}

console.log('🔍 Dojah configuration test completed');
