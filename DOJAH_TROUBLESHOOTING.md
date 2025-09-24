# Dojah Integration Troubleshooting Guide

## 🚨 Quick Diagnosis

### Step 1: Check Browser Console
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for these specific errors:
   - `Dojah is not defined` → Script loading issue
   - `403 Forbidden` → API key or domain whitelist issue
   - `CSP violation` → Content Security Policy blocking
   - `Network error` → Connectivity issue

### Step 2: Check Network Tab
1. Go to Network tab in Developer Tools
2. Refresh the page
3. Look for failed requests to:
   - `https://widget.dojah.io/widget.js` (script loading)
   - `https://api.dojah.io` (API calls)
   - `https://identity.dojah.io` (verification flow)

## 🔧 Common Issues & Solutions

### Issue 1: "Dojah is not defined" Error

**Symptoms:**
- Console shows `Dojah is not defined`
- Widget never loads
- Script loading fails

**Causes:**
1. **Wrong API Keys**: Using production keys in test environment or vice versa
2. **Domain Not Whitelisted**: Your domain isn't approved in Dojah dashboard
3. **CSP Blocking**: Content Security Policy preventing script load
4. **Network Issues**: Script can't reach Dojah servers

**Solutions:**

#### A. Verify API Keys
```bash
# Check your current keys
echo $NEXT_PUBLIC_DOJAH_APP_ID
echo $NEXT_PUBLIC_DOJAH_PUBLIC_KEY
```

**For Development (Test Environment):**
```env
NEXT_PUBLIC_DOJAH_APP_ID=6875f7ffcb4d46700c74336e
NEXT_PUBLIC_DOJAH_PUBLIC_KEY=test_pk_TNoLXCX4T96k0WdbLnFJGYipd
NEXT_PUBLIC_DOJAH_ENVIRONMENT=test
```

**For Production:**
```env
NEXT_PUBLIC_DOJAH_APP_ID=your_production_app_id
NEXT_PUBLIC_DOJAH_PUBLIC_KEY=prod_pk_your_production_key
NEXT_PUBLIC_DOJAH_ENVIRONMENT=production
```

#### B. Whitelist Your Domain
1. Go to [Dojah Test Dashboard](https://test.dojah.io/) (for development)
2. Navigate to Settings → API Keys → Test Keys → Whitelisted Domains
3. Add these domains:
   - `localhost` (for local development)
   - `127.0.0.1` (for local development)
   - `your-production-domain.com` (for production)

#### C. Fix CSP Issues
Update your `next.config.mjs`:
```javascript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.dojah.io https://widget.dojah.io https://identity.dojah.io",
            "connect-src 'self' https://api.dojah.io https://*.dojah.io",
            "frame-src 'self' https://*.dojah.io",
            "img-src 'self' data: blob: https: https://*.dojah.io",
          ].join('; '),
        },
      ],
    },
  ]
}
```

### Issue 2: 403 Forbidden Error

**Symptoms:**
- Network tab shows 403 status for Dojah API calls
- Widget loads but verification fails
- "Access denied" errors

**Causes:**
1. **Invalid API Keys**: Keys are wrong or expired
2. **Domain Not Whitelisted**: Your domain isn't in the approved list
3. **Wrong Environment**: Using test keys in production or vice versa

**Solutions:**
1. **Double-check your API keys** in the Dojah dashboard
2. **Verify domain whitelist** includes your current domain
3. **Check environment** - use test keys for development, production keys for live

### Issue 3: Widget Loads But Verification Fails

**Symptoms:**
- Dojah widget opens successfully
- User can start verification process
- Process fails at some point

**Causes:**
1. **API Rate Limits**: Too many requests
2. **Invalid User Data**: Test data not accepted
3. **Service Unavailable**: Dojah service temporarily down

**Solutions:**
1. **Use valid test data** for development
2. **Check Dojah status** at their status page
3. **Implement proper error handling** in your code

## 🧪 Testing Steps

### 1. Local Development Test
```bash
# Start your development server
npm run dev

# Navigate to test page
http://localhost:3000/test-dojah
```

### 2. Check Configuration
Visit the test page and check:
- ✅ Environment variables are set correctly
- ✅ API keys are valid
- ✅ Domain is whitelisted
- ✅ CSP headers are configured

### 3. Test Widget Loading
1. Open browser console
2. Click "Test Widget" button
3. Check for any errors
4. Verify widget opens

### 4. Test API Connectivity
1. Click "Test Network" button
2. Check for API connectivity errors
3. Verify responses are successful

## 🔍 Debug Tools

### Use the Debug Panel
The test page includes a comprehensive debug panel that shows:
- Current configuration
- SDK availability
- Network connectivity
- CSP status

### Browser Developer Tools
1. **Console**: Check for JavaScript errors
2. **Network**: Monitor API calls and script loading
3. **Application**: Check if scripts are cached properly

### Environment Check
```javascript
// Add this to your component to debug
console.log("🔧 Dojah Debug:", {
  appId: process.env.NEXT_PUBLIC_DOJAH_APP_ID,
  publicKey: process.env.NEXT_PUBLIC_DOJAH_PUBLIC_KEY,
  environment: process.env.NEXT_PUBLIC_DOJAH_ENVIRONMENT,
  hasDojah: typeof window !== 'undefined' && 'Dojah' in window,
  nodeEnv: process.env.NODE_ENV
});
```

## 🚀 Production Deployment Checklist

### Before Deployment:
- [ ] Use production API keys
- [ ] Whitelist production domain in Dojah dashboard
- [ ] Test with production environment
- [ ] Verify CSP headers work in production
- [ ] Check all API endpoints are accessible

### After Deployment:
- [ ] Test verification flow end-to-end
- [ ] Monitor for any CSP violations
- [ ] Check API response times
- [ ] Verify error handling works

## 📞 Getting Help

### Dojah Support:
- **Documentation**: https://docs.dojah.io/
- **Test Dashboard**: https://test.dojah.io/
- **Production Dashboard**: https://dojah.io/

### Common Support Questions:
1. "My widget won't load" → Check API keys and domain whitelist
2. "Getting 403 errors" → Verify credentials and permissions
3. "CSP blocking scripts" → Update Content Security Policy
4. "Widget loads but verification fails" → Check test data and API limits

## 🎯 Success Criteria

Your Dojah integration is working when:
- ✅ Widget loads without JavaScript errors
- ✅ No CSP violations in console
- ✅ API calls return successful responses
- ✅ Verification flow completes successfully
- ✅ Error handling works properly
- ✅ Works in both development and production

---

**Remember**: Always use test credentials for development and production credentials for live deployment!
