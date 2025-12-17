import { NextRequest, NextResponse } from "next/server";
import { getTokensFromCode } from "@/lib/services/google-oauth";

/**
 * OAuth callback handler
 * Google redirects here after user authorizes the app
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.json(
        { error: `Authorization failed: ${error}` },
        { status: 400 }
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: "No authorization code received" },
        { status: 400 }
      );
    }

    // Exchange code for tokens
    const tokens = await getTokensFromCode(code);

    console.log("\n✅ OAuth tokens received!");
    console.log("📋 Add this refresh token to your .env.local:");
    console.log(`GOOGLE_OAUTH_REFRESH_TOKEN=${tokens.refresh_token}\n`);

    // Return success page with token
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authorization Successful</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              max-width: 600px;
              margin: 50px auto;
              padding: 20px;
              background: #f5f5f5;
            }
            .container {
              background: white;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            h1 { color: #22c55e; }
            code {
              background: #f1f5f9;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 12px;
              word-break: break-all;
            }
            .token-box {
              background: #1e293b;
              color: #10b981;
              padding: 15px;
              border-radius: 6px;
              margin: 20px 0;
              font-family: monospace;
              word-break: break-all;
            }
            .step {
              margin: 15px 0;
              padding-left: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ Authorization Successful!</h1>
            <p>Google Drive access has been granted.</p>
            
            <h2>Next Steps:</h2>
            <div class="step">
              <strong>1.</strong> Check your terminal/console for the refresh token
            </div>
            <div class="step">
              <strong>2.</strong> Add this to your <code>.env.local</code> file:
              <div class="token-box">
                GOOGLE_OAUTH_REFRESH_TOKEN=${tokens.refresh_token || "[Check terminal]"}
              </div>
            </div>
            <div class="step">
              <strong>3.</strong> Restart your dev server:
              <code>npm run dev</code>
            </div>
            <div class="step">
              <strong>4.</strong> Test the upload feature!
            </div>
            
            <p style="margin-top: 30px; color: #64748b;">
              You can close this window now.
            </p>
          </div>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  } catch (error) {
    console.error("Error in OAuth callback:", error);
    return NextResponse.json(
      {
        error: "Failed to exchange authorization code for tokens",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

