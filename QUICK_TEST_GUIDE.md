# 🧪 Quick Test Guide - Registration Form

Quick testing checklist for all recent fixes.

---

## 🚀 Before Testing:

### 1. Clear Everything:

**Terminal:**
```bash
npm run clear-test-data
```

**Browser Console (F12):**
```javascript
localStorage.clear();
location.reload();
```

### 2. Start Dev Server:

```bash
npm run dev
```

---

## ✅ Test Checklist:

### Test 1: Form Data Persistence ⭐ NEW FIX

**What to test:** Step 1 data persists on browser back

**Steps:**
```
1. Open: http://localhost:3000/register
2. Fill Step 1:
   - First Name: Karen
   - Last Name: Misakyan
   - Email: test@gmail.com
   - Phone: +972123456789
   - DOB: 01/15/1990
   - Gender: Male
   - City: Jerusalem
   - Country: Israel
   - Address: 123 Main St
   - Education: University

3. Click "Continue"
4. Check console: "✅ Step 1: Saving data to store"
5. Browser Back Button
6. Check console: "📝 Step 1: Syncing form with store"
7. ✅ ALL fields should be filled
```

**Expected:** ✅ All data persists  
**Actual:** _________

---

### Test 2: Step 2 Persistence ⭐ NEW FIX

**What to test:** Marital status and spouse info persist

**Steps:**
```
1. Complete Step 1 → Continue
2. Step 2: Select "Married"
3. Fill spouse info:
   - Full Name: Jane Doe
   - DOB: 05/20/1992
   - Gender: Female
   - City: Tel Aviv
   - Country: Israel
   - Education: Masters

4. Click "Continue"
5. Check console: "✅ Step 2: Saving spouse info"
6. Browser Back
7. Check console: "📝 Step 2: Syncing spouse form with store"
8. ✅ Marital status should be "Married"
9. ✅ Spouse fields should be filled
```

**Expected:** ✅ Marital status + spouse info persist  
**Actual:** _________

---

### Test 3: Step 3 Child Count ⭐ NEW FIX

**What to test:** Number of children persists

**Steps:**
```
1. Complete Steps 1 & 2 → Continue
2. Step 3: Enter number: 2
3. Fill 2 children forms
4. Click "Continue"
5. Browser Back
6. Check console: "📝 Step 3: Syncing child count from store: 2"
7. ✅ Should show "2" in number input
8. ✅ Should show 2 child forms
```

**Expected:** ✅ Child count and data persist  
**Actual:** _________

---

### Test 4: Browser Refresh (localStorage)

**What to test:** State persists after page refresh

**Steps:**
```
1. Fill Steps 1, 2, 3
2. Reach Step 4
3. Press F5 (Refresh)
4. ✅ Should still be on Step 4
5. Browser Back to Step 1
6. ✅ All Step 1 data should be there
```

**Expected:** ✅ State restored from localStorage  
**Actual:** _________

---

### Test 5: Auto-Reset to Step 1 ⭐ PREVIOUS FIX

**What to test:** Public users start at Step 1

**Steps:**
```
1. Fill form, reach Step 5
2. Close browser
3. Open: http://localhost:3000/register (no token)
4. Check console: "🔄 Resetting from step X to step 1"
5. ✅ Should start at Step 1
```

**Expected:** ✅ Auto-reset to Step 1  
**Actual:** _________

---

### Test 6: Token Pre-fill ⭐ PREVIOUS FIX

**What to test:** Authenticated users get pre-filled data

**Steps:**
```
1. Complete payment flow first
2. Get email with registration link
3. Click link: /register?token=xxx
4. ✅ Step 1: Name, email, phone should be filled
5. ✅ Step 2: Marital status should be selected
6. Fill remaining fields
7. Continue to Steps 3, 4, 5
8. Browser Back
9. ✅ All data should persist
```

**Expected:** ✅ Token data + edits persist  
**Actual:** _________

---

### Test 7: Marital Status Display ⭐ PREVIOUS FIX

**What to test:** Marital status shows correctly

**Steps:**
```
1. Fill form with "Married"
2. Reach Step 5 (Review)
3. Check Marital Status section
4. ✅ Should show: "Status: Married"
5. NOT: "Status: married_to_citizen"
```

