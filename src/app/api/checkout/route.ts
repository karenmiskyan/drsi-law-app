import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { ContactInfo, MaritalStatus } from "@/stores/registrationStore";
import { storeSignature } from "@/lib/signature-store";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      maritalStatus,
      contactInfo,
      signature,
      amount,
    }: {
      maritalStatus: MaritalStatus;
      contactInfo: ContactInfo;
      signature: string;
      amount: number;
    } = body;

    console.log("Checkout request received:", {
      maritalStatus,
      email: contactInfo?.email,
      amount,
      hasSignature: !!signature,
      signatureLength: signature?.length || 0,
    });

    // Validate required fields
    if (!maritalStatus || !contactInfo || !signature || !amount) {
      console.error("Missing required fields:", { maritalStatus, contactInfo: !!contactInfo, signature: !!signature, amount });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Store signature separately (too large for Stripe metadata - max 500 chars)
    // We'll retrieve it from storage in the webhook
    const signatureId = `sig_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    storeSignature(signatureId, signature);
    console.log("✅ Signature stored with ID:", signatureId);
    
    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "DRSI Law - Immigration Lottery Registration",
              description: `Registration for ${contactInfo.firstName} ${contactInfo.lastName}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
      customer_email: contactInfo.email,
      metadata: {
        maritalStatus,
        firstName: contactInfo.firstName,
        lastName: contactInfo.lastName,
        email: contactInfo.email,
        phone: contactInfo.phone,
        signatureId, // Reference to signature
        amount: amount.toString(),
      },
      // Store signature in client_reference_id (up to 200 chars) - we'll use first 200 chars as preview
      client_reference_id: signatureId,
    });

    console.log("Checkout session created:", session.id);
    
    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    
    // More detailed error message
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorDetails = error instanceof Error && 'raw' in error 
      ? JSON.stringify((error as any).raw) 
      : "";
    
    console.error("Error details:", errorMessage, errorDetails);
    
    return NextResponse.json(
      { 
        error: "Failed to create checkout session",
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}

