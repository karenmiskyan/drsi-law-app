# 🚀 DRSI Law - Vercel Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Required Before Deployment:

- [ ] Stripe account (Production keys)
- [ ] Google Cloud Project (OAuth credentials)
- [ ] Gmail account (App password for emails)
- [ ] Google Drive folder (for document storage)
- [ ] Monday.com account (optional)
- [ ] Logo file (`public/images/drsi-logo.png`)

---

## 🔧 Step 1: Prepare Your Project

### 1.1. Verify Build Works Locally

```bash
npm run build
```

**Expected output:** `✓ Compiled successfully`

If errors occur, fix them before deploying.

---

### 1.2. Check Git Repository

```bash
# Initialize git if not already
git init

# Add .gitignore (should already exist)
# Verify .env.local is NOT tracked:
git status
```

**Important:** `.env.local` should be in `.gitignore`

---

### 1.3. Push to GitHub/GitLab/Bitbucket

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

---

## 🌐 Step 2: Vercel Project Setup

### 2.1. Create Vercel Account

1. Go to https://vercel.com
2. Sign up with GitHub/GitLab/Bitbucket
3. Connect your repository

### 2.2. Import Project

1. Click **"Add New..."** → **"Project"**
2. Select your repository: `DRSI`
3. Click **"Import"**

### 2.3. Configure Project

**Framework Preset:** Next.js  
**Root Directory:** `./` (leave default)  
**Build Command:** `next build` (leave default)  
**Output Directory:** `.next` (leave default)  
**Install Command:** `npm install` (leave default)

---

## 🔐 Step 3: Environment Variables

**CRITICAL:** Add all environment variables in Vercel dashboard.

### Navigate to:
`Project Settings` → `Environment Variables`

### Add the following (one by one):

#### 3.1. Application URL
```
Name:  NEXT_PUBLIC_APP_URL
Value: https://your-domain.vercel.app
```
**Note:** Replace with your actual Vercel domain after first deployment.

#### 3.2. Stripe (Production)
```
Name:  STRIPE_SECRET_KEY
Value: sk_live_YOUR_PRODUCTION_KEY

Name:  STRIPE_WEBHOOK_SECRET
Value: whsec_YOUR_WEBHOOK_SECRET
```

**How to get Stripe Webhook Secret:**
1. Go to https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. Endpoint URL: `https://your-domain.vercel.app/api/webhook`
4. Events to send: `checkout.session.completed`
5. Copy the **Signing secret** (starts with `whsec_`)

#### 3.3. Google OAuth (Production)
```
Name:  GOOGLE_OAUTH_CLIENT_ID
Value: your-client-id.apps.googleusercontent.com

Name:  GOOGLE_OAUTH_CLIENT_SECRET
Value: your-oauth-client-secret

Name:  GOOGLE_OAUTH_REDIRECT_URI
Value: https://your-domain.vercel.app/api/auth/google/callback

Name:  GOOGLE_OAUTH_REFRESH_TOKEN
Value: your-refresh-token
```

**How to update OAuth redirect URI:**
1. Go to https://console.cloud.google.com/apis/credentials
2. Select your OAuth 2.0 Client ID
3. Add Authorized redirect URI: `https://your-domain.vercel.app/api/auth/google/callback`
4. Click **Save**

**How to get refresh token for production:**
1. Deploy first with placeholder token
2. Visit: `https://your-domain.vercel.app/api/auth/google/authorize`
3. Authorize with your Google account
4. Copy the `refresh_token` from response
5. Update environment variable in Vercel

#### 3.4. Google Drive
```
Name:  GOOGLE_DRIVE_FOLDER_ID
Value: your-main-folder-id
```

**How to get Folder ID:**
1. Open Google Drive
2. Create a folder (e.g., "DRSI Contracts")
3. Open the folder
4. Copy ID from URL: `https://drive.google.com/drive/folders/[THIS_IS_THE_ID]`

#### 3.5. Email (Gmail)
```
Name:  EMAIL_USER
Value: your-email@gmail.com

Name:  EMAIL_PASSWORD
Value: your-16-character-app-password

Name:  ADMIN_EMAIL
Value: admin@drsilaw.com
```

**How to get Gmail App Password:**
1. Enable 2FA on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Generate password for "Mail"
4. Copy the 16-character password (no spaces)

#### 3.6. Monday.com (Optional)
```
Name:  MONDAY_API_KEY
Value: your-monday-api-key

Name:  MONDAY_BOARD_ID
Value: your-board-id
```

**Note:** Skip if not using Monday.com integration.

---

## ⚠️ Step 4: Database Considerations

### 4.1. File-Based Database Issue

Your project uses file-based JSON database (`.db/` folder):
- `.db/registrations.json`
- `.db/folder-mappings.json`

