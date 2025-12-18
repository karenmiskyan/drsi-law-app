/**
 * Vercel KV-based Registration Store
 * 
 * Uses Redis for persistent storage compatible with Vercel's read-only filesystem.
 * Keys:
 * - registration:{id} - Individual registration data
 * - registrations:index - Set of all registration IDs
 */

import { kv } from "@vercel/kv";

export interface Registration {
  registrationId: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  submittedAt: number;
  folderId?: string;
  submissionToken: string; // One-time use token
  used: boolean; // Token used flag
}

const REGISTRATIONS_INDEX_KEY = "registrations:index";
const REGISTRATION_KEY_PREFIX = "registration:";

/**
 * Get a single registration by ID
 */
export async function getRegistration(id: string): Promise<Registration | null> {
  try {
    const registration = await kv.get<Registration>(`${REGISTRATION_KEY_PREFIX}${id}`);
    return registration;
  } catch (error) {
    console.error("Error getting registration:", error);
    return null;
  }
}

/**
 * Save a registration
 */
export async function saveRegistration(id: string, data: Registration): Promise<void> {
  try {
    await kv.set(`${REGISTRATION_KEY_PREFIX}${id}`, data);
    // Add to index set
    await kv.sadd(REGISTRATIONS_INDEX_KEY, id);
    console.log(`💾 Saved registration: ${id}`);
  } catch (error) {
    console.error("Error saving registration:", error);
    throw error;
  }
}

/**
 * Get all registrations
 */
export async function getAllRegistrations(): Promise<Registration[]> {
  try {
    // Get all registration IDs from the index
    const ids = await kv.smembers(REGISTRATIONS_INDEX_KEY);
    
    if (!ids || ids.length === 0) {
      return [];
    }

    // Fetch all registrations in parallel
    const registrations = await Promise.all(
      ids.map(async (id) => {
        const reg = await kv.get<Registration>(`${REGISTRATION_KEY_PREFIX}${id}`);
        return reg;
      })
    );

    // Filter out null values
    return registrations.filter((r): r is Registration => r !== null);
  } catch (error) {
    console.error("Error getting all registrations:", error);
    return [];
  }
}

/**
 * Add a new registration
 */
export async function addRegistration(registration: Registration): Promise<void> {
  await saveRegistration(registration.registrationId, registration);
}

/**
 * Delete a registration
 */
export async function deleteRegistration(id: string): Promise<void> {
  try {
    await kv.del(`${REGISTRATION_KEY_PREFIX}${id}`);
    await kv.srem(REGISTRATIONS_INDEX_KEY, id);
    console.log(`🗑️ Deleted registration: ${id}`);
  } catch (error) {
    console.error("Error deleting registration:", error);
    throw error;
  }
}

/**
 * Remove unused registration token (for regeneration)
 */
export async function removeUnusedRegistration(email: string, phone: string): Promise<void> {
  try {
    const allRegistrations = await getAllRegistrations();
    
    for (const reg of allRegistrations) {
      if ((reg.email.toLowerCase() === email.toLowerCase() || reg.phone === phone) && !reg.used) {
        await deleteRegistration(reg.registrationId);
        console.log(`🗑️ Removed unused token for ${email}`);
      }
    }
  } catch (error) {
    console.error("Error removing unused registration:", error);
  }
}

/**
 * Check if email or phone already has a submitted registration
 */
export async function hasExistingRegistration(email: string, phone: string): Promise<Registration | undefined> {
  try {
    const allRegistrations = await getAllRegistrations();
    
    return allRegistrations.find(r => 
      (r.email.toLowerCase() === email.toLowerCase() || r.phone === phone) && r.used
    );
  } catch (error) {
    console.error("Error checking existing registration:", error);
    return undefined;
  }
}

/**
 * Verify and consume submission token (one-time use)
 */
export async function verifySubmissionToken(token: string, email: string, phone: string): Promise<boolean> {
  try {
    const allRegistrations = await getAllRegistrations();
    
    const registration = allRegistrations.find(r => 
      r.submissionToken === token && 
      r.email.toLowerCase() === email.toLowerCase() &&
      r.phone === phone &&
      !r.used
    );
    
    if (registration) {
      // Mark token as used
      registration.used = true;
      await saveRegistration(registration.registrationId, registration);
      console.log(`✅ Submission token verified and consumed for ${email}`);
      return true;
    }
    
    console.warn(`❌ Invalid or already used submission token for ${email}`);
    return false;
  } catch (error) {
    console.error("Error verifying submission token:", error);
    return false;
  }
}

/**
 * Get registration by email
 */
export async function getRegistrationByEmail(email: string): Promise<Registration | undefined> {
  try {
    const allRegistrations = await getAllRegistrations();
    return allRegistrations.find(r => r.email.toLowerCase() === email.toLowerCase());
  } catch (error) {
    console.error("Error getting registration by email:", error);
    return undefined;
  }
}

/**
 * Cleanup old unused tokens (older than 1 hour)
 * Note: On Vercel, this should be called via a cron job or during API calls
 */
export async function cleanupExpiredRegistrations(): Promise<number> {
  try {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const allRegistrations = await getAllRegistrations();
    let cleaned = 0;

    for (const reg of allRegistrations) {
      if (!reg.used && reg.submittedAt < oneHourAgo) {
        await deleteRegistration(reg.registrationId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired submission tokens`);
    }

    return cleaned;
  } catch (error) {
    console.error("Error cleaning up expired registrations:", error);
    return 0;
  }
}
