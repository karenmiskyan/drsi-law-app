// Detailed Google Drive Diagnostic
require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

async function detailedTest() {
  console.log('🔍 Detailed Google Drive Diagnostic\n');

  try {
    // Setup auth
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({ version: 'v3', auth });

    console.log('📧 Service Account:', process.env.GOOGLE_DRIVE_CLIENT_EMAIL);
    console.log('📁 Target Folder ID:', process.env.GOOGLE_DRIVE_FOLDER_ID);
    console.log('');

    // Test 1: List all files/folders the service account can see
    console.log('🔍 Test 1: Listing all accessible files...');
    try {
      const listResponse = await drive.files.list({
        pageSize: 10,
        fields: 'files(id, name, mimeType, owners, permissions)',
      });

      if (listResponse.data.files.length === 0) {
        console.log('⚠️  No files found. Service account has no access to any files.');
        console.log('💡 Solution: Share a folder with the service account email\n');
      } else {
        console.log('✅ Found', listResponse.data.files.length, 'accessible files:');
        listResponse.data.files.forEach((file) => {
          console.log(`   - ${file.name} (${file.id})`);
          console.log(`     Type: ${file.mimeType}`);
        });
        console.log('');
      }
    } catch (error) {
      console.error('❌ List failed:', error.message);
    }

    // Test 2: Try to create a test folder in root
    console.log('🔍 Test 2: Creating test folder in root...');
    try {
      const folderMetadata = {
        name: 'DRSI_Test_' + Date.now(),
        mimeType: 'application/vnd.google-apps.folder',
      };

      const folder = await drive.files.create({
        requestBody: folderMetadata,
        fields: 'id, name, webViewLink',
      });

      console.log('✅ Successfully created test folder!');
      console.log('📁 Folder Name:', folder.data.name);
      console.log('🆔 Folder ID:', folder.data.id);
      console.log('🔗 Folder Link:', folder.data.webViewLink);
      console.log('');
      console.log('💡 Use this folder ID in your .env.local:');
      console.log(`GOOGLE_DRIVE_FOLDER_ID=${folder.data.id}`);
      console.log('');

      // Clean up: delete test folder
      await drive.files.delete({ fileId: folder.data.id });
      console.log('🧹 Test folder deleted\n');
    } catch (error) {
      console.error('❌ Create folder failed:', error.message);
      console.log('');
    }

    // Test 3: Try to access the specified folder
    if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
      console.log('🔍 Test 3: Accessing specified folder...');
      try {
        const folder = await drive.files.get({
          fileId: process.env.GOOGLE_DRIVE_FOLDER_ID,
          fields: 'id, name, webViewLink, permissions',
        });

        console.log('✅ SUCCESS! Can access the folder');
        console.log('📁 Folder Name:', folder.data.name);
        console.log('🔗 Folder Link:', folder.data.webViewLink);
        console.log('');
        console.log('✨ Everything is working correctly!');
      } catch (error) {
        console.error('❌ Cannot access folder:', error.message);
        console.log('');
        console.log('📝 Troubleshooting steps:');
        console.log('1. Open this link in your browser:');
        console.log(`   https://drive.google.com/drive/folders/${process.env.GOOGLE_DRIVE_FOLDER_ID}`);
        console.log('2. Click "Share" button');
        console.log('3. Add this email as Editor:');
        console.log(`   ${process.env.GOOGLE_DRIVE_CLIENT_EMAIL}`);
        console.log('4. Click "Send"');
        console.log('5. Wait 10-30 seconds and run this test again');
      }
    }

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
}

detailedTest();

