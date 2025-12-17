// Test Google Drive Connection
// Run: node test-drive.js

require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

async function testDrive() {
  console.log('🔍 Testing Google Drive connection...\n');

  try {
    // Check credentials
    if (!process.env.GOOGLE_DRIVE_CLIENT_EMAIL) {
      throw new Error('❌ GOOGLE_DRIVE_CLIENT_EMAIL not found in .env.local');
    }
    if (!process.env.GOOGLE_DRIVE_PRIVATE_KEY) {
      throw new Error('❌ GOOGLE_DRIVE_PRIVATE_KEY not found in .env.local');
    }
    if (!process.env.GOOGLE_DRIVE_FOLDER_ID) {
      throw new Error('❌ GOOGLE_DRIVE_FOLDER_ID not found in .env.local');
    }

    console.log('✅ Environment variables found');
    console.log('📧 Service Account:', process.env.GOOGLE_DRIVE_CLIENT_EMAIL);
    console.log('📁 Folder ID:', process.env.GOOGLE_DRIVE_FOLDER_ID);
    console.log('');

    // Create auth
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Test: Get folder info
    console.log('🔄 Fetching folder info...');
    const folder = await drive.files.get({
      fileId: process.env.GOOGLE_DRIVE_FOLDER_ID,
      fields: 'id, name, webViewLink',
    });

    console.log('✅ SUCCESS! Connected to Google Drive');
    console.log('📁 Folder Name:', folder.data.name);
    console.log('🔗 Folder Link:', folder.data.webViewLink);
    console.log('');
    console.log('✨ You\'re all set! Google Drive integration is working.');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('');
    console.error('Common issues:');
    console.error('1. Make sure you shared the folder with service account email');
    console.error('2. Check that private key has \\n characters preserved');
    console.error('3. Verify folder ID is correct (from URL)');
    console.error('4. Ensure Google Drive API is enabled in Google Cloud Console');
  }
}

testDrive();

