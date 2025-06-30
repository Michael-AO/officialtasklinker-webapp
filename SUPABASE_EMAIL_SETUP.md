# Supabase Email Template Configuration

To complete the email verification flow, you need to configure the Supabase email template to redirect users to our callback page.

## Steps to Configure Supabase Email Template:

1. **Go to Supabase Dashboard**
   - Navigate to your Supabase project dashboard
   - Go to Authentication > Email Templates

2. **Edit the Confirmation Email Template**
   - Click on "Confirm signup" template
   - Update the confirmation URL to point to your callback page

3. **Update the Confirmation URL**
   Replace the default confirmation URL with:
   ```
   {{ .ConfirmationURL }}?token={{ .TokenHash }}&type=signup
   ```

   Or if you want to use your custom callback page:
   ```
   https://yourdomain.com/verify-email/callback?token={{ .TokenHash }}&type=signup
   ```

4. **Email Template Content (Optional)**
   You can customize the email content to match your brand:

   **Subject:** `Confirm your email address - Tasklinkers`

   **Body:**
   ```html
   <h2>Welcome to Tasklinkers!</h2>
   <p>Please confirm your email address by clicking the button below:</p>
   <a href="{{ .ConfirmationURL }}?token={{ .TokenHash }}&type=signup" 
      style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
      Confirm Email Address
   </a>
   <p>If the button doesn't work, copy and paste this link into your browser:</p>
   <p>{{ .ConfirmationURL }}?token={{ .TokenHash }}&type=signup</p>
   <p>This link will expire in 24 hours.</p>
   <p>If you didn't create an account with Tasklinkers, you can safely ignore this email.</p>
   ```

## How the Flow Works:

1. **User signs up** → Supabase sends confirmation email
2. **User clicks email link** → Redirected to `/verify-email/callback?token=...`
3. **Callback page verifies token** → Marks user as verified in database
4. **User redirected to dashboard** → Successfully logged in

## Testing the Flow:

1. Sign up with a new email address
2. Check your email for the confirmation link
3. Click the confirmation link
4. You should be redirected to the callback page, then to the dashboard

## Troubleshooting:

- **Token verification fails**: Check that the token parameter is being passed correctly
- **User not marked as verified**: Check the database update query in the callback page
- **Redirect not working**: Ensure the callback page exists and is accessible

## Security Notes:

- The token is automatically verified by Supabase before processing
- Users are only marked as verified after successful token verification
- The callback page handles both success and error cases gracefully 