# 🔒 Security Setup Guide

## ✅ Implemented Security Features:

### 1️⃣ **One-Time Submission Token System** ✅
- Prevents double submission via browser back button
- Token generated when user reaches Step 5 (Review)
- Token consumed after successful submission
- Invalid/used tokens are rejected

### 2️⃣ **Database Duplicate Check** ✅
- Checks if email/phone already registered
- Returns error if duplicate found
- Shows registration ID and submission date

### 3️⃣ **State Clearing** ✅
- LocalStorage cleared after successful submission
- Zustand store reset
- Form cannot be re-submitted

### 4️⃣ **Back Navigation Prevention** ✅
- History state replaced after submission
- Redirects to success page
- Alert shown if user tries to go back

---

## 🤖 Bot Protection (Optional - Recommended)

### Option 1: Google reCAPTCHA v3 (Recommended)

**Advantages:**
- Invisible to users (no interaction needed)
- Scores submissions based on behavior (0.0-1.0)
- Free for up to 1 million assessments/month
- Most popular and trusted

**Setup Steps:**

#### 1. Get reCAPTCHA Keys:
1. Go to: https://www.google.com/recaptcha/admin/create
2. Choose **reCAPTCHA v3**
3. Add domains:
   - `localhost` (for development)
   - `your-production-domain.com`
4. Copy your **Site Key** and **Secret Key**

#### 2. Add to `.env.local`:
```bash
# Google reCAPTCHA v3
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-site-key-here
RECAPTCHA_SECRET_KEY=your-secret-key-here
```

#### 3. Install reCAPTCHA Package:
```bash
npm install react-google-recaptcha-v3
```

#### 4. Add Provider to Root Layout:
```typescript
// src/app/layout.tsx
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <GoogleReCaptchaProvider
          reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
        >
          {children}
        </GoogleReCaptchaProvider>
      </body>
    </html>
  );
}
```

#### 5. Add to Step 5 Review:
```typescript
// src/components/registration/steps/Step5Review.tsx
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export function Step5Review() {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleSubmit = async () => {
    // Get reCAPTCHA token
    if (executeRecaptcha) {
      const recaptchaToken = await executeRecaptcha('submit_registration');
      formData.append('recaptchaToken', recaptchaToken);
    }

    // ... rest of submission logic
  };
}
```

#### 6. Add Backend Verification:
```typescript
// src/app/api/submit-registration/route.ts
async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${secretKey}&response=${token}`,
  });

  const data = await response.json();
  
  // Score: 0.0 (bot) to 1.0 (human)
  // Recommended threshold: 0.5
  return data.success && data.score >= 0.5;
}

export async function POST(req: NextRequest) {
  // Extract reCAPTCHA token
  const recaptchaToken = formData.get('recaptchaToken') as string;

  // Verify reCAPTCHA
  if (recaptchaToken) {
    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman) {
      return NextResponse.json(
        { error: 'Bot activity detected. Please try again.' },
        { status: 403 }
      );
    }
  }

  // ... rest of submission logic
}
```

---

### Option 2: hCaptcha (Privacy-Focused Alternative)

**Advantages:**
- Privacy-focused (GDPR compliant)
- Pays website owners for solving CAPTCHAs
- Open source

**Setup:**
1. Register at: https://www.hcaptcha.com/
2. Install: `npm install @hcaptcha/react-hcaptcha`
3. Similar integration to reCAPTCHA

---

### Option 3: Cloudflare Turnstile (Newest)

**Advantages:**
- No personal data collection
- Fastest performance
- Free

**Setup:**
1. Register at: https://dash.cloudflare.com/
2. Install: `npm install react-turnstile`
3. Similar integration to reCAPTCHA

---

### Option 4: Honeypot Field (Simplest)

**Advantages:**
- No external service needed
- No API keys
- No privacy concerns
- Free

**Implementation:**
```typescript
// Add hidden field to form (bots will fill it, humans won't see it)
<input
  type="text"
  name="website"
  style={{ display: 'none' }}
  tabIndex={-1}
  autoComplete="off"
/>

// Backend validation
const honeypot = formData.get('website');
if (honeypot) {
  return NextResponse.json(
    { error: 'Bot activity detected' },
    { status: 403 }
  );
}
```

---

## 🧪 Testing:

### Test Double Submission Prevention:
1. Fill out registration form
2. Submit
3. Use browser back button
4. Try to submit again
5. ✅ Should see error: "This form has already been submitted"

### Test Already Registered:
1. Submit registration with email: test@example.com
2. Try to submit again with same email
3. ✅ Should see error on Step 5: "Registration already submitted"

### Test Back Navigation:
1. Submit registration
2. Wait for success page
3. Use browser back button
4. ✅ Should see alert and be pushed forward

### Test State Clearing:
1. Submit registration
2. Check localStorage: `localStorage.getItem('drsi-registration-form')`
3. ✅ Should be `null`

---

## 📊 Security Flow:

```
User Fills Form
    ↓
Reaches Step 5 (Review)
    ↓
Generate Submission Token (one-time use)
    ├─ Check if email/phone already registered
    │  └─ If YES → Show error
    └─ If NO → Generate token
    ↓
User Clicks "Submit Application"
    ↓
[Optional] Get reCAPTCHA token
    ↓
Send to Backend with:
    - Form data
    - Submission token
    - [Optional] reCAPTCHA token
    ↓
Backend Validation:
    ├─ Verify submission token (consume it)
    ├─ Check for duplicates (email/phone)
    ├─ [Optional] Verify reCAPTCHA score
    └─ If all pass → Process registration
    ↓
Clear localStorage + Reset Zustand
    ↓
Replace history state
    ↓
Redirect to Success Page
    ↓
Prevent back navigation
```

---

## 🔑 Current Status:

- ✅ **Submission Token System**: Implemented
- ✅ **Duplicate Check**: Implemented
- ✅ **State Clearing**: Implemented
- ✅ **Back Navigation Prevention**: Implemented
- ⏳ **Bot Protection**: Optional (instructions provided)

---

## 🚀 Recommendation:

For production, I recommend adding **Google reCAPTCHA v3** because:
1. It's invisible (no user friction)
2. It's free for most use cases
3. It's widely trusted
4. Easy to implement (5 minutes)

However, the current security measures (token system + duplicate check + back prevention) are **already very effective** against:
- Accidental double submissions ✅
- Browser back button resubmissions ✅
- Direct API calls without going through form ✅
- Email/phone duplicates ✅

Bot protection adds an additional layer but is not strictly required if you monitor submissions manually.

---

## 📧 Support:

If you need help setting up reCAPTCHA or have questions about security, let me know!

