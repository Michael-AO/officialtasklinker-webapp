# Dojah Integration Guide - Senior Engineer Analysis

## 🎯 **Understanding the Dojah Integration Issues**

### **1. Test API vs Production API Limitations**

#### **Test API Keys (Current Setup)**
```javascript
appID: "6875f7ffcb4d46700c74336e"
publicKey: "test_pk_TNoLXCX4T96k0WdbLnFJGYipd"
```

**Limitations:**
- ❌ **Limited Functionality**: Test keys often have restricted features
- ❌ **No Real Verification**: Won't show full workflow
- ❌ **Widget Restrictions**: May not display complete UI
- ❌ **Callback Limitations**: May not trigger all events

#### **Production API Keys (Recommended)**
```javascript
appID: "your_production_app_id"
publicKey: "your_production_public_key"
```

**Benefits:**
- ✅ **Full Functionality**: Complete verification workflow
- ✅ **Real Verification**: Actual document processing
- ✅ **Complete UI**: Full widget interface
- ✅ **All Callbacks**: Proper event handling

### **2. Widget Loading Issues Analysis**

#### **Current Error Pattern:**
```
[DojahModal] Loading Dojah script...
[DojahModal] Dojah script loaded successfully
[DojahModal] Dojah not available or modal not open
```

#### **Root Causes:**

1. **Timing Issues**
   - Script loads but modal not fully rendered
   - Container element not yet in DOM
   - React state not synchronized

2. **Container Issues**
   - `dojah-widget-container` not found
   - Modal not fully open when initialization attempted
   - CSS/display issues preventing container rendering

3. **API Key Issues**
   - Test keys may have initialization restrictions
   - Network/CORS issues with test environment
   - Authentication problems

## 🛠️ **Senior Engineer Solutions**

### **Solution 1: Enhanced Initialization Logic**

```typescript
const initializeDojah = () => {
  // 1. Check all prerequisites
  if (!(window as any).Dojah || !open) {
    console.warn("[DojahModal] Prerequisites not met")
    return
  }

  // 2. Wait for container with retry logic
  const container = document.getElementById("dojah-widget-container")
  if (!container) {
    console.warn("[DojahModal] Container not found, retrying...")
    setTimeout(() => initializeDojah(), 100)
    return
  }

  // 3. Ensure modal is fully rendered
  const modal = document.querySelector('[data-state="open"]')
  if (!modal) {
    console.warn("[DojahModal] Modal not fully open, retrying...")
    setTimeout(() => initializeDojah(), 100)
    return
  }

  // 4. Initialize with proper error handling
  try {
    const config = {
      appID: process.env.NEXT_PUBLIC_DOJAH_APP_ID || "6875f7ffcb4d46700c74336e",
      publicKey: process.env.NEXT_PUBLIC_DOJAH_PUBLIC_KEY || "test_pk_TNoLXCX4T96k0WdbLnFJGYipd",
      type: "custom",
      containerID: "dojah-widget-container",
      config: {
        pages: verificationType === "business" 
          ? ["government-data", "selfie", "business"] 
          : ["government-data", "selfie"],
      },
      callback: (result: any) => {
        console.log("[DojahModal] Callback:", result)
        if (result?.event === "successful") {
          onSuccess?.(result)
          onOpenChange(false)
        }
      },
      onClose: () => {
        console.log("[DojahModal] Widget closed")
        onClose?.()
        onOpenChange(false)
      },
    }

    ;(window as any).Dojah.init(config)
    console.log("[DojahModal] Widget initialized successfully")
  } catch (error) {
    console.error("[DojahModal] Initialization failed:", error)
    setError("Failed to initialize verification widget")
  }
}
```

### **Solution 2: Environment-Based Configuration**

```typescript
// .env.local
NEXT_PUBLIC_DOJAH_APP_ID=your_production_app_id
NEXT_PUBLIC_DOJAH_PUBLIC_KEY=your_production_public_key
NEXT_PUBLIC_DOJAH_ENVIRONMENT=production

// .env.development
NEXT_PUBLIC_DOJAH_APP_ID=6875f7ffcb4d46700c74336e
NEXT_PUBLIC_DOJAH_PUBLIC_KEY=test_pk_TNoLXCX4T96k0WdbLnFJGYipd
NEXT_PUBLIC_DOJAH_ENVIRONMENT=test
```

### **Solution 3: Comprehensive Debugging System**

The debug panel provides:
- Real-time status monitoring
- Detailed error logging
- API configuration validation
- Widget initialization testing
- Troubleshooting guidance

## 🔍 **Testing Strategy**

### **Phase 1: Debug Current Setup**
1. Use debug panel to identify exact issues
2. Check script loading status
3. Verify container existence
4. Test initialization manually

### **Phase 2: Test with Production Keys**
1. Get production API keys from Dojah
2. Update environment variables
3. Test full verification workflow
4. Validate all callbacks

### **Phase 3: Production Deployment**
1. Configure production environment
2. Test with real documents
3. Monitor verification success rates
4. Implement error handling

## 🚀 **Recommended Next Steps**

### **Immediate Actions:**
1. **Use Debug Panel**: Open verification page and use debug panel
2. **Check Status**: Click "Check Status" to see current state
3. **Test Init**: Click "Test Init" to manually test initialization
4. **Monitor Logs**: Watch debug logs for detailed information

### **For Full Testing:**
1. **Get Production Keys**: Contact Dojah for production API keys
2. **Update Environment**: Add production keys to `.env.local`
3. **Test Complete Flow**: Verify full verification process
4. **Monitor Performance**: Track success rates and errors

### **For Production:**
1. **Environment Setup**: Configure production environment variables
2. **Error Handling**: Implement comprehensive error handling
3. **Monitoring**: Add logging and monitoring
4. **Documentation**: Create user guides and troubleshooting docs

## 📊 **Expected Results**

### **With Test Keys:**
- ✅ Script loads successfully
- ✅ Widget may initialize (with limitations)
- ❌ Full verification workflow may not work
- ❌ Some features may be restricted

### **With Production Keys:**
- ✅ Complete widget functionality
- ✅ Full verification workflow
- ✅ Real document processing
- ✅ All callbacks and events
- ✅ Production-ready integration

## 🎯 **Key Takeaways**

1. **Test API Limitations**: Test keys have restricted functionality
2. **Timing is Critical**: Widget initialization requires proper timing
3. **Container Dependency**: Widget needs container to exist
4. **Production Keys Required**: For full testing and production use
5. **Debugging Essential**: Use debug tools to identify issues

The debug panel will help you identify exactly where the issue is occurring and whether it's related to test API limitations or technical implementation issues.
