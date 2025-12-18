/**
 * Vercel KV-based Signature Store
 * 
 * Uses Redis for persistent storage compatible with Vercel's read-only filesystem.
 * Keys: signature:{id} - stores signature data with automatic expiration
 */

import { kv } from "@vercel/kv";

interface SignatureData {
  signature: string;
  timestamp: number;
}

const SIGNATURE_KEY_PREFIX = "signature:";
const MAX_AGE_SECONDS = 60 * 60; // 1 hour in seconds

/**
 * Store a signature in Vercel KV
 * @param id - Unique identifier for the signature
 * @param signature - Base64 encoded signature data
 */
export async function storeSignature(id: string, signature: string): Promise<void> {
  try {
    const data: SignatureData = {
      signature,
      timestamp: Date.now(),
    };

    // Store with automatic expiration (EX = expire in seconds)
    await kv.set(`${SIGNATURE_KEY_PREFIX}${id}`, data, { ex: MAX_AGE_SECONDS });
    console.log("💾 Signature stored in KV:", id);
  } catch (error) {
    console.error("❌ Failed to store signature:", error);
    throw error;
  }
}

/**
 * Retrieve a signature from Vercel KV
 * @param id - Unique identifier for the signature
 * @returns The signature string or null if not found/expired
 */
export async function getSignature(id: string): Promise<string | null> {
  try {
    const data = await kv.get<SignatureData>(`${SIGNATURE_KEY_PREFIX}${id}`);

    if (!data) {
      console.log("⚠️ Signature not found in KV:", id);
      return null;
    }

    // Check if manually expired (belt and suspenders with Redis TTL)
    const maxAgeMs = MAX_AGE_SECONDS * 1000;
    if (Date.now() - data.timestamp > maxAgeMs) {
      await deleteSignature(id);
      console.log("⚠️ Signature expired:", id);
      return null;
    }

    console.log("✅ Signature retrieved from KV:", id);
    return data.signature;
  } catch (error) {
    console.error("❌ Failed to retrieve signature:", error);
    return null;
  }
}

/**
 * Delete a signature from Vercel KV
 * @param id - Unique identifier for the signature
 */
export async function deleteSignature(id: string): Promise<void> {
  try {
    await kv.del(`${SIGNATURE_KEY_PREFIX}${id}`);
    console.log("🗑️ Signature deleted from KV:", id);
  } catch (error) {
    console.error("❌ Failed to delete signature:", error);
  }
}

/**
 * Get the count of stored signatures (for monitoring)
 * Note: This scans keys which may be slow with many keys
 */
export async function getStoreSize(): Promise<number> {
  try {
    const keys = await kv.keys(`${SIGNATURE_KEY_PREFIX}*`);
    return keys.length;
  } catch (error) {
    console.error("❌ Failed to get store size:", error);
    return 0;
  }
}

/**
 * Manual cleanup function - not typically needed since Redis handles TTL
 * @returns Number of signatures cleaned up
 */
export async function forceCleanup(): Promise<number> {
  try {
    const keys = await kv.keys(`${SIGNATURE_KEY_PREFIX}*`);
    let cleaned = 0;
    const now = Date.now();
    const maxAgeMs = MAX_AGE_SECONDS * 1000;

    for (const key of keys) {
      const data = await kv.get<SignatureData>(key);
      if (data && now - data.timestamp > maxAgeMs) {
        await kv.del(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired signature(s)`);
    }

    return cleaned;
  } catch (error) {
    console.error("❌ Failed to cleanup signatures:", error);
    return 0;
  }
}
