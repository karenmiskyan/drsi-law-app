import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session_id parameter" },
        { status: 400 }
      );
    }

    console.log("🔍 Fetching session data for:", sessionId);

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    console.log("✅ Session retrieved:", {
      id: session.id,
      email: session.customer_email,
      metadata: session.metadata,
    });

    // Return relevant session data
    return NextResponse.json({
      id: session.id,
      customer_email: session.customer_email,
      amount_total: session.amount_total,
      currency: session.currency,
      payment_status: session.payment_status,
      metadata: session.metadata,
    });
  } catch (error: any) {
    console.error("❌ Error fetching session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch session data" },
      { status: 500 }
    );
  }
}

