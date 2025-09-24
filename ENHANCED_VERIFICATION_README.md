# Enhanced ID Verification System

A comprehensive identity verification solution built on top of Dojah's API with enhanced user experience, better error handling, and seamless integration.

## 🚀 Features

### Core Functionality
- **Multi-step Verification Process**: Guided verification with clear progress tracking
- **Real-time Validation**: Instant feedback on form inputs and requirements
- **Dual Verification Types**: Support for both individual and business verification
- **Enhanced Error Handling**: Comprehensive error messages and recovery options
- **Progress Tracking**: Visual progress indicators and step-by-step guidance
- **Secure Integration**: Built on Dojah's secure verification platform

### User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Accessibility**: Built with accessibility best practices
- **Toast Notifications**: Clear feedback for all user actions
- **Loading States**: Visual feedback during API calls and processing
- **Status Indicators**: Clear visual representation of verification progress

## 🏗️ Architecture

### Components
```
components/
├── enhanced-id-verification.tsx    # Main verification component
├── dojah-modal.tsx                 # Dojah integration modal
└── ui/                            # Reusable UI components
    ├── button.tsx
    ├── card.tsx
    ├── input.tsx
    ├── select.tsx
    ├── progress.tsx
    └── badge.tsx
```

### API Routes
```
app/api/verification/
├── enhanced-dojah/
│   ├── route.ts                    # Enhanced verification processing
│   └── GET                         # Status checking
└── process-dojah/
    └── route.ts                    # Legacy verification processing
```

### Hooks
```
hooks/
├── use-enhanced-verification.ts    # Verification state management
├── use-dojah-modal.ts             # Dojah modal management
├── use-dojah-script.ts            # Dojah SDK loading
└── use-toast.ts                   # Toast notifications
```

## 📱 Pages

### Main Verification Page
- **Route**: `/dashboard/verification/enhanced`
- **Component**: `EnhancedVerificationPage`
- **Features**: Status checking, verification form, success state

### Demo Page
- **Route**: `/demo/enhanced-verification`
- **Component**: `EnhancedVerificationDemoPage`
- **Features**: Live demo, feature showcase, documentation

## 🔧 Installation & Setup

### 1. Dependencies
```bash
npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-progress
npm install lucide-react
```

### 2. Environment Variables
```env
NEXT_PUBLIC_DOJAH_APP_ID=your_app_id
NEXT_PUBLIC_DOJAH_PUBLIC_KEY=your_public_key
NEXT_PUBLIC_DOJAH_ENVIRONMENT=production
```

### 3. Database Schema
Ensure your `users` table has the following columns:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS dojah_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_type VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'unverified';
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_verification_attempt TIMESTAMP;
```

## 🎯 Usage

### Basic Implementation
```tsx
import { EnhancedIdVerification } from '@/components/enhanced-id-verification'

export default function VerificationPage() {
  return (
    <div className="container mx-auto py-8">
      <EnhancedIdVerification />
    </div>
  )
}
```

### With Custom Hook
```tsx
import { useEnhancedVerification } from '@/hooks/use-enhanced-verification'

export default function CustomVerificationPage() {
  const {
    verificationData,
    updateVerificationData,
    validatePersonalInfo,
    processVerification
  } = useEnhancedVerification()

  const handleSubmit = async () => {
    if (validatePersonalInfo()) {
      const success = await processVerification(dojahResult, 'identity')
      if (success) {
        // Handle success
      }
    }
  }

  return (
    // Your custom UI
  )
}
```

## 🔌 API Integration

### Process Verification
```typescript
POST /api/verification/enhanced-dojah

{
  "dojahResult": {
    "event": "successful",
    "data": { ... }
  },
  "verificationData": {
    "firstName": "John",
    "lastName": "Doe",
    "idNumber": "123456789",
    "idType": "nin",
    "dateOfBirth": "1990-01-01",
    "nationality": "Nigerian"
  },
  "verificationType": "identity",
  "metadata": {
    "processedAt": "2024-01-01T00:00:00Z",
    "source": "enhanced-verification"
  }
}
```

### Check Status
```typescript
GET /api/verification/enhanced-dojah