**Expected:** ✅ Human-readable format  
**Actual:** _________

---

### Test 8: Children Documents ⭐ PREVIOUS FIX

**What to test:** Children docs show in PDF

**Steps:**
```
1. Fill form with 2 children
2. Step 4: Upload docs for Child 1 & 2
3. Step 5: Review
4. Check Documents section
5. ✅ Should list Child 1 documents
6. ✅ Should list Child 2 documents
7. Submit
8. Check PDF
9. ✅ Children section should be in PDF
```

**Expected:** ✅ Children docs in PDF  
**Actual:** _________

---

### Test 9: No Double Submission ⭐ PREVIOUS FIX

**What to test:** Submission token prevents duplicates

**Steps:**
```
1. Fill form completely
2. Reach Step 5
3. Wait for token generation
4. ✅ Submit button should be enabled
5. Click "Submit Application"
6. ✅ Success!
7. Browser Back (if possible)
8. Try to submit again
9. ✅ Should see error: "already submitted"
```

**Expected:** ✅ Token prevents double submission  
**Actual:** _________

---

### Test 10: Database Clear ⭐ PREVIOUS FIX

**What to test:** Test data can be cleared

**Steps:**
```
1. Submit a registration
2. Try to register again with same email
3. ✅ Should see "already submitted" error
4. Run: npm run clear-test-data
5. Check console output
6. Try to register again
7. ✅ Should work now
```

**Expected:** ✅ Database cleared successfully  
**Actual:** _________

---

## 🎯 Quick Summary:

| Test | Feature | Status |
|------|---------|--------|
| 1 | Step 1 persistence | ⭐ NEW FIX |
| 2 | Step 2 persistence | ⭐ NEW FIX |
| 3 | Step 3 persistence | ⭐ NEW FIX |
| 4 | localStorage restore | ✅ Should work |
| 5 | Auto-reset public users | ⭐ PREVIOUS FIX |
| 6 | Token pre-fill | ⭐ PREVIOUS FIX |
| 7 | Marital status display | ⭐ PREVIOUS FIX |
| 8 | Children in PDF | ⭐ PREVIOUS FIX |
| 9 | No double submission | ⭐ PREVIOUS FIX |
| 10 | Database clear | ⭐ PREVIOUS FIX |

---

## 📋 Testing Notes:

### Console Logs to Look For:

**Step 1:**
- `📝 Step 1: Syncing form with store`
- `✅ Step 1: Saving data to store`

**Step 2:**
- `📝 Step 2: Pre-filled marital status from token`
- `📝 Step 2: Syncing spouse form with store`
- `✅ Step 2: Saving marital status`
- `✅ Step 2: Saving spouse info`

**Step 3:**
- `📝 Step 3: Syncing child count from store`

**Step 5:**
- `🎫 Submission token generated`
- `🔒 Admin: Deleted X registration(s)`

---

## ⚠️ Known Issues:

None currently! All major bugs fixed.

---

## 🚨 If Tests Fail:

### Issue: Fields still empty after back button

**Solution:**
1. Clear browser cache
2. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
3. Clear localStorage: `localStorage.clear()`
4. Restart dev server

### Issue: "Already submitted" error when testing

**Solution:**
```bash
npm run clear-test-data

# Then in browser:
localStorage.clear();
location.reload();
```

### Issue: Form jumps to wrong step

**Solution:**
```javascript
// Browser console:
localStorage.removeItem("drsi-registration-form");
location.reload();
```

---

## 📚 Related Documentation:

- `BUGFIX_FORM_STATE_PERSISTENCE.md` - Form persistence fix
- `BUGFIX_STEP_JUMP.md` - Auto-reset fix
- `BUGFIX_MARITAL_STATUS_AND_TOKEN.md` - Marital status & token fix
- `BUGFIX_CHILDREN_DOCUMENTS.md` - Children docs fix
- `SECURITY_IMPROVEMENTS_COMPLETE.md` - Double submission fix
- `DATABASE_MANAGEMENT.md` - Database clear guide

---

**Happy Testing! 🎉**

