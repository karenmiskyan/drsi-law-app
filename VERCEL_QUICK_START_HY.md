# 🚀 Vercel Deployment - Հայերեն Ուղեցույց

## Արագ ընթացակարգ DRSI Law-ը Vercel-ում տեղադրելու համար

---

## 📋 Քայլ 1: Նախապատրաստում

### Ստուգիր որ build-ը աշխատում է:

```bash
npm run build
```

Եթե սխալներ կան, ուղղի՛ր նախքան deploy անելը։

---

## 🌐 Քայլ 2: Vercel Setup

1. **Գնա** https://vercel.com
2. **Գրանցվի՛ր** GitHub/GitLab-ով
3. **Կապի՛ր** քո repository-ն
4. **Import արա** DRSI project-ը
5. **Framework:** Next.js (automatic)

---

## 🔐 Քայլ 3: Environment Variables

**Vercel Dashboard → Settings → Environment Variables**

### Ավելացրու բոլորը:

```env
# 1. Application URL (կթարմացնես առաջին deploy-ից հետո)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# 2. Stripe (PRODUCTION keys)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# 3. Google OAuth
GOOGLE_OAUTH_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=...
GOOGLE_OAUTH_REDIRECT_URI=https://your-app.vercel.app/api/auth/google/callback
GOOGLE_OAUTH_REFRESH_TOKEN=... (կստանաս հետո)

# 4. Google Drive
GOOGLE_DRIVE_FOLDER_ID=your-folder-id

# 5. Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=16-char-app-password
ADMIN_EMAIL=admin@drsilaw.com

# 6. Monday.com (Optional)
MONDAY_API_KEY=...
MONDAY_BOARD_ID=...
```

---

## 🚀 Քայլ 4: Deploy Արա

1. **Click** "Deploy" button
2. **Սպասի՛ր** 2-5 րոպե
3. **Կստանաս** URL: `https://your-app.vercel.app`

---

## 🔧 Քայլ 5: Թարմացրու URLs (կարևոր!)

### 5.1. Environment Variables-ում:

```
NEXT_PUBLIC_APP_URL → https://your-app.vercel.app (իրական URL)
GOOGLE_OAUTH_REDIRECT_URI → https://your-app.vercel.app/api/auth/google/callback
```

**Vercel-ը ավտոմատ կվերատեղադրի երբ փոխես env vars-ը։**

---

### 5.2. Google Console-ում:

1. **Գնա** https://console.cloud.google.com/apis/credentials
2. **Բացիր** քո OAuth Client ID-ն
3. **Ավելացրու** Redirect URI:
   ```
   https://your-app.vercel.app/api/auth/google/callback
   ```
4. **Save**

---

### 5.3. Google Refresh Token:

1. **Գնա** `https://your-app.vercel.app/api/auth/google/authorize`
2. **Authorize արա** քո Google account-ով
3. **Copy արա** `refresh_token`-ը response-ից
4. **Թարմացրու** Vercel-ի Environment Variables-ում:
   ```
   GOOGLE_OAUTH_REFRESH_TOKEN=copied-token-here
   ```
5. **Redeploy** (ավտոմատ կլինի)

---

### 5.4. Stripe Webhook:

1. **Գնա** https://dashboard.stripe.com/webhooks
2. **Click** "Add endpoint"
3. **Endpoint URL:**
   ```
   https://your-app.vercel.app/api/webhook
   ```
4. **Events:** `checkout.session.completed`
5. **Copy** Signing secret (`whsec_...`)
6. **Եթե տարբեր է,** թարմացրու `STRIPE_WEBHOOK_SECRET`-ը Vercel-ում

---

## 🧪 Քայլ 6: Թեստ Արա

### Payment Flow:

```
1. Գնա homepage → https://your-app.vercel.app
2. Լրացրու contact form
3. Ընտրի marital status
4. Sign contract
5. Test payment: 4242 4242 4242 4242
6. Verify email ստացվեց
7. Verify Google Drive-ում upload եղավ
```

### Registration Flow:

```
1. Click registration link (email-ից կամ success page-ից)
2. Լրացրու 5 steps
3. Upload documents
4. Submit
5. Verify email ստացվեց
6. Verify documents Drive-ում են
```

### Language Switching:

```
1. Click [עברית] → Hebrew-ի անցնի
2. Click [English] → English-ի անցնի
3. Layout RTL/LTR փոխվի
```

