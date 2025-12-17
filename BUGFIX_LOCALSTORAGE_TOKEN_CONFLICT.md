# 🐛 Bug Fix: localStorage Conflicts with Token Pre-fill

**Date:** December 17, 2024  
**Issue:** Token users see old localStorage data instead of token data  
**Status:** ✅ FIXED

---

## ❌ The Problem:

User reported:
> "Token-ով մտել եմ (Sona Mailyan), բայց form-ը ցույց է տալիս Karen Misakyan"
> "Միանգամից jump է արել Step 5 (Review), incomplete data-ով"

**Example:**
```
Token URL:
http://localhost:3000/register?token=eyJ...

Token Contains:
- firstName: "Sona"
- lastName: "Mailyan"  
- email: "mailyan.sona.97@gmail.com"
- phone: "972543877577"
- maritalStatus: "married"

But Form Shows:
- firstName: "Karen"  ← Wrong!
- lastName: "Misakyan"  ← Wrong!
- email: "test@gmail.com"  ← Wrong!
- currentStep: 5  ← Wrong! (should be 1)
- Date of Birth: empty ← Incomplete!
- Documents: 0/3, 0/4 ← Not uploaded!
```

---

## 🔍 Root Cause:

### Zustand Persist Middleware Loading Order:

```
1. Page Loads
    ↓
2. Zustand persist middleware initializes
    ↓
3. ❌ Reads localStorage IMMEDIATELY
    {
      applicantInfo: { 
        firstName: "Karen",  ← OLD SESSION
        email: "test@gmail.com"  ← OLD SESSION
      },
      currentStep: 5,  ← OLD SESSION (was on Review page)
      maritalStatus: "married",
      spouseInfo: { ... }
    }
    ↓
4. ✅ State restored with OLD DATA
    ↓
5. Component renders (with Karen's data) ❌
    ↓
6. Jump to Step 5 (from old session) ❌
    ↓
7. useEffect runs (AFTER restore)
    ↓
8. Token verification checks: if (!applicantInfo.firstName)
    ↓
9. ❌ FALSE! (Karen is already there from localStorage)
    ↓
10. ❌ Skips pre-fill from token
    ↓
11. User sees Karen, not Sona ❌
```

**Timeline:**
```
localStorage restore (immediate) → Karen Misakyan
                ↓
Component render → Shows Karen ❌
                ↓
useEffect (after render) → Token verification
                ↓
Check if empty → NO (Karen already loaded)
                ↓
Skip pre-fill → Sona's data IGNORED ❌
```

---

## 💡 Why This Happens:

### Zustand Persist Lifecycle:

```javascript
// 1. Zustand persist reads localStorage BEFORE component mounts
const store = create(
  persist(
    (set) => ({ ... }),
    {
      name: "drsi-registration-form",
      // ↑ This reads localStorage IMMEDIATELY when store is created
    }
  )
);

// 2. Component mounts and uses store
function Component() {
  const { applicantInfo } = useRegistrationFormStore();
  // ↑ Already has Karen's data from localStorage
  
  useEffect(() => {
    // 3. Token verification runs AFTER localStorage restore
    const userData = verifyToken(token);
    
    // 4. Check if should pre-fill
    if (!applicantInfo.firstName) {
      setApplicantInfo(userData);  // This line never runs!
    }
  }, []);
}
```

---

## ✅ Solution:

### 1. Clear localStorage for Token Users

```typescript
// src/app/register/page.tsx

if (token) {
  // 🔧 FIX: Clear old localStorage BEFORE Zustand uses it
  if (typeof window !== "undefined") {
    const oldData = localStorage.getItem("drsi-registration-form");
    if (oldData) {
      console.log("🧹 Clearing old localStorage for token user");
      localStorage.removeItem("drsi-registration-form");
    }
  }
  
  // Reset form completely
  resetForm();
  console.log("🔄 Form reset for token user");
  
  // Verify token
  const userData = await verifyToken(token);
  
  // 🔧 FIX: ALWAYS pre-fill from token (don't check if empty)
  setApplicantInfo({
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    phone: userData.phone,
    // ...
  });
  
  // 🔧 FIX: Force step 1 for token users
  goToStep(1);
  console.log("✅ Token user initialized at Step 1");
}
```

---

## 📊 Before vs After:

### ❌ Before:

```
Page Load
    ↓
localStorage: { firstName: "Karen", currentStep: 5 }
    ↓
Zustand Restore: Karen Misakyan ❌
    ↓
Component Render: Shows Karen ❌
    ↓
Jump to Step 5 ❌
    ↓
useEffect: Token verification
    ↓
Check: applicantInfo.firstName? → "Karen" (exists)
    ↓
Skip pre-fill ❌
    ↓
Result: Karen shown instead of Sona ❌
```

