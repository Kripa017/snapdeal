# Setup Guide for Real Email Sending

## Step 1: Enable 2-Factor Authentication on Your Gmail Account
1. Go to https://myaccount.google.com/
2. Click "Security" on the left menu
3. Scroll down to "2-Step Verification" and enable it

## Step 2: Create an App Password
1. After enabling 2FA, go back to https://myaccount.google.com/security
2. Scroll down to "App passwords" (it only appears if you have 2FA enabled)
3. Select "Mail" and "Windows Computer" (or your device)
4. Google will generate a 16-character password
5. Copy this password

## Step 3: Update the .env file in server folder
Replace the values in `c:\Users\HP\Desktop\WorkSpace - Copy (4) - Copy\snapdeal\server\.env`:

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
JWT_SECRET=supersecretkey
MONGODB_URI=mongodb://localhost:27017/snapdeal
```

For example:
```
EMAIL_USER=john@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

## Step 4: Restart the Server
After updating .env, the server will use Gmail SMTP to send real emails.

## How to Test
1. Open http://localhost:5175/login
2. Enter your email address
3. Click "Send OTP"
4. Check your email inbox - you should receive the OTP!
5. Enter the OTP on the login page
6. You'll be redirected to the dashboard
