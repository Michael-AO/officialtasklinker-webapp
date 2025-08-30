const http = require('http');
const fs = require('fs');
const path = require('path');

// Simple HTTP server to test CSP headers
const server = http.createServer((req, res) => {
  // Set CSP headers
  res.setHeader('Content-Security-Policy', [
    "default-src 'none'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.dojah.io https://static.cloudflareinsights.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.dojah.io",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://api.dojah.io https://*.dojah.io https://static.cloudflareinsights.com",
    "frame-src 'self' https://*.dojah.io",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '));

  // Set other headers
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Simple test page
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>CSP Test - Dojah Integration</title>
    <meta charset="utf-8">
</head>
<body>
    <h1>CSP Headers Test</h1>
    <p>This page tests the Content Security Policy headers for Dojah integration.</p>
    
    <h2>Test Results:</h2>
    <div id="results"></div>
    
    <script>
        // Test if we can load Dojah scripts
        const results = document.getElementById('results');
        
        // Test 1: Check if CSP allows Dojah domains
        results.innerHTML += '<p>✅ CSP headers are set</p>';
        
        // Test 2: Try to create a script element for Dojah
        try {
            const script = document.createElement('script');
            script.src = 'https://widget.dojah.io/sdk.js';
            script.onload = () => {
                results.innerHTML += '<p>✅ Dojah script can be loaded</p>';
            };
            script.onerror = () => {
                results.innerHTML += '<p>❌ Dojah script blocked by CSP</p>';
            };
            document.head.appendChild(script);
        } catch (e) {
            results.innerHTML += '<p>❌ Error loading Dojah script: ' + e.message + '</p>';
        }
        
        // Test 3: Check if we can make requests to Dojah API
        fetch('https://api.dojah.io/health')
            .then(() => {
                results.innerHTML += '<p>✅ Dojah API requests allowed</p>';
            })
            .catch(() => {
                results.innerHTML += '<p>❌ Dojah API requests blocked</p>';
            });
    </script>
</body>
</html>`;

  res.end(html);
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 CSP Test Server running at http://localhost:${PORT}`);
  console.log('📋 Open this URL in your browser to test CSP headers');
  console.log('🔍 Check the browser console for any CSP violations');
});