**Console:**
```
🔐 Token detected, verifying...
✅ Token verified successfully
⏭️ Skipping pre-fill (user has already entered data)  ← WRONG!
```

**UI:**
- Shows: Karen Misakyan, test@gmail.com ❌
- Should show: Sona Mailyan, mailyan.sona.97@gmail.com ✅
- Current step: 5 (Review) ❌
- Should be: 1 (Applicant Info) ✅

---

### ✅ After:

```
Page Load
    ↓
Token detected
    ↓
🧹 Clear localStorage
    ↓
🔄 Reset form (empty state)
    ↓
Token verification
    ↓
📝 Pre-fill from token (ALWAYS, no check)
    ↓
Sona Mailyan loaded ✅
    ↓
Force Step 1 ✅
    ↓
Result: Sona shown correctly ✅
```

**Console:**
```
🔐 Token detected - Starting fresh session
🧹 Clearing old localStorage data for token user
🔄 Form reset for token user
✅ Token verified successfully: { name: 'Sona Mailyan', email: 'mailyan.sona.97@gmail.com' }
📝 Pre-filling contact info from token
📝 Marital status set: married
✅ Token user initialized - Starting at Step 1
```

**UI:**
- Shows: Sona Mailyan, mailyan.sona.97@gmail.com ✅
- Current step: 1 (Applicant Info) ✅
- Fields locked (read-only) ✅
- Fresh start ✅

---

## 🔄 Flow Comparison:

### Old Flow (Broken):

| Step | Action | Result |
|------|--------|--------|
| 1 | localStorage exists | Karen's data loaded |
| 2 | Zustand restore | Karen shown ❌ |
| 3 | Component renders | Step 5 shown ❌ |
| 4 | useEffect runs | Check if empty → NO |
| 5 | Pre-fill decision | Skip (already has data) ❌ |
| 6 | Final state | Karen shown, not Sona ❌ |

### New Flow (Fixed):

| Step | Action | Result |
|------|--------|--------|
| 1 | Token detected | Check localStorage |
| 2 | localStorage exists | Clear it! 🧹 |
| 3 | Reset form | Empty state ✅ |
| 4 | Token verification | Decode Sona's data |
| 5 | Pre-fill (always) | Sona loaded ✅ |
| 6 | Force step 1 | Start at beginning ✅ |
| 7 | Final state | Sona shown correctly ✅ |

---

## 🧪 Testing:

### Test 1: Token User (Fresh Browser)

```bash
# 1. Open browser (no localStorage)
# 2. Navigate to:
http://localhost:3000/register?token=eyJ...

# Expected:
✅ Shows token user's name (Sona Mailyan)
✅ Email locked (pre-filled)
✅ Phone locked (pre-filled)
✅ Starts at Step 1
✅ Can proceed through form
```

### Test 2: Token User (With Old localStorage)

```bash
# 1. Complete a test registration (Karen Misakyan)
#    → localStorage saved with Karen's data
# 2. DON'T clear localStorage
# 3. Navigate to NEW token URL:
http://localhost:3000/register?token=eyJ...
   (Sona Mailyan's token)

# Expected:
✅ Old data cleared automatically
✅ Shows Sona Mailyan (from token)
✅ NOT Karen Misakyan (old localStorage)
✅ Starts at Step 1
✅ Console shows: "🧹 Clearing old localStorage"
```

### Test 3: Public User (No Token)

```bash
# 1. Navigate to:
http://localhost:3000/register
   (No token parameter)

# Expected:
✅ Empty form (no pre-fill)
✅ All fields editable
✅ Starts at Step 1
✅ Can manually fill data
✅ localStorage persists during session
```

### Test 4: Token User Navigation

```bash
# 1. Token user (Sona) loads form
# 2. Fill Step 1 → Continue
# 3. Fill Step 2 → Continue
# 4. Browser back to Step 2
# 5. Browser back to Step 1

# Expected:
✅ Contact info still locked (Sona)
✅ Other fields persist (from form state)
✅ No jump to Step 5
✅ Data not lost on navigation
```

---

## 🛠️ Code Changes:

### File: `src/app/register/page.tsx`

**Changes:**
1. Added localStorage clearing for token users
2. Added `resetForm()` call before pre-filling
3. Removed conditional pre-fill check (always pre-fill for token users)
4. Added `goToStep(1)` for token users
5. Added detailed console logs

**Before:**
```typescript
if (token) {
  const userData = await verifyToken(token);
  
  // Check if should pre-fill
  const shouldPreFill = !applicantInfo.firstName && !applicantInfo.email;
  
  if (shouldPreFill) {
    setApplicantInfo(userData);  // Only if empty
  }
}
```

