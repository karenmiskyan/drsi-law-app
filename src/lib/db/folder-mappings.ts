/**
 * File-based Database for Google Drive Folder Mappings
 * 
 * Stores mapping between users and their Google Drive folders
 * Format: { email: folderId, ... }
 */

import fs from 'fs';
import path from 'path';

const DB_DIR = path.join(process.cwd(), '.db');
const FOLDER_MAPPINGS_FILE = path.join(DB_DIR, 'folder-mappings.json');

interface FolderMapping {
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

// Ensure DB directory exists
function ensureDbDir() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
    console.log('📁 Created .db directory');
  }
}

// Initialize mappings file if it doesn't exist
function initializeMappingsFile() {
  ensureDbDir();
  
  if (!fs.existsSync(FOLDER_MAPPINGS_FILE)) {
    fs.writeFileSync(FOLDER_MAPPINGS_FILE, JSON.stringify([], null, 2), 'utf8');
    console.log('📄 Created folder-mappings.json');
  }
}

// Read all mappings
export function getAllFolderMappings(): FolderMapping[] {
  try {
    initializeMappingsFile();
    const data = fs.readFileSync(FOLDER_MAPPINGS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading folder mappings:', error);
    return [];
  }
}

// Find folder by email
export function findFolderByEmail(email: string): FolderMapping | null {
  const mappings = getAllFolderMappings();
  return mappings.find(m => m.email.toLowerCase() === email.toLowerCase()) || null;
}

// Find folder by phone
export function findFolderByPhone(phone: string): FolderMapping | null {
  const mappings = getAllFolderMappings();
  return mappings.find(m => m.phone === phone) || null;
}

// Find folder by user data (email or phone)
export function findFolderByUser(email: string, phone: string): FolderMapping | null {
  // Try email first, then phone
  return findFolderByEmail(email) || findFolderByPhone(phone);
}

// Save folder mapping (create or update)
export function saveFolderMapping(mapping: FolderMapping): void {
  try {
    const mappings = getAllFolderMappings();
    
    // Check if mapping already exists (by email)
    const existingIndex = mappings.findIndex(m => m.email.toLowerCase() === mapping.email.toLowerCase());
    
    if (existingIndex >= 0) {
      // Update existing mapping
      mappings[existingIndex] = {
        ...mappings[existingIndex],
        ...mapping,
        createdAt: mappings[existingIndex].createdAt, // Keep original creation date
      };
      console.log(`📝 Updated folder mapping for: ${mapping.email}`);
    } else {
      // Add new mapping
      mappings.push({
        ...mapping,
        createdAt: mapping.createdAt || new Date().toISOString(),
      });
      console.log(`✅ Saved new folder mapping for: ${mapping.email}`);
    }
    
    // Write back to file
    fs.writeFileSync(FOLDER_MAPPINGS_FILE, JSON.stringify(mappings, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving folder mapping:', error);
    throw new Error('Failed to save folder mapping');
  }
}

// Mark registration as submitted
export function markRegistrationSubmitted(email: string): void {
  try {
    const mappings = getAllFolderMappings();
    const index = mappings.findIndex(m => m.email.toLowerCase() === email.toLowerCase());
    
    if (index >= 0) {
      mappings[index].registrationSubmitted = true;
      mappings[index].registrationDate = new Date().toISOString();
      
      fs.writeFileSync(FOLDER_MAPPINGS_FILE, JSON.stringify(mappings, null, 2), 'utf8');
      console.log(`✅ Marked registration submitted for: ${email}`);
    }
  } catch (error) {
    console.error('Error marking registration submitted:', error);
  }
}

// Get statistics
export function getFolderMappingStats() {
  const mappings = getAllFolderMappings();
  
  return {
    total: mappings.length,
    withPayment: mappings.filter(m => m.paymentSessionId).length,
    withRegistration: mappings.filter(m => m.registrationSubmitted).length,
    pending: mappings.filter(m => m.paymentSessionId && !m.registrationSubmitted).length,
  };
}

// Export for debugging
export function exportMappingsForDebug(): string {
  const mappings = getAllFolderMappings();
  return JSON.stringify(mappings, null, 2);
}

