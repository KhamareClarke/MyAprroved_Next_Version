# Email Setup Guide

## Quick Setup for Real Email Sending

### Step 1: Get Gmail App Password

1. Go to your Google Account settings: https://myaccount.google.com/
2. Go to "Security" → "2-Step Verification" (enable if not already)
3. Go to "App passwords"
4. Generate a new app password for "Mail"
5. Copy the 16-character password

### Step 2: Update Email Configuration

Replace the email settings in `app/api/send-verification-email/route.ts`:

```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-actual-gmail@gmail.com',    // Your Gmail address
    pass: 'your-16-char-app-password'       // The app password you generated
  }
});
```

### Step 3: Test the System

1. Register a new account
2. Check your email inbox
3. Copy the 3-digit verification code
4. Enter it on the verification page
5. Account verified! ✅

## Alternative: Use Environment Variables

Create a `.env.local` file:

```env
GMAIL_USER=your-gmail@gmail.com
GMAIL_PASS=your-app-password
```

Then update the code to:

```javascript
auth: {
  user: process.env.GMAIL_USER,
  pass: process.env.GMAIL_PASS
}
```

## That's It!

Now users will receive real emails in their inbox with verification codes! 