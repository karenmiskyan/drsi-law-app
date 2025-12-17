/**
 * Token Verification for Registration Form
 * 
 * This module handles verification of tokens passed via URL query parameters.
 * Authenticated users (who paid via Stripe) receive a token in their email.
 */

interface TokenPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  maritalStatus: 
    | "single" 
    | "married" 
    | "divorced" 
    | "widowed" 
    | "separated"
    | "married_to_citizen"  // From payment wizard
    | "married_to_lpr";     // From payment wizard
  expiresAt: number;
}

/**
 * Verify token and extract user data
 * In production, this should call your backend API
 * For now, we'll decode a JWT-like token
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    // TODO: In production, call your backend API to verify the token
    // Example: const response = await fetch(`/api/verify-token?token=${token}`)
    
    // For development/demo, decode a simple base64 token
    // Format: base64(JSON.stringify(payload))
    const decoded = atob(token);
    const payload: TokenPayload = JSON.parse(decoded);
    
    // Check if token is expired
    if (payload.expiresAt && Date.now() > payload.expiresAt) {
      console.error("Token expired");
      return null;
    }
    
    return payload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

/**
 * Generate a token (for testing purposes)
 * In production, this should be done by your backend after payment
 */
export function generateTestToken(userData: Omit<TokenPayload, "expiresAt">): string {
  const payload: TokenPayload = {
    ...userData,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  };
  
  return btoa(JSON.stringify(payload));
}

/**
 * Example usage:
 * 
 * // Generate test token (backend would do this after payment)
 * const token = generateTestToken({
 *   firstName: "Karen",
 *   lastName: "Misakyan",
 *   email: "karen@example.com",
 *   phone: "+972123456789",
 *   maritalStatus: "married"
 * });
 * 
 * // URL would be: /register?token=eyJmaXJzdE5hbWUiOiJLYXJlbiI...
 * 
 * // In the component, verify token
 * const params = useSearchParams();
 * const token = params.get("token");
 * if (token) {
 *   const userData = await verifyToken(token);
 *   // Pre-fill form and lock fields
 * }
 */


