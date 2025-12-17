#!/usr/bin/env node

/**
 * Decode a registration token to see what data it contains
 * Usage: node scripts/decode-token.js <token>
 */

const token = process.argv[2];

if (!token) {
  console.log("❌ Usage: node scripts/decode-token.js <token>");
  console.log("\nExample:");
  console.log("  node scripts/decode-token.js eyJmaXJzdE5hbWUiOiJTb25hIi4uLg==");
  process.exit(1);
}

try {
  // Decode base64 token
  const decoded = Buffer.from(token, 'base64').toString('utf-8');
  const data = JSON.parse(decoded);
  
  console.log("\n✅ Token Decoded Successfully:\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("First Name:      ", data.firstName);
  console.log("Last Name:       ", data.lastName);
  console.log("Email:           ", data.email);
  console.log("Phone:           ", data.phone);
  console.log("Marital Status:  ", data.maritalStatus);
  console.log("Expires At:      ", new Date(data.expiresAt).toLocaleString());
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  // Check if expired
  if (data.expiresAt < Date.now()) {
    console.log("\n⚠️  Token is EXPIRED!");
  } else {
    const daysLeft = Math.floor((data.expiresAt - Date.now()) / (1000 * 60 * 60 * 24));
    console.log(`\n✅ Token is valid (${daysLeft} days remaining)`);
  }
  
  console.log("\n📋 Full JSON:");
  console.log(JSON.stringify(data, null, 2));
  console.log();
  
} catch (error) {
  console.error("❌ Failed to decode token:", error.message);
  process.exit(1);
}

