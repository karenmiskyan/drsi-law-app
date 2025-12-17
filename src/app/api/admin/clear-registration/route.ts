import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

const DB_DIR = path.join(process.cwd(), '.db');
const REGISTRATIONS_FILE = path.join(DB_DIR, 'registrations.json');

/**
 * Admin API: Delete a specific registration by email
 * 
 * POST /api/admin/clear-registration
 * Body: { email: "user@example.com", adminKey: "secret" }
 * 
 * ⚠️ USE WITH CAUTION - This deletes data permanently!
 */
export async function POST(req: NextRequest) {
  try {
    const { email, adminKey } = await req.json();

    // Simple admin authentication (use proper auth in production!)
    const ADMIN_KEY = process.env.ADMIN_API_KEY || "dev-admin-key-123";
    
    if (adminKey !== ADMIN_KEY) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Load registrations
    let registrations: any[] = [];
    if (fs.existsSync(REGISTRATIONS_FILE)) {
      const data = fs.readFileSync(REGISTRATIONS_FILE, 'utf8');
      registrations = JSON.parse(data);
    }

    const initialCount = registrations.length;
    
    // Filter out registrations with matching email
    registrations = registrations.filter(
      r => r.email.toLowerCase() !== email.toLowerCase()
    );

    const deletedCount = initialCount - registrations.length;

    // Save updated registrations
    fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify(registrations, null, 2), 'utf8');

    console.log(`🗑️ Admin: Deleted ${deletedCount} registration(s) for ${email}`);

    return NextResponse.json({
      success: true,
      message: `Deleted ${deletedCount} registration(s) for ${email}`,
      deletedCount,
      remainingCount: registrations.length,
    });
  } catch (error: any) {
    console.error("❌ Error clearing registration:", error);
    return NextResponse.json(
      { error: error.message || "Failed to clear registration" },
      { status: 500 }
    );
  }
}

/**
 * Admin API: Clear ALL registrations
 * 
 * DELETE /api/admin/clear-registration
 * Body: { adminKey: "secret", confirm: true }
 * 
 * ⚠️ DANGEROUS - This deletes ALL registrations!
 */
export async function DELETE(req: NextRequest) {
  try {
    const { adminKey, confirm } = await req.json();

    // Simple admin authentication
    const ADMIN_KEY = process.env.ADMIN_API_KEY || "dev-admin-key-123";
    
    if (adminKey !== ADMIN_KEY) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!confirm) {
      return NextResponse.json(
        { error: "Please set confirm: true to clear all registrations" },
        { status: 400 }
      );
    }

    // Load current count
    let registrations: any[] = [];
    if (fs.existsSync(REGISTRATIONS_FILE)) {
      const data = fs.readFileSync(REGISTRATIONS_FILE, 'utf8');
      registrations = JSON.parse(data);
    }

    const deletedCount = registrations.length;

    // Clear all registrations
    fs.writeFileSync(REGISTRATIONS_FILE, '[]', 'utf8');

    console.log(`🗑️ Admin: Cleared ALL ${deletedCount} registration(s)`);

    return NextResponse.json({
      success: true,
      message: `Cleared all ${deletedCount} registration(s)`,
      deletedCount,
    });
  } catch (error: any) {
    console.error("❌ Error clearing all registrations:", error);
    return NextResponse.json(
      { error: error.message || "Failed to clear all registrations" },
      { status: 500 }
    );
  }
}

