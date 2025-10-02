# Brevo SMTP Configuration for Supabase Email Verification

## Step-by-Step Setup

### 1. Get Your Brevo SMTP Credentials

1. **Login to Brevo Dashboard**:
   - Go to [app.brevo.com](https://app.brevo.com)
   - Login to your account

2. **Navigate to SMTP Settings**:
   - Go to Settings > SMTP & API
   - Click on "SMTP" tab

3. **Get Your SMTP Key**:
   - Copy your SMTP key (starts with `xsmtpib-...`)
   - Note your verified sender email address

### 2. Configure Supabase with Brevo SMTP

1. **Go to Supabase Dashboard**:
   - Navigate to your Supabase project
   - Go to Authentication > Settings

2. **Configure Email Settings**:
   - Scroll to "Email" section
   - Toggle "Enable email confirmations" to ON
   - Toggle "Confirm email" to ON

3. **Set Up Custom SMTP**:
   - Toggle "Use custom SMTP" to ON
   - Fill in the Brevo SMTP details:
     ```
     SMTP Host: smtp-relay.brevo.com
     SMTP Port: 587
     SMTP User: your-verified-sender@yourdomain.com
     SMTP Password: xsmtpib-your-smtp-key-here
     SMTP Admin Email: your-verified-sender@yourdomain.com
     SMTP Sender Name: Tasklinkers
     ```

4. **Test SMTP Connection**:
   - Click "Test SMTP" button
   - You should see a success message

### 3. Configure Email Templates

1. **Go to Email Templates**:
   - Navigate to Authentication > Email Templates
   - Click on "Confirm signup" template

2. **Update Confirmation URL**:
   - Replace the default URL with:
     ```
     {{ .SiteURL }}/verify-email/callback?token={{ .TokenHash }}&type=signup
     ```

3. **Customize Email Template** (Optional):
   ```html
   <h2>Welcome to Tasklinkers!</h2>
   <p>Please confirm your email address by clicking the button below:</p>
   <a href="{{ .SiteURL }}/verify-email/callback?token={{ .TokenHash }}&type=signup" 
      style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
      Confirm Email Address
   </a>
   <p>If the button doesn't work, copy and paste this link into your browser:</p>
   <p>{{ .SiteURL }}/verify-email/callback?token={{ .TokenHash }}&type=signup</p>
   <p>This link will expire in 24 hours.</p>
   <p>If you didn't create an account with Tasklinkers, you can safely ignore this email.</p>
   ```

### 4. Environment Variables

Make sure your `.env.local` file has the correct Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key
```

### 5. Test the Complete Flow

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Test signup with a real email**:
   - Go to `/signup`
   - Create a new account
   - Check your email for the verification link

3. **Verify the callback works**:
   - Click the verification link
   - You should be redirected to `/verify-email/callback`
   - Then redirected to `/dashboard`

### 6. Troubleshooting

**If emails don't send**:
1. Check Brevo SMTP credentials are correct
2. Verify your sender email is verified in Brevo
3. Check Supabase logs for SMTP errors
4. Ensure your domain is not blacklisted

**If verification doesn't work**:
1. Check the callback URL is correct
2. Verify the token parameter is being passed
3. Check browser console for errors
4. Check Supabase logs for verification errors

### 7. Brevo Rate Limits

- **Free Plan**: 300 emails/day
- **Paid Plans**: Higher limits based on your plan
- Monitor your usage in Brevo dashboard

### 8. Production Considerations

1. **Domain Authentication**: Set up SPF, DKIM, and DMARC records
2. **Sender Reputation**: Use a dedicated IP if sending high volumes
3. **Monitoring**: Set up email delivery monitoring
4. **Backup**: Consider having a backup email service

## Quick Checklist

- [ ] Brevo SMTP credentials obtained
- [ ] Supabase SMTP configured with Brevo
- [ ] Email templates updated
- [ ] Environment variables set
- [ ] Test signup with real email
- [ ] Verify callback flow works
- [ ] Check email delivery in Brevo dashboard
