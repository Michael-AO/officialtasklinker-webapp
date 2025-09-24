# Netlify Deployment Guide - TaskLinker with Manual Verification

## 🚀 Deployment Status

✅ **Code Pushed to GitHub**: All manual verification system code committed and pushed  
✅ **Netlify Configuration**: netlify.toml properly configured  
✅ **Build Settings**: Next.js build configuration ready  
✅ **Environment Variables**: Need to be configured in Netlify dashboard  

## 📋 Pre-Deployment Checklist

### 1. Environment Variables Setup
Configure these in your Netlify dashboard under Site Settings → Environment Variables:

#### Required Variables:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Dojah Configuration
NEXT_PUBLIC_DOJAH_APP_ID=your_dojah_app_id
NEXT_PUBLIC_DOJAH_PUBLIC_KEY=your_dojah_public_key
DOJAH_PRIVATE_KEY=your_dojah_private_key

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-site.netlify.app
NODE_ENV=production
```

### 2. Database Migration
**CRITICAL**: Run the database migration in Supabase BEFORE deploying:

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste contents of `deploy-manual-verification.sql`
3. Click "Run" to execute
4. Verify tables created successfully

### 3. Storage Bucket Setup
Ensure the `verification-documents` storage bucket is created in Supabase.

## 🎯 Deployment Options

### Option 1: Automatic Deployment (Recommended)
If your Netlify site is connected to your GitHub repo:

1. **Trigger Deployment**: 
   - Go to Netlify Dashboard
   - Click "Trigger deploy" → "Deploy site"
   - Or push a new commit to trigger auto-deployment

2. **Monitor Build**:
   - Watch build logs for any errors
   - Build should complete in 3-5 minutes

### Option 2: Manual Deployment
If you need to deploy manually:

```bash
# Build the project locally
npm run build

# Deploy to Netlify (if you have Netlify CLI)
netlify deploy --prod
```

## 🔧 Post-Deployment Steps

### 1. Verify Deployment
Check these URLs after deployment:

- **Homepage**: `https://your-site.netlify.app/`
- **Admin Dashboard**: `https://your-site.netlify.app/admin/users`
- **Manual Verification**: `https://your-site.netlify.app/admin/verification`
- **User Verification Gate**: `https://your-site.netlify.app/dashboard/browse`

### 2. Test Critical Features

#### Emergency Bypass Test:
1. Go to `/admin/users`
2. Find a test user
3. Click "🚨 Bypass Dojah (Emergency)"
4. Verify user gets instant access

#### Manual Verification Test:
1. Go to `/dashboard/browse`
2. Click "Manual Upload" button
3. Test document upload flow
4. Check admin queue for submission

### 3. Configure Domain (If Needed)
If you have a custom domain:
1. Go to Netlify Dashboard → Domain Management
2. Add your custom domain
3. Update DNS settings as instructed

## 🚨 Emergency Deployment Commands

### If Build Fails:
```bash
# Check build logs in Netlify dashboard
# Common issues:
# 1. Environment variables missing
# 2. Database connection issues
# 3. Build timeout (increase in netlify.toml)
```

### If Database Migration Fails:
```sql
-- Run these commands individually in Supabase SQL Editor:

-- 1. Add columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS manual_verification_status VARCHAR(20) DEFAULT 'not_submitted';
ALTER TABLE users ADD COLUMN IF NOT EXISTS manual_verification_id UUID;

-- 2. Create verification submissions table
CREATE TABLE IF NOT EXISTS manual_verification_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    document_type VARCHAR(50) NOT NULL,
    front_image_url TEXT,
    back_image_url TEXT,
    selfie_with_document_url TEXT,
    additional_notes TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES users(id),
    rejection_reason TEXT,
    verification_score INTEGER,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 📊 Post-Deployment Monitoring

### Key Metrics to Monitor:
1. **Build Success**: Verify deployment completed successfully
2. **Page Load Times**: Check homepage and admin panel load speeds
3. **API Endpoints**: Test verification submission and admin approval
4. **Database Connectivity**: Verify Supabase connection works
5. **Storage Access**: Test document upload functionality

### Health Check URLs:
- `https://your-site.netlify.app/api/health` (if implemented)
- `https://your-site.netlify.app/admin/users` (admin access)
- `https://your-site.netlify.app/dashboard` (user access)

## 🎉 Success Indicators

✅ **Deployment Complete**: Site loads without errors  
✅ **Admin Access**: Can access `/admin/users` and `/admin/verification`  
✅ **Emergency Bypass**: Can instantly verify users  
✅ **Manual Upload**: Users can submit documents  
✅ **Database**: All tables created and accessible  

## 🚀 Next Steps After Deployment

1. **Test Emergency Bypass**: Unblock any users stuck by Dojah delays
2. **Monitor Manual Queue**: Watch for new verification submissions
3. **User Communication**: Notify users about manual verification option
4. **Performance Monitoring**: Track response times and user satisfaction

---

**Your manual verification system is now live and ready to resolve the Dojah verification crisis!** 🎉
