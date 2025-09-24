# Admin Verification Quick Reference

**Purpose**: Quick reference for admins managing manual verification  
**For**: Admin team members handling verification queue  

---

## 🚨 Emergency Actions (30 seconds)

### Instant User Verification (Emergency Bypass)
1. Go to `/admin/users`
2. Find user by name/email
3. Click "🚨 Bypass Dojah (Emergency)"
4. User gets instant access ✅

### Database Emergency Override
```sql
-- Verify specific user by email
UPDATE users 
SET dojah_verified = true, 
    verification_type = 'emergency_admin_override',
    updated_at = NOW()
WHERE email = 'user@example.com';

-- Verify all pending users (use carefully)
UPDATE users 
SET dojah_verified = true, 
    verification_type = 'emergency_admin_override',
    updated_at = NOW()
WHERE is_verified = true AND dojah_verified = false;
```

---

## 📋 Daily Verification Workflow

### Morning Routine (10 minutes)
1. **Check Queue**: Go to `/admin/verification`
2. **Sort by Urgency**: Overdue items first (red badges)
3. **Process Overdue**: Handle 24+ hour items immediately
4. **Check SLA**: Monitor 12+ hour items (yellow badges)

### Verification Review Process (2-3 minutes per submission)

#### Quick Approve (High Quality)
1. **Check Documents**: Clear, readable, valid
2. **Set Score**: 85-100 for excellent quality
3. **Click "Approve"** ✅
4. **User Notified**: Automatic email sent

#### Standard Review (Medium Quality)
1. **Review All Images**: Front, back, selfie
2. **Verify Document**: Government-issued, current
3. **Check Quality**: Text readable, no glare
4. **Set Score**: 70-84 for good quality
5. **Add Notes**: Any observations
6. **Click "Approve"** ✅

#### Reject (Poor Quality)
1. **Select Reason**:
   - Poor image quality
   - Document text not readable
   - Document appears expired
   - Invalid document type
   - Missing required information
2. **Add Feedback**: Helpful notes for user
3. **Click "Reject"** ❌
4. **User Notified**: Can resubmit

---

## 🎯 Quality Scoring Guide

| Score | Quality | Action | Criteria |
|-------|---------|--------|----------|
| 90-100 | Excellent | Approve | Perfect clarity, clearly authentic |
| 80-89 | Good | Approve | Minor issues, clearly readable |
| 70-79 | Acceptable | Approve | Some concerns, but verifiable |
| 60-69 | Poor | Review | Quality issues, needs scrutiny |
| <60 | Reject | Reject | Insufficient quality |

---

## 📊 Queue Management

### Priority Levels
- 🔴 **Overdue**: 24+ hours (process immediately)
- 🟡 **Warning**: 12+ hours (process today)
- 🟢 **Normal**: <12 hours (process within SLA)

### Bulk Operations
1. **Select Multiple**: Check boxes for similar cases
2. **Bulk Approve**: For clearly valid submissions
3. **Bulk Reject**: For obviously poor quality
4. **Add Notes**: Include reason for bulk actions

### Search & Filter
- **By Status**: Pending, Approved, Rejected
- **By User**: Name or email search
- **By Date**: Recent submissions
- **By Urgency**: Overdue items first

---

## 🚨 Common Scenarios

### High Volume Day
1. **Prioritize**: Overdue → Warning → Normal
2. **Bulk Process**: Similar quality submissions together
3. **Quick Approve**: Excellent quality submissions
4. **Focus Time**: 2-3 minutes max per review

### User Complaints
1. **Check Status**: Find user in queue
2. **Review Timeline**: How long pending?
3. **Emergency Bypass**: If urgent business need
4. **Communicate**: Update user on status

### Technical Issues
1. **Dojah Down**: Expect manual upload increase
2. **Storage Issues**: Check Supabase storage
3. **System Slow**: Use bulk operations
4. **Contact Support**: Escalate if needed

---

## 📱 User Communication

### Approval Email (Automatic)
```
Subject: ✅ Verification Approved - Full Access Granted

Your identity verification has been approved! 
You now have full access to post tasks and apply for work.
```

### Rejection Email (Automatic)
```
Subject: ❌ Verification Needs Improvement

Your verification was not approved. Reason: [Reason]
Please review the feedback and resubmit with improved documents.
```

### Manual Communication
- **Status Updates**: "Your verification is under review"
- **Timeline Updates**: "Processing within 24 hours"
- **Quality Feedback**: Specific improvement suggestions

---

## 🔧 Technical Quick Fixes

### Can't Access Admin Panel
```sql
-- Check admin status
SELECT user_type FROM users WHERE email = 'admin@example.com';

-- Make user admin
UPDATE users SET user_type = 'admin' WHERE email = 'admin@example.com';
```

### Verification Queue Not Loading
1. **Check Database**: Verify tables exist
2. **Check Permissions**: Admin user type
3. **Clear Cache**: Browser refresh
4. **Check Logs**: Error messages

### Documents Not Displaying
1. **Storage Bucket**: Verify `verification-documents` exists
2. **RLS Policies**: Check storage permissions
3. **File URLs**: Test image access
4. **Network**: Check connectivity

---

## 📈 Performance Targets

### Daily Goals
- **Response Time**: < 24 hours average
- **Processing Rate**: 50+ verifications per hour
- **Approval Rate**: > 85% (quality dependent)
- **Overdue Items**: 0 (process all within SLA)

### Quality Metrics
- **First-Time Approval**: > 70%
- **Rejection Rate**: < 15%
- **Resubmission Rate**: < 20%
- **User Satisfaction**: > 90%

---

## 🆘 Emergency Contacts

### Technical Issues
- **System Admin**: Database/technical problems
- **DevOps**: Deployment/infrastructure issues
- **Support Lead**: User complaint escalation

### Business Issues
- **Manager**: SLA breaches, resource needs
- **CEO**: Critical business impact
- **Legal**: Compliance or audit issues

---

## 📚 Additional Resources

- **Full Documentation**: `VERIFICATION_SYSTEM_USER_GUIDE.md`
- **Technical Guide**: `TASKLINKER_PLATFORM_OVERVIEW.md`
- **Deployment Guide**: `SUPABASE_DEPLOYMENT.md`
- **CEO Brief**: `MANUAL_VERIFICATION_SYSTEM_CEO_BRIEF.md`

---

**This quick reference covers the essential admin tasks for manual verification management. Keep this handy for daily operations!**
