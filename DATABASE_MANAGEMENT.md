# 💾 Database Management Guide

## 📁 File-Based Database:

Location: `.db/`
- `registrations.json` - All registration submissions
- `folder-mappings.json` - Email/phone → Google Drive folder mapping

---

## 🧹 Clear Test Data (Development)

### Method 1: NPM Script (Recommended)

```bash
npm run clear-test-data
```

**What it does:**
- Clears all registrations
- Clears all folder mappings
- Resets database to empty state

**Use case:**
- Testing registration flow from scratch
- Cleaning up test data
- Development/debugging

---

### Method 2: Manual Delete

```bash
# Delete registrations
echo "[]" > .db/registrations.json

# Delete folder mappings
echo "[]" > .db/folder-mappings.json
```

---

## 🔑 Admin API (Production)

### Setup Admin Key

Add to `.env.local`:
```bash
ADMIN_API_KEY=your-secure-random-key-here
```

**Generate secure key:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### Delete Specific Registration

**Endpoint:** `POST /api/admin/clear-registration`

**Request:**
```bash
curl -X POST http://localhost:3000/api/admin/clear-registration \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "adminKey": "your-admin-key"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Deleted 2 registration(s) for user@example.com",
  "deletedCount": 2,
  "remainingCount": 10
}
```

**Use case:**
- User requests data deletion
- Duplicate entries cleanup
- Testing specific user flow

---

### Clear ALL Registrations

**Endpoint:** `DELETE /api/admin/clear-registration`

**⚠️ DANGEROUS - Deletes ALL data!**

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/admin/clear-registration \
  -H "Content-Type: application/json" \
  -d '{
    "adminKey": "your-admin-key",
    "confirm": true
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Cleared all 50 registration(s)",
  "deletedCount": 50
}
```

**Use case:**
- Complete database reset
- Staging environment cleanup
- **⚠️ NEVER use in production without backup!**

---

## 📊 View Database Contents

### Method 1: Direct File Read

```bash
# View registrations
cat .db/registrations.json | jq

# View folder mappings
cat .db/folder-mappings.json | jq
```

### Method 2: Node Script

```javascript
// scripts/view-database.js
const fs = require('fs');
const path = require('path');

const registrations = JSON.parse(
  fs.readFileSync('.db/registrations.json', 'utf8')
);

console.log('Total registrations:', registrations.length);
console.log('Submitted:', registrations.filter(r => r.used).length);
console.log('Pending tokens:', registrations.filter(r => !r.used).length);

registrations.forEach(r => {
  console.log(`\n${r.registrationId}:`);
  console.log(`  Email: ${r.email}`);
  console.log(`  Status: ${r.used ? 'Submitted ✅' : 'Token only ⏳'}`);
  console.log(`  Date: ${new Date(r.submittedAt).toLocaleString()}`);
});
```

---

## 🔍 Common Issues & Solutions

### Issue 1: "Registration already submitted" error

**Cause:** Database has entry with `used: true` for same email/phone

**Solutions:**

**A. Development (Testing):**
```bash
npm run clear-test-data
```

**B. Production (Specific User):**
```bash
curl -X POST http://localhost:3000/api/admin/clear-registration \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "adminKey": "your-key"}'
```

**C. Manual:**
1. Open `.db/registrations.json`
2. Find and remove entries with matching email
3. Save file

---

### Issue 2: Duplicate registrations

**Cause:** User reached Step 5 multiple times (browser back)

**Prevention:** ✅ Already implemented - `removeUnusedRegistration()` function

**Cleanup:**
```bash
# Development
npm run clear-test-data

