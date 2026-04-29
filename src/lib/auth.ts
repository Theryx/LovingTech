/**
 * HMAC-signed token auth for admin.
 * Uses Web Crypto API — works in both Edge (middleware) and Node.js (API routes).
 */

const ALGORITHM = { name: 'HMAC', hash: 'SHA-256' as AlgorithmIdentifier };
const TOKEN_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes as Uint8Array;
}

async function getSecretKey(): Promise<CryptoKey> {
  const secret = process.env.ADMIN_PASSWORD || '__missing_admin_password__';
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    ALGORITHM,
    false,
    ['sign', 'verify'],
  );
}

async function createSignature(data: string): Promise<string> {
  const key = await getSecretKey();
  const encoder = new TextEncoder();
  const sig = await crypto.subtle.sign(ALGORITHM.name, key, encoder.encode(data));
  return bytesToHex(sig);
}

export async function createAuthToken(): Promise<string> {
  const sessionId = crypto.randomUUID();
  const timestamp = Date.now().toString();
  const payload = `${sessionId}.${timestamp}`;
  const signature = await createSignature(payload);
  return `${payload}.${signature}`;
}

export async function verifyAuthToken(token: string): Promise<boolean> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const [sessionId, timestamp, hexSig] = parts;

    // Check expiry
    const tokenTime = parseInt(timestamp, 10);
    if (isNaN(tokenTime)) return false;
    if (Date.now() - tokenTime > TOKEN_MAX_AGE_MS) return false;

    // Verify HMAC signature
    const key = await getSecretKey();
    const encoder = new TextEncoder();
    const payload = `${sessionId}.${timestamp}`;
    const sigBytes = hexToBytes(hexSig);
    return crypto.subtle.verify(ALGORITHM.name, key, sigBytes as globalThis.BufferSource, encoder.encode(payload));
  } catch {
    return false;
  }
}