**Problem:** Vercel's filesystem is **read-only** in production.

### 4.2. Solutions:

#### Option A: Use Vercel KV (Recommended)

**Install Vercel KV:**
```bash
npm install @vercel/kv
```

**Update database files:**
- `src/lib/db/registrations.ts`
- `src/lib/db/folder-mappings.ts`

Replace file system operations with Vercel KV:

```typescript
import { kv } from '@vercel/kv';

// Save registration
await kv.set(`registration:${registrationId}`, data);

// Get registration
const data = await kv.get(`registration:${registrationId}`);

// Get all registrations
const keys = await kv.keys('registration:*');
const registrations = await Promise.all(
  keys.map(key => kv.get(key))
);
```

#### Option B: Use External Database

Options:
- **MongoDB Atlas** (Free tier available)
- **Supabase** (Free tier with PostgreSQL)
- **PlanetScale** (MySQL)
- **Firebase Firestore**

#### Option C: Keep File-Based (Development Only)

If you want to keep file-based for now:

1. Accept that database will reset on each deployment
2. Use for testing only
3. Plan migration to proper database later

**For now, we'll continue with Option C** (file-based, knowing it's temporary).

---

## 🏗️ Step 5: Deploy

### 5.1. Trigger Deployment

Click **"Deploy"** in Vercel dashboard.

### 5.2. Wait for Build

Monitor the build logs. Expected time: 2-5 minutes.

### 5.3. Deployment Success

Once deployed, you'll see:
- **✅ Deployment Complete**
- Your production URL: `https://your-project.vercel.app`

---

## 🧪 Step 6: Post-Deployment Testing

### 6.1. Update Environment Variables

Now that you have the production URL:

1. Go to **Environment Variables**
2. Update `NEXT_PUBLIC_APP_URL` with actual URL
3. **Redeploy** (Vercel will auto-redeploy on env var change)

### 6.2. Test OAuth Flow

1. Visit: `https://your-domain.vercel.app/api/auth/google/authorize`
2. Authorize with Google account
3. Copy the `refresh_token`
4. Update `GOOGLE_OAUTH_REFRESH_TOKEN` in Vercel
5. Redeploy

### 6.3. Test Stripe Webhook

1. Go to https://dashboard.stripe.com/webhooks
2. Click on your endpoint
3. Click **"Send test webhook"**
4. Select `checkout.session.completed`
5. Verify webhook received successfully

### 6.4. Test Complete Flow

1. Visit: `https://your-domain.vercel.app`
2. Fill contact form
3. Select marital status
4. Sign contract
5. Test payment with Stripe test card: `4242 4242 4242 4242`
6. Verify:
   - ✅ Payment succeeds
   - ✅ Email received
   - ✅ PDF uploaded to Google Drive
   - ✅ Success page displays
   - ✅ Registration form link works

### 6.5. Test Registration Flow

1. Click registration link from success page
2. Fill all 5 steps
3. Upload documents
4. Submit
5. Verify:
   - ✅ Submission succeeds
   - ✅ Email received with PDF
   - ✅ Documents uploaded to Drive

---

## 🔧 Step 7: Custom Domain (Optional)

### 7.1. Add Custom Domain

1. Go to **Project Settings** → **Domains**
2. Add your domain: `drsilaw.com` or `app.drsilaw.com`
3. Follow Vercel's DNS instructions

### 7.2. Update Environment Variables

Update all URLs with your custom domain:
- `NEXT_PUBLIC_APP_URL`
- `GOOGLE_OAUTH_REDIRECT_URI`
- Stripe webhook endpoint

### 7.3. Update Google OAuth

1. Go to https://console.cloud.google.com/apis/credentials
2. Add new redirect URI: `https://drsilaw.com/api/auth/google/callback`
3. Save

### 7.4. Update Stripe Webhook

1. Go to https://dashboard.stripe.com/webhooks
2. Edit endpoint URL: `https://drsilaw.com/api/webhook`
3. Save

---

## 📊 Step 8: Monitoring & Logs

### 8.1. View Logs

**Real-time logs:**
```
Vercel Dashboard → Your Project → Logs
```

**Function logs:**
```
Vercel Dashboard → Your Project → Functions
```

### 8.2. Error Tracking

Consider adding:
- **Sentry** (error tracking)
- **LogRocket** (session replay)
- **Vercel Analytics** (built-in)

---

## 🚨 Common Issues & Solutions

### Issue 1: Build Fails

**Error:** `Module not found` or `Type error`

**Solution:**
```bash
# Locally:
rm -rf node_modules package-lock.json
npm install
npm run build
```

If build succeeds locally, push and redeploy.

---

### Issue 2: Environment Variables Not Working

**Error:** `undefined` values or missing configs

