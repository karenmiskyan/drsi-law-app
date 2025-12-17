import fs from 'fs';
import path from 'path';

const DB_DIR = path.join(process.cwd(), '.db');
const REGISTRATIONS_FILE = path.join(DB_DIR, 'registrations.json');

// Ensure the .db directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR);
}

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

let registrations: Registration[] = [];

// Load registrations from file on startup
try {
  if (fs.existsSync(REGISTRATIONS_FILE)) {
    const data = fs.readFileSync(REGISTRATIONS_FILE, 'utf8');
    registrations = JSON.parse(data);
    console.log(`📦 Loaded ${registrations.length} registrations from database`);
  }
} catch (error) {
  console.error("Error loading registrations:", error);
}

// Save registrations to file
const saveRegistrations = () => {
  try {
    fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify(registrations, null, 2), 'utf8');
    console.log(`💾 Saved ${registrations.length} registrations to database`);
  } catch (error) {
    console.error("Error saving registrations:", error);
  }
};

/**
 * Add a new registration
 */
export function addRegistration(registration: Registration): void {
  registrations.push(registration);
  saveRegistrations();
}

/**
 * Remove unused registration token (for regeneration)
 */
export function removeUnusedRegistration(email: string, phone: string): void {
  const oldLength = registrations.length;
  registrations = registrations.filter(r => 
    !((r.email.toLowerCase() === email.toLowerCase() || r.phone === phone) && !r.used)
  );
  if (registrations.length < oldLength) {
    console.log(`🗑️ Removed unused token for ${email}`);
    saveRegistrations();
  }
}

/**
 * Check if email or phone already has a submitted registration
 */
export function hasExistingRegistration(email: string, phone: string): Registration | undefined {
  return registrations.find(r => 
    (r.email.toLowerCase() === email.toLowerCase() || r.phone === phone) && r.used
  );
}

/**
 * Verify and consume submission token (one-time use)
 */
export function verifySubmissionToken(token: string, email: string, phone: string): boolean {
  const registration = registrations.find(r => 
    r.submissionToken === token && 
    r.email.toLowerCase() === email.toLowerCase() &&
    r.phone === phone &&
    !r.used
  );
  
  if (registration) {
    // Mark token as used
    registration.used = true;
    saveRegistrations();
    console.log(`✅ Submission token verified and consumed for ${email}`);
    return true;
  }
  
  console.warn(`❌ Invalid or already used submission token for ${email}`);
  return false;
}

/**
 * Get registration by email
 */
export function getRegistrationByEmail(email: string): Registration | undefined {
  return registrations.find(r => r.email.toLowerCase() === email.toLowerCase());
}

/**
 * Get all registrations
 */
export function getAllRegistrations(): Registration[] {
  return [...registrations];
}

/**
 * Cleanup old unused tokens (older than 1 hour)
 */
setInterval(() => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const oldLength = registrations.length;
  registrations = registrations.filter(r => r.used || r.submittedAt > oneHourAgo);
  if (registrations.length < oldLength) {
    console.log(`🧹 Cleaned up ${oldLength - registrations.length} expired submission tokens`);
    saveRegistrations();
  }
}, 60 * 60 * 1000); // Run every hour

