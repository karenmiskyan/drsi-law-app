import { NextRequest, NextResponse } from "next/server";
import { addRegistration, hasExistingRegistration, removeUnusedRegistration } from "@/lib/db/registrations";
import { v4 as uuidv4 } from "uuid";

/**
 * Generate a one-time submission token
 * Called when user reaches Step 5 (Review page)
 */
export async function POST(req: NextRequest) {
  try {
    const { email, phone, firstName, lastName } = await req.json();

    if (!email || !phone || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if already submitted (used=true)
    const existing = await hasExistingRegistration(email, phone);
    if (existing) {
      console.log(`⚠️ Registration already submitted for ${email} (ID: ${existing.registrationId})`);
      return NextResponse.json(
        { 
          error: "Registration already submitted",
          registrationId: existing.registrationId,
          submittedAt: new Date(existing.submittedAt).toLocaleString(),
        },
        { status: 409 } // Conflict
      );
    }

    // Remove any old unused tokens for this email/phone (e.g., from previous Step 5 visit)
    await removeUnusedRegistration(email, phone);

    // Generate unique submission token
    const submissionToken = uuidv4();
    const registrationId = `REG-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Store in database (not yet used)
    await addRegistration({
      registrationId,
      email,
      phone,
      firstName,
      lastName,
      submittedAt: Date.now(),
      submissionToken,
      used: false, // Will be set to true on actual submission
    });

    console.log(`🎫 Generated submission token for ${email}: ${submissionToken.substring(0, 8)}...`);

    return NextResponse.json({
      success: true,
      submissionToken,
      registrationId,
    });
  } catch (error) {
    console.error("❌ Error generating submission token:", error);
    return NextResponse.json(
      { error: "Failed to generate submission token" },
      { status: 500 }
    );
  }
}