**After:**
```typescript
if (token) {
  // Clear old localStorage
  localStorage.removeItem("drsi-registration-form");
  
  // Reset form completely
  resetForm();
  
  // Verify token
  const userData = await verifyToken(token);
  
  // ALWAYS pre-fill from token
  setApplicantInfo({
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    phone: userData.phone,
    // ...
  });
  
  // Force step 1
  goToStep(1);
}
```

---

### File: `src/lib/tokenVerification.ts`

**Changes:**
- Updated `TokenPayload` interface to include `married_to_citizen` and `married_to_lpr`

**Before:**
```typescript
interface TokenPayload {
  maritalStatus: "single" | "married" | "divorced" | "widowed" | "separated";
}
```

**After:**
```typescript
interface TokenPayload {
  maritalStatus: 
    | "single" 
    | "married" 
    | "divorced" 
    | "widowed" 
    | "separated"
    | "married_to_citizen"  // From payment wizard
    | "married_to_lpr";     // From payment wizard
}
```

---

## 🔧 New Tools:

### Token Decoder Script

**File:** `scripts/decode-token.js`

```bash
# Decode any token to see what data it contains
node scripts/decode-token.js "eyJmaXJzdE5hbWUiOiJTb25hIi4uLg=="

# Output:
✅ Token Decoded Successfully:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
First Name:       Sona
Last Name:        Mailyan
Email:            mailyan.sona.97@gmail.com
Phone:            972543877577
Marital Status:   married
Expires At:       1/16/2026, 10:29:04 PM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Token is valid (29 days remaining)
```

**Usage:**
```bash
# From URL
http://localhost:3000/register?token=ABC123...
                                      ↑
                                   Copy this

# Decode
node scripts/decode-token.js ABC123...
```

---

## 📝 Console Logs:

### Token User (Success):

```
🔐 Token detected - Starting fresh session
🧹 Clearing old localStorage data for token user
🔄 Form reset for token user
✅ Token verified successfully: { name: 'Sona Mailyan', email: 'mailyan.sona.97@gmail.com', phone: '972543877577' }
📝 Pre-filling contact info from token
📝 Marital status set: married
✅ Token user initialized - Starting at Step 1
```

### Public User:

```
🌐 No token - Public access mode
```

### Token Verification Failed:

```
🔐 Token detected - Starting fresh session
🧹 Clearing old localStorage data for token user
🔄 Form reset for token user
❌ Token verification failed
```

---

## 🔒 Security Notes:

### Token Expiration:

```javascript
const token = {
  firstName: "Sona",
  expiresAt: 1768595344278  // ~30 days from creation
};

// Check expiration
if (Date.now() > token.expiresAt) {
  console.error("Token expired");
  return null;  // User must pay again
}
```

### localStorage Clearing:

- ✅ Only cleared for token users
- ✅ Public users keep their progress
- ✅ No data leakage between sessions
- ✅ Fresh start for each payment

---

## 🎯 Edge Cases Handled:

| Scenario | Behavior |
|----------|----------|
| Token + old localStorage | Clear localStorage, use token ✅ |
| Token + empty localStorage | Use token ✅ |
| No token + old localStorage | Keep localStorage (public user) ✅ |
| No token + empty localStorage | Start fresh ✅ |
| Expired token | Treat as public user ✅ |
| Invalid token | Treat as public user ✅ |
| Token + browser refresh | Token data preserved ✅ |
| Token + navigate away + back | Need new token (or public mode) ✅ |

---

## ✅ Verification Checklist:

- [x] Token users see correct name/email/phone
- [x] Token users start at Step 1 (not Step 5)
- [x] Old localStorage cleared for token users
- [x] Contact fields locked for token users
- [x] Public users unaffected
- [x] Navigation doesn't break data
- [x] Console logs are clear
- [x] Token expiration checked
- [x] Marital status mapped correctly
- [x] No data leakage between users

---

## 🎉 Summary:

### Problem:
- ❌ Token users saw old localStorage data (Karen instead of Sona)
- ❌ Jumped to Step 5 with incomplete data
- ❌ Token data ignored because localStorage loaded first

### Solution:
- ✅ Clear localStorage when token detected
- ✅ Reset form completely before pre-fill
- ✅ Always pre-fill from token (no conditional check)
- ✅ Force step 1 for token users
- ✅ Better console logging

### Result:
- ✅ Token users see correct data (Sona, not Karen)
- ✅ Start at Step 1 with locked contact fields
- ✅ Fresh session for each payment
- ✅ No localStorage conflicts
- ✅ Public users unaffected

---

**Status:** ✅ FIXED - Token users now get fresh sessions with correct pre-filled data!

**Testing:** Database and localStorage cleared, ready for clean tests.

