/**
 * Vercel KV-based Database for Google Drive Folder Mappings
 * 
 * Uses Redis for persistent storage compatible with Vercel's read-only filesystem.
 * Keys:
 * - folder-mapping:{email} - Individual folder mapping data
 * - folder-mappings:index - Set of all mapping emails (for iteration)
 */

import { kv } from "@vercel/kv";

export interface FolderMapping {
  email: string;
  folderId: string;
  folderName: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: string;
  paymentSessionId?: string; // From payment
  registrationSubmitted?: boolean;
  registrationDate?: string;
}

const FOLDER_MAPPINGS_INDEX_KEY = "folder-mappings:index";
const FOLDER_MAPPING_KEY_PREFIX = "folder-mapping:";

/**
 * Get a folder mapping by email
 */
async function getFolderMapping(email: string): Promise<FolderMapping | null> {
  try {
    const mapping = await kv.get<FolderMapping>(`${FOLDER_MAPPING_KEY_PREFIX}${email.toLowerCase()}`);
    return mapping;
  } catch (error) {
    console.error("Error getting folder mapping:", error);
    return null;
  }
}

/**
 * Read all mappings
 */
export async function getAllFolderMappings(): Promise<FolderMapping[]> {
  try {
    // Get all emails from the index
    const emails = await kv.smembers(FOLDER_MAPPINGS_INDEX_KEY);
    
    if (!emails || emails.length === 0) {
      return [];
    }

    // Fetch all mappings in parallel
    const mappings = await Promise.all(
      emails.map(async (email) => {
        const mapping = await kv.get<FolderMapping>(`${FOLDER_MAPPING_KEY_PREFIX}${email}`);
        return mapping;
      })
    );

    // Filter out null values
    return mappings.filter((m): m is FolderMapping => m !== null);
  } catch (error) {
    console.error("Error reading folder mappings:", error);
    return [];
  }
}

/**
 * Find folder by email
 */
export async function findFolderByEmail(email: string): Promise<FolderMapping | null> {
  try {
    return await getFolderMapping(email);
  } catch (error) {
    console.error("Error finding folder by email:", error);
    return null;
  }
}

/**
 * Find folder by phone
 */
export async function findFolderByPhone(phone: string): Promise<FolderMapping | null> {
  try {
    const mappings = await getAllFolderMappings();
    return mappings.find(m => m.phone === phone) || null;
  } catch (error) {
    console.error("Error finding folder by phone:", error);
    return null;
  }
}

/**
 * Find folder by user data (email or phone)
 */
export async function findFolderByUser(email: string, phone: string): Promise<FolderMapping | null> {
  // Try email first (faster - direct lookup), then phone
  const byEmail = await findFolderByEmail(email);
  if (byEmail) return byEmail;
  
  return await findFolderByPhone(phone);
}

/**
 * Save folder mapping (create or update)
 */
export async function saveFolderMapping(mapping: FolderMapping): Promise<void> {
  try {
    const emailKey = mapping.email.toLowerCase();
    
    // Check if mapping already exists
    const existingMapping = await getFolderMapping(mapping.email);
    
    const dataToSave: FolderMapping = existingMapping 
      ? {
          ...existingMapping,
          ...mapping,
          createdAt: existingMapping.createdAt, // Keep original creation date
        }
      : {
          ...mapping,
          createdAt: mapping.createdAt || new Date().toISOString(),
        };

    // Save the mapping
    await kv.set(`${FOLDER_MAPPING_KEY_PREFIX}${emailKey}`, dataToSave);
    
    // Add to index set (if not already there)
    await kv.sadd(FOLDER_MAPPINGS_INDEX_KEY, emailKey);
    
    if (existingMapping) {
      console.log(`📝 Updated folder mapping for: ${mapping.email}`);
    } else {
      console.log(`✅ Saved new folder mapping for: ${mapping.email}`);
    }
  } catch (error) {
    console.error("Error saving folder mapping:", error);
    throw new Error("Failed to save folder mapping");
  }
}

/**
 * Delete a folder mapping
 */
export async function deleteFolderMapping(email: string): Promise<void> {
  try {
    const emailKey = email.toLowerCase();
    await kv.del(`${FOLDER_MAPPING_KEY_PREFIX}${emailKey}`);
    await kv.srem(FOLDER_MAPPINGS_INDEX_KEY, emailKey);
    console.log(`🗑️ Deleted folder mapping for: ${email}`);
  } catch (error) {
    console.error("Error deleting folder mapping:", error);
    throw error;
  }
}

/**
 * Mark registration as submitted
 */
export async function markRegistrationSubmitted(email: string): Promise<void> {
  try {
    const mapping = await getFolderMapping(email);
    
    if (mapping) {
      mapping.registrationSubmitted = true;
      mapping.registrationDate = new Date().toISOString();
      
      await kv.set(`${FOLDER_MAPPING_KEY_PREFIX}${email.toLowerCase()}`, mapping);
      console.log(`✅ Marked registration submitted for: ${email}`);
    } else {
      console.warn(`⚠️ No folder mapping found for: ${email}`);
    }
  } catch (error) {
    console.error("Error marking registration submitted:", error);
  }
}

/**
 * Get statistics
 */
export async function getFolderMappingStats(): Promise<{
  total: number;
  withPayment: number;
  withRegistration: number;
  pending: number;
}> {
  try {
    const mappings = await getAllFolderMappings();
    
    return {
      total: mappings.length,
      withPayment: mappings.filter(m => m.paymentSessionId).length,
      withRegistration: mappings.filter(m => m.registrationSubmitted).length,
      pending: mappings.filter(m => m.paymentSessionId && !m.registrationSubmitted).length,
    };
  } catch (error) {
    console.error("Error getting folder mapping stats:", error);
    return { total: 0, withPayment: 0, withRegistration: 0, pending: 0 };
  }
}

/**
 * Export for debugging
 */
export async function exportMappingsForDebug(): Promise<string> {
  try {
    const mappings = await getAllFolderMappings();
    return JSON.stringify(mappings, null, 2);
  } catch (error) {
    console.error("Error exporting mappings:", error);
    return "[]";
  }
}
