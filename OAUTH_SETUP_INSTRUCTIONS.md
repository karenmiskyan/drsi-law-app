# 🔐 Google OAuth 2.0 Setup Instructions

Complete step-by-step guide to enable Google Drive uploads using OAuth 2.0 (works with personal Google accounts).

---

## 📋 Prerequisites

- Google account with Drive access
- Project already created: `gen-lang-client-0198477910`
- Google Drive API enabled (already done)

---

## Step 1: Configure OAuth Consent Screen

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: **gen-lang-client-0198477910**
3. Navigate to **APIs & Services > OAuth consent screen**

### If NOT configured yet:

- **User Type**: Select **External** → Click **CREATE**
- **App Information**:
  - App name: `DRSI Law Registration`
  - User support email: Your email (e.g., `karenmisakyan2@gmail.com`)
  - Developer contact: Your email
- **Scopes**: Click **ADD OR REMOVE SCOPES**
  - Search for: `Google Drive API`
  - Check: `https://www.googleapis.com/auth/drive.file` (View and manage Drive files created by this app)
  - Click **UPDATE**
- **Test users**: Click **ADD USERS**
  - Add your email: `karenmisakyan2@gmail.com`
  - Click **SAVE AND CONTINUE**

### If already configured:

- Just verify `drive.file` scope is added
- Make sure your email is in **Test users**

---

## Step 2: Create OAuth 2.0 Client ID

1. Navigate to **APIs & Services > Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Fill in:
   - **Application type**: Web application
   - **Name**: `DRSI Law Drive OAuth`
   - **Authorized redirect URIs**: Click **+ ADD URI**
     ```
     http://localhost:3000/api/auth/google/callback
     ```

4. Click **CREATE**

---

## Step 3: Copy Credentials

After creating, you'll see a popup with:
- **Client ID**: Something like `123456-abc.apps.googleusercontent.com`
- **Client Secret**: Something like `GOCSPX-abc123...`

**Copy both values** - you'll need them next.

---

## Step 4: Update .env.local File

Open your `.env.local` file and add these lines:

```env
# Google OAuth 2.0 Credentials
GOOGLE_OAUTH_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Leave this empty for now - we'll get it in Step 5
GOOGLE_OAUTH_REFRESH_TOKEN=

# Keep your existing folder ID
GOOGLE_DRIVE_FOLDER_ID=1QZAsa3ta6wY2wA1v83g-TVrrV6WBUFIz
```

**Remove these old service account variables** (not needed anymore):
```env
# GOOGLE_DRIVE_CLIENT_EMAIL=...
# GOOGLE_DRIVE_PRIVATE_KEY=...
```

**Save the file.**

---

## Step 5: Get Refresh Token (Authorize the App)

1. **Start/Restart your dev server:**
   ```bash
   npm run dev
   ```

2. **Open your browser** and visit:
   ```
   http://localhost:3000/api/auth/google/authorize
   ```

3. You'll be redirected to **Google's authorization page**:
   - Select your Google account
   - Click **Continue** (you may see "Google hasn't verified this app" - click **Advanced** → **Go to DRSI Law Registration (unsafe)**)
   - Review permissions
   - Click **Allow**

4. After authorizing, you'll be redirected back with a **success page**

5. **Check your terminal** - you should see:
   ```
   ✅ OAuth tokens received!
   📋 Add this refresh token to your .env.local:
   GOOGLE_OAUTH_REFRESH_TOKEN=1//abc123def456...
   ```

6. **Copy the refresh token** from terminal

7. **Update `.env.local`** with the refresh token:
   ```env
   GOOGLE_OAUTH_REFRESH_TOKEN=1//abc123def456...
   ```

8. **Restart dev server** again:
   ```bash
   # Press Ctrl+C to stop
   npm run dev
   ```

---

## ✅ Step 6: Test Upload

1. Go to http://localhost:3000
2. Fill in Steps 1, 2, 3
3. Sign the contract
4. Click **Continue to Payment**

**Check terminal output** - you should see:
```
✅ Contract PDF generated
📂 Uploading to shared folder: 1QZAsa3ta6wY2wA1v83g-TVrrV6WBUFIz
📤 Uploading file "Contract_..."
✅ File created
✅ Contract uploaded to Google Drive
```

**Check Google Drive**:
- Go to https://drive.google.com
- Open your `dris_contracts` folder
- You should see the uploaded PDF!

---

## 🔧 Troubleshooting

### Error: "redirect_uri_mismatch"
- Make sure redirect URI in Google Console exactly matches:
  ```
  http://localhost:3000/api/auth/google/callback
  ```

### Error: "Access denied"
- Make sure your email is added to **Test users** in OAuth consent screen

### Error: "Invalid refresh token"
- Go back to Step 5 and get a new refresh token
- Make sure there are no extra spaces when copying

### No refresh token in terminal?
- Check the browser success page - it should display there too
- Make sure `access_type: "offline"` is in the OAuth config (already done in code)

---

## 📝 For Production

When deploying to production:

1. Add your production domain to **Authorized redirect URIs**:
   ```
   https://yourdomain.com/api/auth/google/callback
   ```

2. Update `.env.production`:
   ```env
   GOOGLE_OAUTH_REDIRECT_URI=https://yourdomain.com/api/auth/google/callback
   ```

3. Get a new refresh token using the production URL

---

## 🎉 Done!

Google Drive uploads will now work with your personal account using OAuth 2.0!