Response:
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "verification_status": {
      "dojah_verified": true,
      "verification_type": "identity",
      "verification_status": "verified",
      "verified_at": "2024-01-01T00:00:00Z"
    },
    "latest_request": {
      "id": "uuid",
      "status": "approved",
      "verification_type": "identity",
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

## 🎨 Customization

### Styling
The component uses Tailwind CSS classes and can be customized by:
- Modifying the component's className props
- Overriding Tailwind classes in your CSS
- Using CSS modules or styled-components

### Validation Rules
Customize validation by modifying the `validatePersonalInfo` function:
```tsx
const validatePersonalInfo = (): boolean => {
  // Add your custom validation logic
  if (verificationData.idNumber.length < 10) {
    toast({
      title: "Invalid ID Number",
      description: "ID number must be at least 10 characters",
      variant: "destructive"
    })
    return false
  }
  return true
}
```

### Verification Steps
Modify the verification steps by updating the `verificationSteps` array:
```tsx
const verificationSteps: VerificationStep[] = [
  {
    id: 'custom-step',
    title: 'Custom Step',
    description: 'Your custom verification step',
    icon: <CustomIcon className="h-5 w-5" />,
    status: 'pending',
    required: true
  }
]
```

## 🧪 Testing

### Test Routes
- `/test-dojah` - Basic Dojah integration test
- `/demo/enhanced-verification` - Enhanced verification demo

### Testing Checklist
- [ ] Form validation works correctly
- [ ] Dojah modal opens and functions
- [ ] API calls succeed/fail appropriately
- [ ] Error handling displays correct messages
- [ ] Progress tracking updates correctly
- [ ] Mobile responsiveness works
- [ ] Accessibility features function

## 🚨 Error Handling

### Common Errors
1. **Missing Required Fields**: Form validation prevents submission
2. **Dojah SDK Loading**: Automatic retry with user feedback
3. **API Failures**: Graceful degradation with retry options
4. **Network Issues**: Offline detection and recovery

### Error Recovery
- Automatic retry for transient failures
- Clear error messages with actionable steps
- Fallback options when primary methods fail
- User-friendly error descriptions

## 🔒 Security

### Data Protection
- No sensitive data stored in client-side state
- All API calls use authenticated sessions
- Input sanitization and validation
- Secure communication with Dojah API

### Privacy Compliance
- GDPR-compliant data handling
- User consent for verification
- Data retention policies
- Right to deletion support

## 📊 Performance

### Optimization Features
- Lazy loading of Dojah SDK
- Efficient state management
- Minimal re-renders
- Optimized bundle size

### Monitoring
- Performance metrics tracking
- Error rate monitoring
- User experience analytics
- API response time tracking

## 🔄 Migration from Legacy

### Step-by-Step Migration
1. **Install Dependencies**: Add required packages
2. **Update Database**: Add new columns to users table
3. **Replace Components**: Swap old verification components
4. **Update API Calls**: Use new enhanced endpoints
5. **Test Integration**: Verify functionality works correctly

### Breaking Changes
- New API endpoint structure
- Different response format
- Enhanced error handling
- Additional validation rules

## 🤝 Contributing

### Development Setup
```bash
git clone <repository>
cd tl-app
npm install
npm run dev
```

### Code Style
- Use TypeScript for all new code
- Follow existing component patterns
- Include proper error handling
- Add comprehensive documentation

### Testing
- Test all verification flows
- Verify mobile responsiveness
- Check accessibility compliance
- Validate error scenarios

## 📚 Additional Resources

### Documentation
- [Dojah API Documentation](https://docs.dojah.io/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/)

### Support
- Create issues for bugs or feature requests
- Check existing documentation and examples
- Review troubleshooting guides
- Contact development team

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Dojah team for the verification API
- Next.js team for the framework
- Radix UI team for the components
- Tailwind CSS team for the styling framework
