/**
 * File-system based signature store
 * More reliable than in-memory store for development with hot reload
 * In production, use Redis or a database
 */

import fs from "fs";
import path from "path";

interface SignatureData {
  signature: string;
  timestamp: number;
}

const SIGNATURES_DIR = path.join(process.cwd(), ".signatures");
const MAX_AGE = 60 * 60 * 1000; // 1 hour

// Ensure signatures directory exists
if (!fs.existsSync(SIGNATURES_DIR)) {
  fs.mkdirSync(SIGNATURES_DIR, { recursive: true });
}

// Clean up old signatures on startup
cleanupOldSignatures();

// Clean up old signatures periodically
setInterval(() => {
  cleanupOldSignatures();
}, 60 * 60 * 1000); // Every hour

function cleanupOldSignatures(): void {
  try {
    const files = fs.readdirSync(SIGNATURES_DIR);
    const now = Date.now();
    
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      
      const filePath = path.join(SIGNATURES_DIR, file);
      try {
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8")) as SignatureData;
        
        if (now - data.timestamp > MAX_AGE) {
          fs.unlinkSync(filePath);
          console.log("🧹 Cleaned up expired signature:", file);
        }
      } catch (error) {
        // If file is corrupted, delete it
        fs.unlinkSync(filePath);
      }
    }
  } catch (error) {
    console.error("Error cleaning up signatures:", error);
  }
}

export function storeSignature(id: string, signature: string): void {
  try {
    const data: SignatureData = {
      signature,
      timestamp: Date.now(),
    };
    
    const filePath = path.join(SIGNATURES_DIR, `${id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data), "utf-8");
    console.log("💾 Signature stored to file:", id);
  } catch (error) {
    console.error("❌ Failed to store signature:", error);
    throw error;
  }
}

export function getSignature(id: string): string | null {
  try {
    const filePath = path.join(SIGNATURES_DIR, `${id}.json`);
    
    if (!fs.existsSync(filePath)) {
      console.log("⚠️ Signature file not found:", id);
      return null;
    }
    
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8")) as SignatureData;
    
    // Check if expired
    if (Date.now() - data.timestamp > MAX_AGE) {
      fs.unlinkSync(filePath);
      console.log("⚠️ Signature expired:", id);
      return null;
    }
    
    console.log("✅ Signature retrieved from file:", id);
    return data.signature;
  } catch (error) {
    console.error("❌ Failed to retrieve signature:", error);
    return null;
  }
}

export function deleteSignature(id: string): void {
  try {
    const filePath = path.join(SIGNATURES_DIR, `${id}.json`);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("🗑️ Signature file deleted:", id);
    }
  } catch (error) {
    console.error("❌ Failed to delete signature:", error);
  }
}

