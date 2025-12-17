#!/usr/bin/env node
/**
 * Development Script: Clear Test Data
 * 
 * Clears all test data from file-based databases
 * USE ONLY IN DEVELOPMENT!
 */

const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '..', '.db');
const REGISTRATIONS_FILE = path.join(DB_DIR, 'registrations.json');
const FOLDER_MAPPINGS_FILE = path.join(DB_DIR, 'folder-mappings.json');

console.log('🧹 Clearing test data...\n');

// Clear registrations
if (fs.existsSync(REGISTRATIONS_FILE)) {
  const data = JSON.parse(fs.readFileSync(REGISTRATIONS_FILE, 'utf8'));
  console.log(`📋 Found ${data.length} registration(s)`);
  fs.writeFileSync(REGISTRATIONS_FILE, '[]', 'utf8');
  console.log('✅ Registrations cleared');
} else {
  console.log('⚠️  No registrations file found');
}

// Clear folder mappings
if (fs.existsSync(FOLDER_MAPPINGS_FILE)) {
  const data = JSON.parse(fs.readFileSync(FOLDER_MAPPINGS_FILE, 'utf8'));
  console.log(`📁 Found ${data.length} folder mapping(s)`);
  fs.writeFileSync(FOLDER_MAPPINGS_FILE, '[]', 'utf8');
  console.log('✅ Folder mappings cleared');
} else {
  console.log('⚠️  No folder mappings file found');
}

console.log('\n✨ Test data cleared successfully!');
console.log('💡 You can now test the registration flow from scratch.');
console.log('\n⚠️  Note: If your browser still shows old form data:');
console.log('   1. Open browser DevTools (F12)');
console.log('   2. Go to Application/Storage tab');
console.log('   3. Clear localStorage: "drsi-registration-form"');
console.log('   4. Or run: localStorage.removeItem("drsi-registration-form")');
console.log('   5. Refresh the page\n');

