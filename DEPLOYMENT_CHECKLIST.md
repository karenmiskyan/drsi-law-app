# ✅ Vercel Deployment Checklist

Quick checklist for deploying DRSI Law to Vercel.

---

## 🔍 Pre-Deployment (Local)

### Code & Build
- [ ] `npm run build` succeeds without errors
- [ ] `npm run lint` passes
- [ ] All tests pass (if you have tests)
- [ ] No console errors in development
- [ ] Logo file exists: `public/images/drsi-logo.png`

### Git Repository
- [ ] All changes committed
- [ ] `.env.local` is in `.gitignore`
- [ ] No secrets in code
- [ ] Pushed to GitHub/GitLab/Bitbucket
- [ ] On `main` branch (or your preferred branch)

---

## 🌐 Vercel Setup

### Account & Project
- [ ] Vercel account created
- [ ] Repository connected to Vercel
- [ ] Project imported
- [ ] Framework preset: Next.js

---

## 🔐 Environment Variables

Copy this checklist to Vercel Dashboard → Environment Variables:

### Required Variables
- [ ] `NEXT_PUBLIC_APP_URL` (will update after first deploy)
- [ ] `STRIPE_SECRET_KEY` (production key)
- [ ] `STRIPE_WEBHOOK_SECRET` (from Stripe dashboard)
- [ ] `GOOGLE_OAUTH_CLIENT_ID`
- [ ] `GOOGLE_OAUTH_CLIENT_SECRET`
- [ ] `GOOGLE_OAUTH_REDIRECT_URI` (will update after first deploy)
- [ ] `GOOGLE_OAUTH_REFRESH_TOKEN` (will get after first deploy)
- [ ] `GOOGLE_DRIVE_FOLDER_ID`
- [ ] `EMAIL_USER`
- [ ] `EMAIL_PASSWORD` (Gmail App Password)
- [ ] `ADMIN_EMAIL`

### Optional Variables
- [ ] `MONDAY_API_KEY` (if using Monday.com)
- [ ] `MONDAY_BOARD_ID` (if using Monday.com)

---

## 🚀 First Deployment

- [ ] Click **"Deploy"** in Vercel
- [ ] Wait for build to complete (2-5 minutes)
- [ ] Note your deployment URL: `https://_____.vercel.app`
- [ ] Deployment succeeds (no errors)

---

## 🔧 Post-Deployment Configuration

### Update URLs
- [ ] Update `NEXT_PUBLIC_APP_URL` with actual Vercel URL
- [ ] Update `GOOGLE_OAUTH_REDIRECT_URI` with actual Vercel URL
- [ ] Trigger redeploy (automatic when env vars change)

### Google OAuth Setup
- [ ] Go to https://console.cloud.google.com/apis/credentials
- [ ] Add authorized redirect URI: `https://your-url.vercel.app/api/auth/google/callback`
- [ ] Save
- [ ] Visit: `https://your-url.vercel.app/api/auth/google/authorize`
- [ ] Authorize with Google account
- [ ] Copy `refresh_token` from response
- [ ] Update `GOOGLE_OAUTH_REFRESH_TOKEN` in Vercel
- [ ] Redeploy

### Stripe Webhook Setup
- [ ] Go to https://dashboard.stripe.com/webhooks
- [ ] Click **"Add endpoint"**
- [ ] Endpoint URL: `https://your-url.vercel.app/api/webhook`
- [ ] Events: `checkout.session.completed`
- [ ] Copy **Signing secret** (starts with `whsec_`)
- [ ] Update `STRIPE_WEBHOOK_SECRET` in Vercel (if different)
- [ ] Test webhook in Stripe dashboard

---

## 🧪 Testing

### Payment Flow
- [ ] Visit homepage: `https://your-url.vercel.app`
- [ ] Fill contact form
- [ ] Select marital status
- [ ] Pricing displays correctly
- [ ] Sign contract (signature works)
- [ ] Payment page loads
- [ ] Test payment: `4242 4242 4242 4242`
- [ ] Payment succeeds
- [ ] Redirected to success page
- [ ] Email received (check inbox + spam)
- [ ] PDF generated and sent
- [ ] Google Drive upload succeeds
- [ ] Registration form link works