---

## ⚠️ Կարևոր Նշումներ

### 1. Database Issue:

**Խնդիր:** `.db/` folder-ի file-based database-ը reset կլինի յուրաքանչյուր deploy-ով։

**Պատճառ:** Vercel-ի filesystem-ը read-only է production-ում։

**Լուծում (ապագայում):**
- Migrate անես Vercel KV
- Կամ օգտագործես external database (MongoDB, Supabase, etc.)

**Հիմա:** Քանի որ testing phase-ում ես, սա նորմալ է։ Պարզապես մտածիր որ production-ում database պետք է փոխես։

---

### 2. Stripe Modes:

**Development:** Test mode (`sk_test_...`)  
**Production:** Live mode (`sk_live_...`)

Vercel-ի համար **live mode** keys օգտագործի՛ր։

---

### 3. Gmail App Password:

**Սխալ:** Regular Gmail password  
**Ճիշտ:** 16-character App Password

**Ստանալու համար:**
1. Enable 2FA on Gmail
2. https://myaccount.google.com/apppasswords
3. Generate "Mail" password
4. Copy առանց space-երի

---

## 🆘 Common Errors

### "Build Failed"

```bash
# Local-ում test արա:
npm run build

# Եթե աշխատում է local-ում բայց Vercel-ում ոչ:
# → Ստուգիր environment variables-ը
# → Ստուգիր TypeScript errors-ը
```

---

### "401 Unauthorized" (Google Drive)

```
→ Refresh token-ը սխալ է
→ Regenerate արա production URL-ից
→ Ստուգիր folder permissions-ը
```

---

### "Webhook Signature Verification Failed"

```
→ STRIPE_WEBHOOK_SECRET-ը սխալ է
→ Copy արա նորից Stripe dashboard-ից
→ Ստուգիր endpoint URL-ը Stripe-ում
```

---

### "Email Sending Failed"

```
→ Օգտագործիր App Password (ոչ թե regular password)
→ Ստուգիր 2FA-ն enabled է
→ Ստուգիր EMAIL_USER-ը ճիշտ է
```

---

## ✅ Checklist

Deployment-ը complete է երբ:

- ✅ Site-ը live է
- ✅ Build-ը успешен է
- ✅ Environment variables ավելացված են
- ✅ Google OAuth refresh token ստացված է
- ✅ Stripe webhook կարգավորված է
- ✅ Payment test-ը աշխատում է
- ✅ Email-ները ուղարկվում են
- ✅ Google Drive upload-ը աշխատում է
- ✅ Registration flow-ը աշխատում է
- ✅ Language switching-ը աշխատում է

---

## 📞 Օգնություն

### Vercel Issues:
- **Docs:** https://vercel.com/docs
- **Support:** https://vercel.com/support

### External Services:
- **Stripe:** https://support.stripe.com
- **Google Cloud:** https://cloud.google.com/support

---

## 🎉 Պատրաստ է!

Երբ բոլոր քայլերը complete են:

**🚀 Քո site-ը live է Vercel-ում!**

---

## 📂 Helpful Files

- **Complete Guide (English):** `VERCEL_DEPLOYMENT_GUIDE.md`
- **Checklist:** `DEPLOYMENT_CHECKLIST.md`
- **Environment Example:** `env.complete.example`
- **OAuth Setup:** `OAUTH_SETUP_INSTRUCTIONS.md`

---

## 🔗 Quick Links

```
Vercel Dashboard:
https://vercel.com/dashboard

Your Site (after deploy):
https://your-app-name.vercel.app

Stripe Dashboard:
https://dashboard.stripe.com

Google Console:
https://console.cloud.google.com

Gmail App Passwords:
https://myaccount.google.com/apppasswords
```

---

**Ստեղծված:** Դեկտեմբեր 2024  
**Կարգավիճակ:** Production Ready  
**Հարթակ:** Vercel + Next.js 15

---

## 💡 Pro Tips

1. **Test Local-ում նախքան deploy-ը** → `npm run build`
2. **Save environment variables** → Copy/paste-ը document-ում պահիր
3. **Monitor logs** → Vercel Dashboard → Logs
4. **Custom Domain** → Vercel Dashboard → Domains (optional)
5. **Auto Deploy** → Push to `main` = auto deploy

---

**Հաջողություն! 🎊**

