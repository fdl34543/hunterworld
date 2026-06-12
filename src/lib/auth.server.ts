// Server-only auth helpers: verify a Solana signed message, issue and
// verify short HMAC session tokens. Filename ends in .server.ts so it can
// never end up in a client bundle.
import { createHmac, timingSafeEqual } from "crypto";
import nacl from "tweetnacl";
import bs58 from "bs58";

const SIGN_IN_MAX_AGE_MS = 5 * 60 * 1000; // 5 min

function secret() {
  const s = process.env.SOLANA_AUTH_SECRET;
  if (!s) throw new Error("Missing SOLANA_AUTH_SECRET env var");
  return s;
}

function hmac(input: string) {
  return createHmac("sha256", secret()).update(input).digest("base64url");
}

// timingSafeEqual no longer used here — kept import in case of future use.
void timingSafeEqual;

export function buildSignInMessage(address: string, issuedAt: string, nonce: string) {
  return [
    "Voxel Town wants you to sign in with your Solana account.",
    `Address: ${address}`,
    `Issued At: ${issuedAt}`,
    `Nonce: ${nonce}`,
  ].join("\n");
}

/**
 * Verify a Solana ed25519 signature over an arbitrary UTF-8 message.
 * `address` is the base58-encoded public key, `signature` is base58.
 */
export function verifySolanaSignature(opts: {
  address: string;
  message: string;
  signature: string;
}): boolean {
  try {
    const pub = bs58.decode(opts.address);
    const sig = bs58.decode(opts.signature);
    const msg = new TextEncoder().encode(opts.message);
    return nacl.sign.detached.verify(msg, sig, pub);
  } catch {
    return false;
  }
}

/**
 * Verify the sign-in payload: signature must be valid AND the embedded
 * Issued-At must be within SIGN_IN_MAX_AGE_MS of now. Address inside the
 * message must match the claimed address (prevents replay across accounts).
 */
export function verifySignIn(opts: {
  address: string;
  message: string;
  signature: string;
}): { ok: true } | { ok: false; reason: string } {
  const m = opts.message;
  // The signed-in address line MUST match the claimed address.
  if (!m.includes(`Address: ${opts.address}`)) {
    return { ok: false, reason: "Address mismatch" };
  }
  const issuedMatch = m.match(/Issued At: (.+)/);
  if (!issuedMatch) return { ok: false, reason: "Missing Issued At" };
  const issuedAt = Date.parse(issuedMatch[1].trim());
  if (!Number.isFinite(issuedAt)) return { ok: false, reason: "Bad Issued At" };
  const age = Math.abs(Date.now() - issuedAt);
  if (age > SIGN_IN_MAX_AGE_MS) return { ok: false, reason: "Sign-in expired" };
  if (!verifySolanaSignature(opts)) return { ok: false, reason: "Bad signature" };
  return { ok: true };
}

/**
 * Deterministic Supabase Auth credentials for a wallet. The password is an
 * HMAC of the wallet address keyed by SOLANA_AUTH_SECRET, so only code that
 * holds the server secret can derive it — and the server only returns it
 * after verifying a fresh Solana signature in `signInWithSolana`.
 *
 * The email is synthetic (`<wallet>@wallet.realmstride.local`) and never
 * receives mail; the domain does not resolve.
 */
export function walletCredentials(walletAddress: string): {
  email: string;
  password: string;
} {
  const wallet = walletAddress.toLowerCase();
  const email = `w-${wallet}@wallet.realmstride.local`;
  // Password must be a strong opaque string; base64url of a 32-byte HMAC.
  const password = hmac(`pwd:v1:${walletAddress}`);
  return { email, password };
}