### Registration Flow
- [ ] Click registration link from email or success page
- [ ] Token pre-fills contact info correctly
- [ ] Step 1: Fill applicant info → Continue
- [ ] Step 2: Fill marital status/spouse → Continue
- [ ] Step 3: Add children (if applicable) → Continue
- [ ] Step 4: Upload documents → Continue
- [ ] Step 5: Review data → Submit
- [ ] Submission succeeds
- [ ] Email received with PDF
- [ ] Documents uploaded to Drive
- [ ] Success page displays

### Language Switching
- [ ] Click [English] → UI in English
- [ ] Click [עברית] → UI in Hebrew
- [ ] RTL layout works
- [ ] All translated text displays correctly
- [ ] Language persists on refresh

### Mobile Testing
- [ ] Test on iPhone
- [ ] Test on Android
- [ ] Forms work on mobile
- [ ] Signature works on touchscreen
- [ ] File upload works on mobile
- [ ] Layout responsive

---

## 🛡️ Security Verification

- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Stripe webhook signature verified
- [ ] No secrets exposed in client code
- [ ] Google OAuth working
- [ ] Gmail App Password (not regular password)
- [ ] Production Stripe keys (not test)
- [ ] Environment variables secured in Vercel
- [ ] No `.env.local` in repository

---

## 📊 Monitoring

### Vercel Dashboard
- [ ] Check deployment logs
- [ ] Check function logs
- [ ] Enable Vercel Analytics
- [ ] Monitor error rate

### External Services
- [ ] Stripe dashboard: Check payments
- [ ] Google Drive: Check uploads
- [ ] Gmail: Check sent emails
- [ ] Monday.com: Check data sync (if using)

---

## 🎯 Custom Domain (Optional)

- [ ] Add custom domain in Vercel
- [ ] Configure DNS records
- [ ] Update `NEXT_PUBLIC_APP_URL`
- [ ] Update `GOOGLE_OAUTH_REDIRECT_URI`
- [ ] Update Google OAuth redirect URIs
- [ ] Update Stripe webhook endpoint
- [ ] Test all flows with custom domain

---

## ⚠️ Known Issues

### File-Based Database
- ⚠️ Database resets on each deployment (expected)
- ⚠️ Vercel filesystem is read-only
- 📝 Plan: Migrate to Vercel KV or external database

### First-Time Setup
- ⚠️ OAuth refresh token needs production URL
- ⚠️ Must authorize after first deployment
- ⚠️ Redeploy required after getting token

---

## 🆘 Troubleshooting

### Build Fails
```bash
# Locally test build:
npm run build

# If fails, check:
# - TypeScript errors
# - Missing dependencies
# - Import errors
```

### Environment Variables Not Working
- Check variable names (exact match)
- Redeploy after adding/changing vars
- Use `NEXT_PUBLIC_` for client-side vars

### OAuth Fails
- Verify redirect URI in Google Console
- Regenerate refresh token from production URL
- Check token is added to Vercel env vars

### Stripe Webhook Fails
- Verify endpoint URL in Stripe
- Check webhook secret matches
- Test webhook in Stripe dashboard

### Email Fails
- Verify Gmail App Password (not regular password)
- Check 2FA is enabled
- Verify EMAIL_USER is correct

---

## ✅ Deployment Complete

When all items checked:
- ✅ Site is live
- ✅ Payment works
- ✅ Registration works
- ✅ Emails send
- ✅ Drive uploads work
- ✅ All integrations tested

**🎉 Congratulations! Your site is deployed!**

---

## 📝 Post-Launch

### Immediate
- Monitor logs for 24 hours
- Test with real users
- Fix any critical bugs

### Week 1
- Collect user feedback
- Monitor error rates
- Check email delivery
- Verify Drive uploads

### Month 1
- Plan database migration
- Consider custom domain
- Set up monitoring tools
- Review performance

---

## 🔗 Quick Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Google Console:** https://console.cloud.google.com
- **Gmail App Passwords:** https://myaccount.google.com/apppasswords
- **Monday.com:** https://monday.com

---

**Last Updated:** December 2024  
**For:** DRSI Law Registration System  
**Platform:** Vercel + Next.js 15