# Production
# Use admin API to delete duplicates
```

---

### Issue 3: Orphaned tokens (used: false)

**Cause:** User reached Step 5 but never submitted

**Automatic Cleanup:** ✅ Already implemented
- Tokens expire after 1 hour
- Automatic cleanup runs every hour

**Manual Cleanup:**
```javascript
// Remove unused tokens older than 1 hour
const oneHourAgo = Date.now() - 60 * 60 * 1000;
registrations = registrations.filter(r => 
  r.used || r.submittedAt > oneHourAgo
);
```

---

## 📈 Database Statistics

### Quick Stats Script

```bash
# Count total registrations
cat .db/registrations.json | jq 'length'

# Count submitted
cat .db/registrations.json | jq '[.[] | select(.used == true)] | length'

# Count pending tokens
cat .db/registrations.json | jq '[.[] | select(.used == false)] | length'

# List all emails
cat .db/registrations.json | jq -r '.[].email' | sort | uniq
```

---

## 🔒 Security Best Practices

### 1. Admin Key Security

**✅ Good:**
- Use strong random key (32+ characters)
- Store in `.env.local` (not committed to Git)
- Different key for each environment
- Rotate periodically

**❌ Bad:**
- Default key in code
- Shared across environments
- Committed to Git

### 2. Production Safeguards

**Before deleting data:**
1. Backup database file
2. Verify admin key
3. Require confirmation flag
4. Log all deletions

**Backup script:**
```bash
#!/bin/bash
# Backup database before clearing
timestamp=$(date +%Y%m%d_%H%M%S)
cp .db/registrations.json ".db/backups/registrations_$timestamp.json"
echo "✅ Backup created: registrations_$timestamp.json"
```

---

## 🧪 Testing Workflow

### Recommended Testing Flow:

```bash
# 1. Clear previous test data
npm run clear-test-data

# 2. Start dev server
npm run dev

# 3. Test registration flow
# - Fill form
# - Reach Step 5
# - Check database
cat .db/registrations.json | jq

# 4. Submit registration
# - Complete submission
# - Verify used: true

# 5. Test duplicate prevention
# - Try to register again with same email
# - Should see error ✅

# 6. Clear for next test
npm run clear-test-data
```

---

## 📦 Backup & Restore

### Manual Backup

```bash
# Create backup
mkdir -p .db/backups
cp .db/registrations.json .db/backups/registrations_$(date +%Y%m%d).json
cp .db/folder-mappings.json .db/backups/folder-mappings_$(date +%Y%m%d).json
```

### Restore from Backup

```bash
# Restore specific backup
cp .db/backups/registrations_20241217.json .db/registrations.json
```

### Automated Backup (Cron)

```bash
# Add to crontab
# Backup daily at 2 AM
0 2 * * * cd /path/to/project && ./scripts/backup-database.sh
```

---

## 🚨 Emergency Recovery

### If Database Corrupted:

```bash
# 1. Check if file exists
ls -lh .db/registrations.json

# 2. Try to parse JSON
cat .db/registrations.json | jq '.'

# 3. If corrupted, restore from backup
cp .db/backups/registrations_latest.json .db/registrations.json

# 4. If no backup, initialize empty
echo "[]" > .db/registrations.json
```

---

## 📝 Summary

### Development:
```bash
npm run clear-test-data  # Clear all test data
```

### Production:
```bash
# Delete specific user
curl -X POST /api/admin/clear-registration \
  -d '{"email": "user@example.com", "adminKey": "..."}'

# Backup before clearing
cp .db/registrations.json .db/backups/pre-clear-$(date +%s).json

# Clear all (DANGEROUS!)
curl -X DELETE /api/admin/clear-registration \
  -d '{"adminKey": "...", "confirm": true}'
```

---

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Clear test data | `npm run clear-test-data` |
| View registrations | `cat .db/registrations.json \| jq` |
| Count entries | `cat .db/registrations.json \| jq 'length'` |
| Delete by email | `POST /api/admin/clear-registration` |
| Clear all | `DELETE /api/admin/clear-registration` |
| Backup | `cp .db/*.json .db/backups/` |

---

**For help:** See this file or contact admin

