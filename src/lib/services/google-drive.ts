import { Readable } from "stream";
import { getDriveClient } from "./google-oauth";
import { findFolderByUser, saveFolderMapping } from "../db/folder-mappings";

// Check OAuth configuration
if (!process.env.GOOGLE_OAUTH_CLIENT_ID || !process.env.GOOGLE_OAUTH_CLIENT_SECRET) {
  console.warn("⚠️ Google OAuth credentials not configured");
}

if (!process.env.GOOGLE_OAUTH_REFRESH_TOKEN) {
  console.warn("⚠️ Google OAuth refresh token not configured");
  console.warn("   Visit: http://localhost:3000/api/auth/google/authorize to authorize");
}

// Initialize Google Drive API with OAuth 2.0
const drive = getDriveClient();

/**
 * Create a folder in Google Drive (or find existing one) inside the shared parent folder
 */
export async function createDriveFolder(folderName: string, parentFolderId?: string): Promise<string> {
  try {
    const parent = parentFolderId || process.env.GOOGLE_DRIVE_FOLDER_ID;
    
    if (!parent) {
      throw new Error("No parent folder ID specified");
    }

    // Check if folder already exists in parent
    const searchResponse = await drive.files.list({
      q: `name='${folderName}' and '${parent}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: "files(id, name)",
      spaces: "drive",
    });

    if (searchResponse.data.files && searchResponse.data.files.length > 0) {
      console.log("📁 Folder already exists:", folderName);
      return searchResponse.data.files[0].id!;
    }

    // Create new folder inside the shared parent folder
    const folderMetadata = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parent],
    };

    console.log(`📁 Creating folder "${folderName}" in parent ${parent}`);
    const response = await drive.files.create({
      requestBody: folderMetadata,
      fields: "id, name, webViewLink",
    });

    console.log("✅ Created new folder:", folderName, "ID:", response.data.id);
    return response.data.id!;
  } catch (error) {
    console.error("❌ Error creating Drive folder:", error);
    if (error instanceof Error) {
      console.error("   Message:", error.message);
    }
    throw new Error("Failed to create Google Drive folder");
  }
}

/**
 * Upload file to specific folder
 */
export async function uploadToFolder(
  folderId: string,
  fileName: string,
  fileBuffer: Buffer,
  mimeType: string = "application/pdf"
): Promise<string> {
  try {
    console.log(`📤 Uploading file "${fileName}" to folder ${folderId}`);
    console.log(`📊 File size: ${fileBuffer.length} bytes`);
    
    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };

    const media = {
      mimeType,
      body: Readable.from(fileBuffer),
    };

    console.log("🔄 Creating file in Drive...");
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: "id, name, size, webViewLink, webContentLink",
    });

    console.log("✅ File created:");
    console.log(`   - ID: ${response.data.id}`);
    console.log(`   - Name: ${response.data.name}`);
    console.log(`   - Size: ${response.data.size} bytes`);

    // Make file accessible to anyone with link
    console.log("🔐 Setting permissions...");
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });
    console.log("✅ Permissions set");

    return response.data.webViewLink || response.data.id || "";
  } catch (error) {
    console.error("❌ Error uploading file to folder:", error);
    if (error instanceof Error) {
      console.error("   Message:", error.message);
    }
    throw new Error("Failed to upload file to Google Drive folder");
  }
}

/**
 * Create a subfolder for the client and upload file
 * With OAuth 2.0, we can create subfolders without quota issues
 * Structure: dris_contracts/FirstName_LastName_Phone/Contract.pdf
 */
export async function createFolderAndUpload(
  folderName: string,
  fileName: string,
  fileBuffer: Buffer,
  mimeType: string = "application/pdf"
): Promise<{ folderLink: string; fileLink: string; folderId: string }> {
  try {
    const parentFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    
    if (!parentFolderId) {
      throw new Error("GOOGLE_DRIVE_FOLDER_ID not configured in environment");
    }

    console.log(`📂 Working with parent folder: ${parentFolderId}`);

    // 1. Create or get client's subfolder inside the main folder
    console.log(`📁 Creating subfolder: ${folderName}`);
    const clientFolderId = await createDriveFolder(folderName, parentFolderId);

    // 2. Get subfolder link
    const folderResponse = await drive.files.get({
      fileId: clientFolderId,
      fields: "webViewLink",
    });

    const folderLink = folderResponse.data.webViewLink || "";
    console.log(`📁 Client folder link: ${folderLink}`);

    // 3. Upload file to the client's subfolder
    const fileLink = await uploadToFolder(clientFolderId, fileName, fileBuffer, mimeType);

    return {
      folderId: clientFolderId,
      folderLink,
      fileLink,
    };
  } catch (error) {
    console.error("❌ Error in createFolderAndUpload:", error);
    if (error instanceof Error) {
      console.error("   Message:", error.message);
    }
    throw new Error("Failed to create folder and upload file");
  }
}

/**
 * Find or create client folder using database mapping
 * This is used for registration submissions to find existing folder from payment
 */
export async function findOrCreateClientFolder(
  firstName: string,
  lastName: string,
  email: string,
  phone: string
): Promise<{ folderId: string; folderLink: string; isExisting: boolean }> {
  try {
    // 1. Check if folder exists in database mapping
    console.log(`🔍 Searching for existing folder: ${email} / ${phone}`);
    const existingMapping = await findFolderByUser(email, phone);

    if (existingMapping) {
      console.log(`✅ Found existing folder mapping for: ${email}`);
      console.log(`   Folder ID: ${existingMapping.folderId}`);
      
      // Get folder link
      const folderResponse = await drive.files.get({
        fileId: existingMapping.folderId,
        fields: "webViewLink",
      });

      return {
        folderId: existingMapping.folderId,
        folderLink: folderResponse.data.webViewLink || "",
        isExisting: true,
      };
    }

    // 2. No mapping found - create new folder
    console.log(`📁 No existing folder found, creating new one...`);
    const folderName = `${firstName}_${lastName}_${phone}`;
    const parentFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!parentFolderId) {
      throw new Error("GOOGLE_DRIVE_FOLDER_ID not configured");
    }

    const clientFolderId = await createDriveFolder(folderName, parentFolderId);

    // Get folder link
    const folderResponse = await drive.files.get({
      fileId: clientFolderId,
      fields: "webViewLink",
    });

    const folderLink = folderResponse.data.webViewLink || "";

    // 3. Save mapping to database
    await saveFolderMapping({
      email,
      folderId: clientFolderId,
      folderName,
      firstName,
      lastName,
      phone,
      createdAt: new Date().toISOString(),
      registrationSubmitted: false,
    });

    console.log(`✅ Created and saved new folder mapping: ${folderName}`);

    return {
      folderId: clientFolderId,
      folderLink,
      isExisting: false,
    };
  } catch (error) {
    console.error("❌ Error in findOrCreateClientFolder:", error);
    throw new Error("Failed to find or create client folder");
  }
}

/**
 * Upload multiple files to a specific folder
 */
export async function uploadMultipleFiles(
  folderId: string,
  files: { name: string; buffer: Buffer; mimeType: string }[]
): Promise<string[]> {
  try {
    const uploadPromises = files.map(file =>
      uploadToFolder(folderId, file.name, file.buffer, file.mimeType)
    );

    const fileLinks = await Promise.all(uploadPromises);
    console.log(`✅ Uploaded ${files.length} files to folder ${folderId}`);

    return fileLinks;
  } catch (error) {
    console.error("❌ Error uploading multiple files:", error);
    throw new Error("Failed to upload files to folder");
  }
}

/**
 * Legacy function - uploads to root folder
 */
export async function uploadToDrive(
  fileName: string,
  fileBuffer: Buffer,
  mimeType: string = "application/pdf"
): Promise<string> {
  try {
    const fileMetadata = {
      name: fileName,
      parents: process.env.GOOGLE_DRIVE_FOLDER_ID
        ? [process.env.GOOGLE_DRIVE_FOLDER_ID]
        : [],
    };

    const media = {
      mimeType,
      body: Readable.from(fileBuffer),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: "id, webViewLink",
    });

    return response.data.webViewLink || response.data.id || "";
  } catch (error) {
    console.error("Error uploading to Google Drive:", error);
    throw new Error("Failed to upload file to Google Drive");
  }
}
