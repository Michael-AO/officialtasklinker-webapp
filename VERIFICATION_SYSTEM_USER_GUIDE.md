# Verification System - User & Admin Guide

**Purpose**: Complete guide for user verification to post tasks and admin manual verification management  
**Version**: 2.0 (Manual Verification Integration)  
**Last Updated**: January 27, 2025  

---

## Table of Contents

1. [User Verification Guide](#user-verification-guide)
2. [Admin Manual Verification Guide](#admin-manual-verification-guide)
3. [Emergency Procedures](#emergency-procedures)
4. [Troubleshooting](#troubleshooting)

---

## User Verification Guide

### Why Verification is Required

To post tasks on TaskLinker, you need to complete identity verification. This ensures:
- **Platform Security**: Only verified users can post projects
- **Payment Protection**: Secure transactions between verified parties
- **Quality Assurance**: Maintain high standards in the marketplace

### Verification Requirements

#### For Task Posting:
- ✅ **Email Verification** (Step 1)
- ✅ **Identity Verification** (Step 2) - Choose one:
  - **Dojah Verification** (2-5 minutes, automated)
  - **Manual Document Upload** (24-hour admin review)

### Step-by-Step Verification Process

#### Step 1: Email Verification
1. **Register Account** with your email address
2. **Check Email** for verification code (6-digit number)
3. **Enter Code** on verification page
4. **Email Verified** ✅ - You can now browse the platform

#### Step 2: Identity Verification (Required for Task Posting)

When you try to post a task, you'll see two verification options:

##### Option A: Dojah Verification (Recommended)
**Time**: 2-5 minutes  
**Process**: Automated document scanning

1. **Click "Start Dojah Verification"**
2. **Choose Document Type**:
   - National ID Card
   - Voter's Card
   - Driver's License
   - Passport
3. **Follow Instructions**:
   - Take clear photo of document
   - Take selfie with document
   - Wait for automated verification
4. **Verification Complete** ✅ - Full access granted

##### Option B: Manual Document Upload (Backup)
**Time**: 24 hours (admin review)  
**Process**: Document upload and admin review

1. **Click "Manual Upload"**
2. **Select Document Type**:
   - National ID Card
   - Voter's Card  
   - Driver's License
   - Passport
   - Other Government ID

3. **Upload Required Documents**:
   - **Front Image**: Clear photo of document front
   - **Back Image**: Clear photo of document back (if applicable)
   - **Selfie**: Photo of yourself holding the document

4. **Quality Requirements**:
   - All text must be clearly readable
   - No glare or reflections
   - Document must be valid and not expired
   - Good lighting and clear focus

5. **Submit for Review**:
   - Review all uploaded documents
   - Add any additional notes
   - Submit for admin review

6. **Wait for Review** (24-hour SLA):
   - You'll receive email notification when reviewed
   - Check status in your dashboard
   - If approved: Full access granted ✅
   - If rejected: Follow feedback and resubmit

### Verification Status Indicators

#### Dashboard Status Badges:
- 🔴 **Not Verified**: Email only, limited access
- 🟡 **Email Verified**: Can browse, cannot post tasks
- 🟢 **Fully Verified**: Complete platform access

#### Verification Progress:
- **Step 1/2**: Email ✓, ID ✗
- **Step 2/2**: Email ✓, ID ✓ (Complete)

### What You Can Do at Each Level

| Feature | Email Only | Email + ID Verified |
|---------|------------|---------------------|
| Browse Platform | ✅ | ✅ |
| View Task Details | ✅ | ✅ |
| Post Tasks | ❌ | ✅ |
| Apply to Tasks | ❌ | ✅ |
| Send Messages | ❌ | ✅ |
| Access Payments | ❌ | ✅ |

### Document Upload Tips

#### For Best Results:
- **Good Lighting**: Natural light or bright indoor lighting
- **Clear Focus**: Ensure document text is sharp and readable
- **No Obstructions**: Remove any covers, cases, or fingers
- **Complete Document**: Show entire document, not just part
- **Valid Document**: Use current, non-expired documents

#### Common Rejection Reasons:
- **Poor Image Quality**: Blurry, dark, or unclear photos
- **Missing Information**: Document details not fully visible
- **Expired Document**: Using outdated identification
- **Wrong Document Type**: Using non-government issued ID
- **Invalid Format**: Screenshots or photocopies

---

## Admin Manual Verification Guide

### Admin Access Requirements

- **Admin Account**: Must have `user_type = 'admin'` in database
- **Access Level**: Full platform management permissions
- **Verification Queue**: Access to `/admin/verification`

### Manual Verification Workflow

#### 1. Access Verification Queue
1. **Go to Admin Dashboard**: `/admin/verification`
2. **View Pending Submissions**: All manual verification requests
3. **Check Priority**: Overdue submissions highlighted in red
4. **Review Status**: Normal, Warning, or Overdue

#### 2. Review Verification Submission

For each submission, you'll see:

##### User Information:
- **Name**: User's full name
- **Email**: Contact email address
- **User Type**: Client or Freelancer
- **Registration Date**: When they joined

##### Document Information:
- **Document Type**: ID Card, Voter's Card, etc.
- **Submission Time**: When documents were uploaded
- **Hours Pending**: Time since submission
- **Urgency Level**: Normal/Warning/Overdue

##### Document Images:
- **Front Image**: Clear view of document front
- **Back Image**: Document back (if applicable)
- **Selfie**: User holding the document
- **Quality Check**: Image clarity and readability

##### User Notes:
- **Additional Information**: Any notes from the user
- **Special Requests**: User-provided context

#### 3. Verification Decision Process

##### Approve Verification:
1. **Review Documents**: Ensure all requirements met
2. **Quality Assessment**: Check image clarity and validity
3. **Set Confidence Score**: Rate 1-100 based on quality
4. **Add Admin Notes**: Internal notes (optional)
5. **Click "Approve"**: User gets immediate access

**Approval Criteria:**
- Document is government-issued and valid
- All text is clearly readable
- Document appears genuine (not fake/edited)
- User identity matches document
- All required images provided

##### Reject Verification:
1. **Select Rejection Reason**:
   - Poor image quality
   - Document text not readable
   - Document appears expired
   - Invalid document type
   - Missing required information
   - Suspicious or fraudulent
   - Other (specify in notes)

2. **Add Admin Notes**: Detailed feedback for user
3. **Click "Reject"**: User notified and can resubmit

**Rejection Criteria:**
- Images too blurry or dark to read
- Document appears expired or invalid
- Wrong type of document submitted
- Missing required images (front/back/selfie)
- Document appears altered or fake
- User identity doesn't match document

#### 4. Quality Scoring System

Rate each verification 1-100:

- **90-100**: Excellent quality, clearly authentic
- **80-89**: Good quality, minor issues
- **70-79**: Acceptable quality, some concerns
- **60-69**: Poor quality, but verifiable
- **Below 60**: Reject - insufficient quality

#### 5. Admin Actions Available

##### Individual Actions:
- **Approve**: Grant full verification
- **Reject**: Deny with reason and feedback
- **View Details**: Full submission information
- **Add Notes**: Internal admin comments

##### Bulk Actions:
- **Select Multiple**: Process several at once
- **Bulk Approve**: Approve multiple submissions
- **Bulk Reject**: Reject multiple with same reason

### Emergency Bypass System

#### When to Use Emergency Bypass:
- **Urgent Client Requests**: Critical business needs
- **Dojah System Failures**: Technical issues blocking users
- **VIP Users**: Important clients or partners
- **System Testing**: Development and testing needs

#### How to Use Emergency Bypass:
1. **Go to User Management**: `/admin/users`
2. **Find Target User**: Search by name or email
3. **Click "🚨 Bypass Dojah (Emergency)"**
4. **Confirm Action**: User gets instant full access
5. **Log Entry**: Action recorded in audit trail

#### Emergency Bypass Results:
- **Instant Access**: User can post tasks immediately
- **Full Permissions**: Complete platform access
- **Audit Trail**: Action logged for compliance
- **No Document Review**: Bypasses normal verification

### Verification Queue Management

#### Queue Organization:
- **Priority Sorting**: Overdue submissions first
- **Status Filtering**: Pending, Approved, Rejected
- **Search Function**: Find users by name/email
- **Date Filtering**: Recent or older submissions

#### SLA Monitoring:
- **24-Hour SLA**: Target response time
- **Warning Level**: 12+ hours pending (yellow)
- **Overdue Level**: 24+ hours pending (red)
- **Escalation**: Automatic alerts for overdue items

#### Daily Workflow:
1. **Morning Review**: Check overnight submissions
2. **Process Queue**: Handle pending verifications
3. **Monitor SLA**: Watch for approaching deadlines
4. **End-of-Day**: Ensure all urgent items processed

### Admin Dashboard Features

#### Verification Statistics:
- **Total Submissions**: All-time verification requests
- **Pending Review**: Currently awaiting admin action
- **Approved Today**: Successfully verified users
- **Rejected Today**: Failed verifications
- **Overdue Items**: Past 24-hour SLA

#### Performance Metrics:
- **Average Response Time**: Time to process submissions
- **Approval Rate**: Percentage approved vs rejected
- **Daily Volume**: Submissions received per day
- **Admin Efficiency**: Verifications per hour

#### Search and Filter:
- **User Search**: Find by name, email, or ID
- **Status Filter**: All, Pending, Approved, Rejected
- **Date Range**: Filter by submission date
- **Document Type**: Filter by ID type
- **Urgency Level**: Normal, Warning, Overdue

---

## Emergency Procedures

### User Verification Issues

#### Problem: Can't Complete Dojah Verification
**Solution**: Use Manual Upload Alternative
1. Click "Manual Upload" instead of Dojah
2. Upload clear photos of your ID
3. Submit for 24-hour admin review
4. Check email for approval notification

#### Problem: Manual Upload Rejected
**Solution**: Review Feedback and Resubmit
1. Check rejection reason in email/dashboard
2. Take new photos following feedback
3. Ensure document is valid and current
4. Resubmit with improved quality

#### Problem: Verification Taking Too Long
**Solution**: Contact Support
1. Check verification status in dashboard
2. If past 24 hours, contact admin support
3. Provide your user ID and submission date
4. Request manual review or emergency bypass

### Admin Emergency Procedures

#### Problem: High Volume of Submissions
**Solution**: Prioritize and Bulk Process
1. Sort by urgency (overdue first)
2. Use bulk approval for clear cases
3. Focus on 24+ hour overdue items
4. Request additional admin support if needed

#### Problem: Dojah System Down
**Solution**: Activate Emergency Mode
1. Monitor manual upload volume increase
2. Use emergency bypass for urgent cases
3. Communicate with users about delays
4. Prioritize manual verification processing

#### Problem: User Complaints About Delays
**Solution**: Proactive Communication
1. Send status update emails to pending users
2. Use emergency bypass for critical cases
3. Provide estimated processing times
4. Escalate to management if needed

---

## Troubleshooting

### Common User Issues

#### "Verification Required" Error
**Cause**: User hasn't completed identity verification
**Solution**: 
1. Check verification status in dashboard
2. Complete email verification first
3. Choose Dojah or Manual Upload option
4. Follow verification process steps

#### Document Upload Failed
**Cause**: File size, format, or network issue
**Solution**:
1. Check file size (must be under 5MB)
2. Use supported formats (JPG, PNG)
3. Ensure stable internet connection
4. Try uploading one image at a time

#### Verification Stuck on "Under Review"
**Cause**: Admin hasn't processed submission yet
**Solution**:
1. Wait for 24-hour SLA
2. Check email for notifications
3. Contact support if past deadline
4. Request emergency review if urgent

### Common Admin Issues

#### Can't Access Verification Queue
**Cause**: Insufficient admin permissions
**Solution**:
1. Verify user has `user_type = 'admin'`
2. Check database permissions
3. Contact system administrator
4. Verify admin role assignment

#### Documents Not Loading
**Cause**: Storage bucket or permission issue
**Solution**:
1. Check Supabase storage configuration
2. Verify RLS policies on storage bucket
3. Test file access permissions
4. Check network connectivity

#### Emergency Bypass Not Working
**Cause**: Database update failed or permission issue
**Solution**:
1. Check database connection
2. Verify admin user permissions
3. Check for database constraints
4. Review error logs for details

### System Performance Issues

#### Slow Verification Processing
**Solution**:
1. Check database performance
2. Optimize image loading
3. Use bulk operations for efficiency
4. Monitor server resources

#### High Rejection Rates
**Solution**:
1. Improve user guidance and instructions
2. Add better quality validation
3. Provide clearer examples
4. Review approval criteria

---

## Support and Resources

### For Users:
- **Help Center**: Platform documentation and guides
- **Email Support**: Contact form for verification issues
- **Status Dashboard**: Real-time verification progress
- **Video Tutorials**: Step-by-step verification guides

### For Admins:
- **Admin Documentation**: Complete system guide
- **Training Materials**: Verification best practices
- **Support Team**: Technical assistance and escalation
- **Performance Metrics**: Daily and weekly reports

### Emergency Contacts:
- **Technical Issues**: System administrator
- **Verification Delays**: Admin team lead
- **User Complaints**: Customer support manager
- **System Outages**: DevOps team

---

**This guide covers all aspects of the verification system for both users and administrators. For technical implementation details, refer to the technical documentation.**