**Solution:**
1. Verify all env vars are added in Vercel
2. Check for typos in variable names
3. Redeploy after adding/updating env vars
4. Use `NEXT_PUBLIC_` prefix for client-side variables

---

### Issue 3: Google Drive Upload Fails

**Error:** `401 Unauthorized` or `403 Forbidden`

**Solution:**
1. Verify `GOOGLE_OAUTH_REFRESH_TOKEN` is correct
2. Regenerate refresh token from production URL
3. Verify folder permissions (shared with OAuth account)
4. Check folder ID is correct

---

### Issue 4: Stripe Webhook Fails

**Error:** `Webhook signature verification failed`

**Solution:**
1. Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
2. Ensure webhook endpoint URL is correct in Stripe
3. Check webhook is sending `checkout.session.completed` event
4. Verify Stripe is using correct API version

---

### Issue 5: Email Sending Fails

**Error:** `Invalid login` or `SMTP error`

**Solution:**
1. Verify 2FA is enabled on Gmail account
2. Generate new App Password
3. Copy password without spaces
4. Verify `EMAIL_USER` matches Gmail account
5. Check "Less secure app access" is NOT enabled (use App Password instead)

---

### Issue 6: Database Resets on Deploy

**Expected:** File-based database resets on each deployment

**Solution:**
- For production, migrate to Vercel KV or external database
- For now, accept resets and manually test after each deployment

---

## 🔄 Continuous Deployment

Vercel automatically deploys on:
- ✅ Push to `main` branch
- ✅ Pull request merges
- ✅ Manual trigger in dashboard

### Branch Previews

Each branch gets a preview URL:
```
feature-branch → https://your-project-git-feature-branch.vercel.app
```

**Useful for testing before merging to main.**

---

## 🛡️ Security Checklist

Before going live:

- [ ] All environment variables use production keys
- [ ] Stripe is in live mode (not test mode)
- [ ] OAuth redirects point to production URL
- [ ] Webhook endpoints use production URL
- [ ] Gmail App Password (not regular password)
- [ ] `.env.local` is in `.gitignore`
- [ ] No secrets committed to git
- [ ] Admin email is correct
- [ ] Google Drive folder permissions are correct
- [ ] Stripe webhook signature is verified
- [ ] HTTPS is enabled (Vercel does this automatically)

---

## 📱 Mobile Testing

After deployment, test on:
- [ ] iPhone Safari
- [ ] Android Chrome
- [ ] iPad
- [ ] Desktop Chrome
- [ ] Desktop Firefox
- [ ] Desktop Safari

---

## 🎯 Performance Optimization

### Enable Vercel Analytics

1. Go to **Project Settings** → **Analytics**
2. Click **"Enable"**

### Enable Vercel Speed Insights

1. Install package:
```bash
npm install @vercel/speed-insights
```

2. Add to `app/layout.tsx`:
```typescript
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

---

## 📞 Support Resources

### Vercel Support:
- **Docs:** https://vercel.com/docs
- **Support:** https://vercel.com/support
- **Discord:** https://vercel.com/discord

### External Services:
- **Stripe:** https://support.stripe.com
- **Google Cloud:** https://cloud.google.com/support
- **Gmail:** https://support.google.com/mail

---

## 🎉 Deployment Complete!

Once everything is tested and working:

1. ✅ Production URL is live
2. ✅ Payments work
3. ✅ Emails send
4. ✅ Google Drive uploads work
5. ✅ Registration flow works
6. ✅ All integrations tested

**Your DRSI Law Registration System is now LIVE on Vercel!** 🚀

---

## 📝 Next Steps

### Short Term:
1. Monitor logs for errors
2. Test with real users
3. Collect feedback
4. Fix any bugs

### Long Term:
1. Migrate to proper database (Vercel KV or external)
2. Add error tracking (Sentry)
3. Set up custom domain
4. Implement monitoring
5. Add backup system
6. Set up staging environment

---

## 🔗 Useful Vercel Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy from CLI
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel list

# Remove deployment
vercel remove [deployment-url]
```

---

## 📋 Environment Variables Quick Reference

```env
# Application
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Google OAuth
GOOGLE_OAUTH_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=...
GOOGLE_OAUTH_REDIRECT_URI=https://your-domain.vercel.app/api/auth/google/callback
GOOGLE_OAUTH_REFRESH_TOKEN=...

# Google Drive
GOOGLE_DRIVE_FOLDER_ID=...

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=16-character-app-password
ADMIN_EMAIL=admin@drsilaw.com

# Monday.com (Optional)
MONDAY_API_KEY=...
MONDAY_BOARD_ID=...
```

---

**Created:** December 2024  
**Last Updated:** December 2024  
**Status:** Production Ready  
**Platform:** Vercel  
**Framework:** Next.js 15

