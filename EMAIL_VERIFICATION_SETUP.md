# Email Verification Setup Guide

## Current Issue
You're not receiving verification emails because your Supabase instance is using demo/fallback values that don't have email sending capabilities.

## Solution Steps

### 1. Set Up Real Supabase Project

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and anon key

2. **Configure Environment Variables**:
   Create a `.env.local` file in your project root with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
   ```

### 2. Configure Email Settings in Supabase

1. **Go to Supabase Dashboard**:
   - Navigate to Authentication > Settings
   - Scroll to "Email" section

2. **Enable Email Confirmation**:
   - Toggle "Enable email confirmations" to ON
   - Set "Confirm email" to ON

3. **Configure Email Templates**:
   - Go to Authentication > Email Templates
   - Click on "Confirm signup" template
   - Update the confirmation URL to:
     ```
     {{ .SiteURL }}/verify-email/callback?token={{ .TokenHash }}&type=signup
     ```

4. **Set Up Email Provider** (Choose one):

   **Option A: Use Supabase's built-in email (for testing)**:
   - In Authentication > Settings > Email
   - Use the default SMTP settings
   - Note: Limited to 3 emails per hour for free tier

   **Option B: Use Brevo SMTP (Your Current Setup)**:
   - In Authentication > Settings > Email
   - Configure Brevo SMTP settings:
     ```
     SMTP Host: smtp-relay.brevo.com
     SMTP Port: 587
     SMTP User: your-brevo-email@yourdomain.com
     SMTP Password: your-brevo-smtp-key
     ```
   - **Brevo SMTP Configuration**:
     1. Go to your Brevo dashboard
     2. Navigate to Settings > SMTP & API
     3. Copy your SMTP key (not the API key)
     4. Use your verified sender email as the SMTP User
     5. Use the SMTP key as the password

### 3. Test the Email Flow

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Test signup**:
   - Go to `/signup`
   - Create a new account
   - Check your email for the verification link

3. **Verify the callback**:
   - Click the verification link in your email
   - You should be redirected to `/verify-email/callback`
   - Then redirected to `/dashboard`

### 4. Troubleshooting

**If emails still don't send**:
1. Check your Supabase project settings
2. Verify environment variables are loaded
3. Check the browser console for errors
4. Ensure your domain is whitelisted in Supabase

**If verification doesn't work**:
1. Check that the callback URL is correct
2. Verify the token parameter is being passed
3. Check the database for user verification status

### 5. Production Considerations

For production deployment:
1. Use a proper email service (SendGrid, Mailgun, etc.)
2. Set up proper domain verification
3. Configure rate limiting
4. Set up email monitoring and analytics

## Current Code Changes Made

1. **Fixed signup flow**: Added proper `emailRedirectTo` parameter
2. **Fixed database service**: Users now start as unverified
3. **Added callback handling**: Proper token verification flow

The email verification should now work correctly once you set up a real Supabase project with email configuration.
