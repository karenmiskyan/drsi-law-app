import { NextResponse } from "next/server";
import { getAuthorizationUrl } from "@/lib/services/google-oauth";

/**
 * Start OAuth authorization flow
 * Visit this URL to authorize the app: http://localhost:3000/api/auth/google/authorize
 */
export async function GET() {
  try {
    const authUrl = getAuthorizationUrl();
    
    // Redirect to Google's authorization page
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Error generating auth URL:", error);
    return NextResponse.json(
      { error: "Failed to generate authorization URL" },
      { status: 500 }
    );
  }
}

