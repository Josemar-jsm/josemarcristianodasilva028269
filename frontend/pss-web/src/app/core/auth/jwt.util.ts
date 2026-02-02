export interface JwtClaims {
  sub?: string;
  roles?: string[];
  exp?: number; // seconds
  [k: string]: any;
}

function b64UrlDecode(input: string): string {
  const pad = '='.repeat((4 - (input.length % 4)) % 4);
  const base64 = (input + pad).replace(/-/g, '+').replace(/_/g, '/');
  return atob(base64);
}

export function parseJwtClaims(token: string): JwtClaims | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payloadJson = b64UrlDecode(parts[1]);
    return JSON.parse(payloadJson) as JwtClaims;
  } catch {
    return null;
  }
}
