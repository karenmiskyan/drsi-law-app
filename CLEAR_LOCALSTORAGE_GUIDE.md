# 🧹 Clear localStorage Guide

Quick reference for clearing form state during development/testing.

---

## 🚀 Quick Commands:

### Option 1: Browser Console (Fastest)

Open DevTools (F12), paste in Console:

```javascript
localStorage.removeItem("drsi-registration-form");
location.reload();
```

### Option 2: DevTools UI

1. **F12** → Open DevTools
2. **Application** tab (Chrome) or **Storage** tab (Firefox)
3. **Local Storage** → Click your domain
4. Find **"drsi-registration-form"**
5. **Right-click** → **Delete**
6. **Refresh** page (F5)

### Option 3: Clear All localStorage

```javascript
localStorage.clear();
location.reload();
```

---

## 📋 Common Issues & Solutions:

### Issue 1: Form Jumps to Wrong Step

**Symptom:** Opening `/register` goes to Step 5 instead of Step 1

**Solution:**
```javascript
localStorage.removeItem("drsi-registration-form");
location.reload();
```

✅ **Auto-Fixed:** Page now auto-resets to Step 1 for public users (no token)

---

### Issue 2: Old Form Data Shows Up

**Symptom:** See data from previous test in form fields

**Solution:**
```javascript
// Clear registration form
localStorage.removeItem("drsi-registration-form");

// Also clear payment wizard if testing payment flow
localStorage.removeItem("drsi-payment-wizard");

location.reload();
```

---

### Issue 3: After Running `npm run clear-test-data`

**Issue:** Database cleared but form still has old data

**Why:** `npm run clear-test-data` clears server database, NOT browser localStorage

**Solution:**
```bash
# 1. Clear server database
npm run clear-test-data

# 2. Clear browser localStorage
# Open browser console (F12), run:
localStorage.removeItem("drsi-registration-form");
location.reload();
```

---

## 🔍 Inspect Current State:

### Check What's Stored:

```javascript
// View registration form state
const state = JSON.parse(localStorage.getItem("drsi-registration-form") || "{}");
console.table({
  "Current Step": state.state?.currentStep,
  "First Name": state.state?.applicantInfo?.firstName,
  "Last Name": state.state?.applicantInfo?.lastName,
  "Email": state.state?.applicantInfo?.email,
  "Phone": state.state?.applicantInfo?.phone,
  "Marital Status": state.state?.maritalStatus,
});
```

### List All localStorage Keys:

```javascript
console.log("localStorage keys:", Object.keys(localStorage));
console.log("Total items:", localStorage.length);
```

### View Full State:

```javascript
Object.keys(localStorage).forEach(key => {
  console.log(`\n${key}:`);
  console.log(JSON.parse(localStorage.getItem(key)));
});
```

---

## 🎯 Testing Workflow:

### Recommended Testing Flow:

```bash
# 1. Clear everything
npm run clear-test-data  # Server database
# Then in browser console:
localStorage.clear();
location.reload();

# 2. Test registration
# Fill form → Submit → Success ✓

# 3. Test again (repeat from step 1)
```

---

## 🔧 Advanced: Clear Specific Fields

### Clear Only Current Step:

```javascript
const state = JSON.parse(localStorage.getItem("drsi-registration-form"));
if (state?.state) {
  state.state.currentStep = 1;
  localStorage.setItem("drsi-registration-form", JSON.stringify(state));
  location.reload();
}
```

### Clear Only Applicant Info:

```javascript
const state = JSON.parse(localStorage.getItem("drsi-registration-form"));
if (state?.state) {
  state.state.applicantInfo = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    // ... reset all fields
  };
  localStorage.setItem("drsi-registration-form", JSON.stringify(state));
  location.reload();
}
```

---

## 📱 Mobile Testing:

### iOS Safari:

1. Open Safari Settings
2. Advanced → Web Inspector
3. Connect to Mac, open Safari DevTools
4. Run same console commands

### Android Chrome:

1. Enable USB Debugging
2. chrome://inspect on desktop
3. Select device
4. Run console commands

---

## 🚨 Production Warning:

**⚠️ NEVER clear user's localStorage in production!**

These commands are for **development/testing ONLY**.

In production:
- Let users complete their forms
- localStorage saves their progress (good UX)
- Only clear after successful submission

---

## 📚 Quick Reference Table:

| Task | Command |
|------|---------|
| Clear registration form | `localStorage.removeItem("drsi-registration-form")` |
| Clear payment wizard | `localStorage.removeItem("drsi-payment-wizard")` |
| Clear everything | `localStorage.clear()` |
| Check current step | `JSON.parse(localStorage.getItem("drsi-registration-form")).state.currentStep` |
| Count items | `localStorage.length` |
| List all keys | `Object.keys(localStorage)` |
| Reload page | `location.reload()` |

---

## 🎓 Understanding Zustand Persist:

### Structure:

```json
{
  "state": {
    "currentStep": 5,
    "applicantInfo": {
      "firstName": "Karen",
      "lastName": "Misakyan",
      ...
    },
    "maritalStatus": "married",
    ...
  },
  "version": 0
}
```

### What's Persisted:

- ✅ Current step
- ✅ Applicant info
- ✅ Marital status
- ✅ Spouse info
- ✅ Children info
- ❌ Documents (files can't be serialized)

---

## 💡 Pro Tips:

### Tip 1: Create Bookmark

Create browser bookmark with this JavaScript:

```javascript
javascript:(function(){localStorage.removeItem("drsi-registration-form");alert("Cleared!");location.reload();})();
```

Name it: "🧹 Clear DRSI Form"

### Tip 2: Keyboard Shortcut

**Chrome/Edge:** No built-in shortcut, use bookmark

**Firefox:** `Shift + F9` → Storage Inspector → Clear

### Tip 3: Auto-Clear on Dev Server Start

Add to `package.json`:

```json
"scripts": {
  "dev": "npm run clear-test-data && next dev",
}
```

---

## ✅ Checklist for Clean Testing:

- [ ] Run `npm run clear-test-data`
- [ ] Open browser console (F12)
- [ ] Run `localStorage.clear()`
- [ ] Reload page (F5)
- [ ] Verify Step 1 shows
- [ ] Start testing

---

**For questions, see:** `BUGFIX_STEP_JUMP.md` or `DATABASE_MANAGEMENT.md`

