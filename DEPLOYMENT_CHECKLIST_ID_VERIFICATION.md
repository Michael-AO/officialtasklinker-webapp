# 🚀 ID Verification Feature Deployment Checklist

## 📋 Pre-Deployment Checklist

### ✅ Database Migration
- [ ] **Run migration script**: `migration-id-verification-feature.sql`
- [ ] **Verify migration success**: Check that all 70 existing users are marked as `dojah_verified = FALSE`
- [ ] **Confirm indexes created**: `idx_users_dojah_verified`, `idx_users_verification_type`
- [ ] **Test rollback plan**: Ensure migration can be safely rolled back if needed

### ✅ Code Review
- [ ] **Sidebar restrictions**: Verify "Browse Tasks", "Applications", "Post New Task", "Find Work" are disabled for unverified users
- [ ] **Dashboard cards**: Confirm email verification and ID verification cards display correctly
- [ ] **User type handling**: Ensure both clients and freelancers are treated equally for verification
- [ ] **Test mode**: Verify test verification works without Dojah SDK

### ✅ Environment Variables
- [ ] **Production environment**: Ensure all required env vars are set
- [ ] **Database connection**: Verify Supabase connection is stable
- [ ] **Email service**: Confirm email verification still works

### ✅ Testing
- [ ] **New user flow**: Sign up → Email verify → Dashboard → ID verify → Full access
- [ ] **Existing user flow**: Login → Dashboard → ID verify → Full access
- [ ] **Sidebar restrictions**: Verify disabled items show shield icon and proper tooltip
- [ ] **Dashboard cards**: Test both email and ID verification cards
- [ ] **User type scenarios**: Test both client and freelancer flows

## 🚀 Deployment Steps

### 1. Database Migration (Critical - Run First)
```sql
-- Execute in Supabase SQL Editor
-- File: migration-id-verification-feature.sql
```

### 2. Code Deployment
- [ ] **Deploy to staging**: Test all flows in staging environment
- [ ] **Deploy to production**: Deploy code changes
- [ ] **Monitor logs**: Watch for any errors during deployment

### 3. Post-Deployment Verification
- [ ] **Check existing users**: Verify all 70 users are marked as unverified
- [ ] **Test new user signup**: Complete end-to-end flow
- [ ] **Test existing user login**: Verify they see ID verification requirement
- [ ] **Monitor error rates**: Check for any 500 errors or database issues

## 🔍 Monitoring & Alerts

### Key Metrics to Monitor
- [ ] **User verification completion rate**
- [ ] **Error rates on verification endpoints**
- [ ] **Database performance** (new indexes)
- [ ] **User engagement** (sidebar usage patterns)

### Alerts to Set Up
- [ ] **High error rate** on `/api/verification/process-dojah`
- [ ] **Database connection issues**
- [ ] **Migration rollback** (if needed)

## 🛡️ Rollback Plan

### If Issues Arise
1. **Database rollback**:
   ```sql
   -- Remove new columns (if needed)
   ALTER TABLE users DROP COLUMN IF EXISTS dojah_verified;
   ALTER TABLE users DROP COLUMN IF EXISTS verification_type;
   ```

2. **Code rollback**: Revert to previous deployment
3. **User communication**: Inform users about temporary feature unavailability

## 📊 Success Metrics

### Week 1 Post-Deployment
- [ ] **Zero critical errors** in production
- [ ] **All existing users** can still access basic features
- [ ] **New users** complete verification flow successfully
- [ ] **Sidebar restrictions** working as expected

### Week 2 Post-Deployment
- [ ] **User adoption rate** of ID verification
- [ ] **Support ticket volume** related to verification
- [ ] **Performance impact** assessment

## 📝 User Communication

### Pre-Deployment
- [ ] **Internal team notification** about new feature
- [ ] **Support team training** on verification process

### Post-Deployment
- [ ] **User notification** about new verification requirement
- [ ] **Help documentation** update
- [ ] **FAQ updates** for common questions

## 🔧 Configuration

### Feature Flags (Optional)
- [ ] **Enable/disable** ID verification requirement
- [ ] **Test mode** toggle for development
- [ ] **Admin bypass** for testing

### Environment-Specific Settings
- [ ] **Staging**: Test mode enabled
- [ ] **Production**: Real Dojah integration
- [ ] **Development**: Test mode enabled

---

## ✅ Final Deployment Checklist

### Before Going Live
- [ ] **All tests passing** in staging
- [ ] **Database migration** completed successfully
- [ ] **Monitoring** set up and active
- [ ] **Rollback plan** documented and tested
- [ ] **Team notification** sent
- [ ] **Support team** briefed

### Go-Live
- [ ] **Deploy to production**
- [ ] **Monitor for 30 minutes** post-deployment
- [ ] **Test critical user flows**
- [ ] **Verify existing users** can still access basic features

### Post-Go-Live
- [ ] **Monitor for 24 hours**
- [ ] **Check user feedback**
- [ ] **Address any issues** immediately
- [ ] **Document lessons learned**

---

**Deployment Date**: ___________  
**Deployed By**: ___________  
**Status**: ___________  
**Notes**: ___________
