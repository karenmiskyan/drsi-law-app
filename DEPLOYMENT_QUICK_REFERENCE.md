# ⚡ Vercel Deployment - Quick Reference Card

One-page quick reference for deploying DRSI Law to Vercel.

---

## 📦 Before You Start

```bash
# 1. Test build locally
npm run build

# 2. Commit and push to Git
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

## 🚀 Deployment Steps

### 1. Vercel Setup (5 min)
- Go to https://vercel.com
- Sign up with GitHub/GitLab
- Import your repository
- Framework: **Next.js** (auto-detected)
- Click **Deploy**

### 2. Add Environment Variables (10 min)
**Vercel Dashboard → Settings → Environment Variables**

Copy/paste from `vercel-env-template.txt`:

| Variable | Where to Get | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL (update after deploy) | ✅ |
| `STRIPE_SECRET_KEY` | https://dashboard.stripe.com/apikeys | ✅ |
| `STRIPE_WEBHOOK_SECRET` | https://dashboard.stripe.com/webhooks | ✅ |
| `GOOGLE_OAUTH_CLIENT_ID` | https://console.cloud.google.com | ✅ |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Same as above | ✅ |
| `GOOGLE_OAUTH_REDIRECT_URI` | `https://your-url.vercel.app/api/auth/google/callback` | ✅ |
| `GOOGLE_OAUTH_REFRESH_TOKEN` | Get from authorize flow (see below) | ✅ |
| `GOOGLE_DRIVE_FOLDER_ID` | Your Drive folder ID | ✅ |
| `EMAIL_USER` | your-email@gmail.com | ✅ |
| `EMAIL_PASSWORD` | Gmail App Password | ✅ |
| `ADMIN_EMAIL` | admin@drsilaw.com | ✅ |
| `MONDAY_API_KEY` | https://monday.com | ⭕ |
| `MONDAY_BOARD_ID` | Monday board ID | ⭕ |

### 3. First Deploy (2-5 min)
- Wait for build to complete
- Note your URL: `https://[your-app].vercel.app`

### 4. Post-Deploy Configuration (15 min)

#### A. Update URLs in Vercel
```
NEXT_PUBLIC_APP_URL → https://your-actual-url.vercel.app
GOOGLE_OAUTH_REDIRECT_URI → https://your-actual-url.vercel.app/api/auth/google/callback
```
**Redeploy automatically happens**

#### B. Update Google Console
1. https://console.cloud.google.com/apis/credentials
2. Add redirect URI: `https://your-url.vercel.app/api/auth/google/callback`
3. Save

#### C. Get OAuth Refresh Token
1. Visit: `https://your-url.vercel.app/api/auth/google/authorize`
2. Authorize with Google
3. Copy `refresh_token` from response
4. Update `GOOGLE_OAUTH_REFRESH_TOKEN` in Vercel
5. Redeploy

#### D. Configure Stripe Webhook
1. https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://your-url.vercel.app/api/webhook`
3. Event: `checkout.session.completed`
4. Copy signing secret
5. Verify `STRIPE_WEBHOOK_SECRET` matches

---

## ✅ Quick Test

```
1. Homepage → https://your-url.vercel.app
2. Fill form → Select status → Sign → Pay (4242...)
3. ✅ Payment success
4. ✅ Email received
5. ✅ Drive upload
6. ✅ Registration link works
7. Fill registration → Upload docs → Submit
8. ✅ Registration email received
9. ✅ Docs uploaded to Drive
```

---

## 🆘 Quick Fixes

| Error | Fix |
|-------|-----|
| Build fails | `npm run build` locally, fix errors |
| 401 Google Drive | Regenerate refresh token from production URL |
| Stripe webhook fails | Verify webhook secret in Stripe dashboard |
| Email fails | Use App Password, not regular password |
| Env vars not working | Redeploy after adding/updating vars |

---

## 📊 Monitoring

**Logs:** Vercel Dashboard → Your Project → Logs  
**Functions:** Vercel Dashboard → Your Project → Functions  
**Deployments:** Vercel Dashboard → Your Project → Deployments

---

## 🔗 Essential Links

```
Vercel Dashboard:     https://vercel.com/dashboard
Stripe Dashboard:     https://dashboard.stripe.com
Google Console:       https://console.cloud.google.com
Gmail App Passwords:  https://myaccount.google.com/apppasswords
```

---

## 📝 Deployment Files

- **Complete Guide:** `VERCEL_DEPLOYMENT_GUIDE.md`
- **Checklist:** `DEPLOYMENT_CHECKLIST.md`
- **Quick Start (HY):** `VERCEL_QUICK_START_HY.md`
- **Env Template:** `vercel-env-template.txt`

---

## ⚠️ Important Notes

1. **Database:** File-based DB resets on deploy (plan migration to Vercel KV)
2. **Stripe:** Use **LIVE** keys for production
3. **Gmail:** Use **App Password**, not regular password
4. **OAuth:** Must regenerate refresh token from production URL
5. **Webhook:** Update endpoint URL in Stripe dashboard

---

## 🎯 Success Criteria

- ✅ Build completes without errors
- ✅ All env vars added
- ✅ OAuth refresh token obtained
- ✅ Stripe webhook configured
- ✅ Payment flow works
- ✅ Emails send
- ✅ Drive uploads work
- ✅ Registration flow works
- ✅ Language switching works

---

## 💡 Pro Tips

- **Auto Deploy:** Push to `main` = auto deploy
- **Preview Deploys:** Each branch gets preview URL
- **Rollback:** Deploy previous version from Deployments tab
- **Custom Domain:** Add in Project Settings → Domains
- **Analytics:** Enable in Project Settings → Analytics

---

**Total Time:** ~30-40 minutes  
**Difficulty:** Intermediate  
**Platform:** Vercel + Next.js 15

---

**Last Updated:** December 2024  
**Status:** Production Ready ✅

