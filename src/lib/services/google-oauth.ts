import { google } from "googleapis";

/**
 * Create OAuth2 client for Google Drive
 */
export function getOAuth2Client() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT_URI
  );

  // Set refresh token if available
  if (process.env.GOOGLE_OAUTH_REFRESH_TOKEN) {
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
    });
  }

  return oauth2Client;
}

/**
 * Generate authorization URL for OAuth flow
 */
export function getAuthorizationUrl() {
  const oauth2Client = getOAuth2Client();

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/drive.file"],
    prompt: "consent", // Force consent screen to get refresh token
  });

  return authUrl;
}

/**
 * Exchange authorization code for tokens
 */
export async function getTokensFromCode(code: string) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  
  return tokens;
}

/**
 * Get authenticated Drive client
 */
export function getDriveClient() {
  const oauth2Client = getOAuth2Client();
  
  return google.drive({
    version: "v3",
    auth: oauth2Client,
  });
}

