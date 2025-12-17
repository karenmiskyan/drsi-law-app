import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { generateTestToken } from "@/lib/tokenVerification";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia" as any,
});

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Extract user data from session metadata
    const metadata = session.metadata || {};
    const firstName = metadata.firstName || "";
    const lastName = metadata.lastName || "";
    const email = metadata.email || session.customer_details?.email || "";
    const phone = metadata.phone || "";
    const maritalStatus = metadata.maritalStatus || "";

    // Generate registration token
    const token = generateTestToken({
      firstName,
      lastName,
      email,
      phone,
      maritalStatus: maritalStatus as any,
    });

    return NextResponse.json({
      token,
      userData: {
        firstName,
        lastName,
        email,
        phone,
        maritalStatus,
      },
    });
  } catch (error) {
    console.error("Error generating registration token:", error);
    return NextResponse.json(
      { error: "Failed to generate registration token" },
      { status: 500 }
    );
  }
}

