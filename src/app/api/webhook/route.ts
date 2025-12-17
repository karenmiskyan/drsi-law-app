import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { generateContractPDF } from "@/lib/services/pdf-generator";
import { generatePaymentReceiptPDF } from "@/lib/services/payment-receipt-generator";
import { createFolderAndUpload, uploadToFolder } from "@/lib/services/google-drive";
import { createMondayItem } from "@/lib/services/monday";
import { sendWelcomeEmail } from "@/lib/services/email";
import { getSignature, deleteSignature } from "@/lib/signature-store";
import { calculateServiceFee } from "@/lib/pricing";
import { saveFolderMapping } from "@/lib/db/folder-mappings";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined");
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error("STRIPE_WEBHOOK_SECRET is not defined");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      // Extract metadata
      const metadata = session.metadata;
      if (!metadata) {
        throw new Error("Missing metadata in session");
      }

      const {
        firstName,
        lastName,
        email,
        phone,
        maritalStatus,
        signatureId,
        amount,
      } = metadata;

      // Retrieve signature from storage (don't delete yet - we'll use it multiple times)
      const signature = signatureId ? getSignature(signatureId) : null;
      if (!signature) {
        console.warn("⚠️ Signature not found in storage for signatureId:", signatureId);
      } else {
        console.log("✅ Signature retrieved successfully");
      }

      console.log(`Processing payment for ${firstName} ${lastName}`);

      // 1. Generate PDF Contract
      const contractData = {
        firstName,
        lastName,
        email,
        phone,
        maritalStatus: maritalStatus as any,
        amount,
        signature: signature || "", // Use empty string if signature not found
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      };

      const pdfBuffer = await generateContractPDF(contractData);
      console.log("✅ PDF contract generated (post-payment)");

      // 2. Create client folder and upload Contract PDF to Google Drive
      const folderName = `${firstName}_${lastName}_${phone}`;
      const contractFileName = `Contract_${firstName}_${lastName}_${Date.now()}.pdf`;
      let driveLink = "";
      let folderLink = "";
      let clientFolderId = "";
      
      try {
        console.log("📁 Creating folder and uploading contract to Google Drive...");
        const driveResult = await createFolderAndUpload(
          folderName,
          contractFileName,
          pdfBuffer
        );
        driveLink = driveResult.fileLink;
        folderLink = driveResult.folderLink;
        clientFolderId = driveResult.folderId;
        console.log("✅ Contract uploaded to Google Drive");
        console.log("📁 Client Folder:", folderLink);
        console.log("📄 Contract Link:", driveLink);

        // Save folder mapping to database for future registration submissions
        console.log("💾 Saving folder mapping to database...");
        saveFolderMapping({
          email,
          folderId: clientFolderId,
          folderName,
          firstName,
          lastName,
          phone,
          createdAt: new Date().toISOString(),
          paymentSessionId: session.id,
          registrationSubmitted: false,
        });
        console.log("✅ Folder mapping saved to database");
      } catch (error) {
        console.error("❌ Failed to upload contract to Google Drive:", error);
        // Continue processing even if Drive upload fails
      }

      // 3. Generate and upload Payment Receipt to the same folder
      try {
        console.log("🧾 Generating payment receipt...");
        
        // Get payment details from Stripe
        let paymentMethod = "Credit Card";
        let stripeReceiptUrl = "";
        
        if (session.payment_intent) {
          try {
            const paymentIntent = await stripe.paymentIntents.retrieve(
              session.payment_intent as string,
              {
                expand: ['charges'], // Expand charges to get full charge data
              }
            ) as any; // Cast to any to access expanded charges
            
            // Get receipt URL if available
            if (paymentIntent.charges && 
                paymentIntent.charges.data && 
                paymentIntent.charges.data.length > 0) {
              stripeReceiptUrl = paymentIntent.charges.data[0].receipt_url || "";
            }
            
            // Get payment method type
            if (paymentIntent.payment_method) {
              const pm = await stripe.paymentMethods.retrieve(
                paymentIntent.payment_method as string
              );
              paymentMethod = pm.type === "card" ? "Credit Card" : 
                            pm.type === "us_bank_account" ? "Bank Account" :
                            pm.type.charAt(0).toUpperCase() + pm.type.slice(1);
            }
          } catch (error) {
            console.error("⚠️ Failed to retrieve payment details:", error);
            // Continue with default values
          }
        }

        const serviceFee = calculateServiceFee(maritalStatus as any);
        const governmentFee = "1.00";
        
        const receiptPdfBuffer = await generatePaymentReceiptPDF({
          receiptNumber: session.id.slice(-10).toUpperCase(),
          firstName,
          lastName,
          email,
          phone,
          maritalStatus,
          serviceFee: serviceFee.toString(),
          governmentFee,
          totalAmount: amount,
          paymentDate: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          paymentMethod,
          stripeReceiptUrl,
        });
        
        console.log("✅ Payment receipt PDF generated");
        
        // Upload receipt to the same client folder
        if (clientFolderId) {
          const receiptFileName = `Receipt_${firstName}_${lastName}_${Date.now()}.pdf`;
          console.log("📤 Uploading payment receipt to client folder...");
          
          const receiptLink = await uploadToFolder(
            clientFolderId,
            receiptFileName,
            receiptPdfBuffer
          );
          
          console.log("✅ Payment receipt uploaded to Google Drive");
          console.log("🧾 Receipt Link:", receiptLink);
        }
      } catch (error) {
        console.error("❌ Failed to generate/upload payment receipt:", error);
        // Continue processing even if receipt upload fails
      }

      // 3.5 Upload Signature Image separately
      if (signature && clientFolderId) {
        try {
          console.log("✍️ Uploading signature image to client folder...");
          
          // Convert base64 signature to buffer
          // Signature format: "data:image/png;base64,iVBORw0KG..."
          const base64Data = signature.replace(/^data:image\/\w+;base64,/, "");
          const signatureBuffer = Buffer.from(base64Data, "base64");
          
          const signatureFileName = `Signature_${firstName}_${lastName}_${Date.now()}.png`;
          
          const signatureLink = await uploadToFolder(
            clientFolderId,
            signatureFileName,
            signatureBuffer,
            "image/png"
          );
          
          console.log("✅ Signature image uploaded to Google Drive");
          console.log("✍️ Signature Link:", signatureLink);
        } catch (error) {
          console.error("❌ Failed to upload signature image:", error);
          // Continue processing even if signature upload fails
        }
      }

      // 4. Create Monday.com Item
      try {
        const mondayItemId = await createMondayItem({
          firstName,
          lastName,
          email,
          phone,
          maritalStatus,
          amount,
          driveLink,
        });
        console.log("Monday.com item created:", mondayItemId);
      } catch (error) {
        console.error("Failed to create Monday.com item:", error);
        // Continue processing even if Monday.com fails
      }

      // 5. Send Welcome Email with Drive folder link
      try {
        await sendWelcomeEmail({
          to: email,
          firstName,
          lastName,
          registrationFormLink: "https://drsi-law.com/registration-form",
          driveLink: folderLink || driveLink, // Send folder link if available
        });
        console.log("✅ Welcome email sent to:", email);
      } catch (error) {
        console.error("❌ Failed to send welcome email:", error);
        // Continue processing even if email fails
      }

      // Clean up signature from storage (after all processing is complete)
      if (signatureId) {
        deleteSignature(signatureId);
        console.log("🧹 Signature cleaned up from storage");
      }

      console.log(`✅ Successfully processed payment for ${firstName} ${lastName}`);

      return NextResponse.json({ received: true });
    } catch (error) {
      console.error("Error processing webhook:", error);
      // Return 200 to prevent Stripe from retrying
      return NextResponse.json(
        {
          error: "Error processing webhook",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 200 }
      );
    }
  }

  // Return 200 for other event types
  return NextResponse.json({ received: true });
}

