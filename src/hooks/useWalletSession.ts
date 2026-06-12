import "@/lib/solana-polyfills";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import { signInWithSolana } from "@/lib/auth.functions";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

type WalletSession = {
  walletAddress: string;
  userId: string;
};

function sessionToWallet(s: Session | null): WalletSession | null {
  const wallet = (s?.user?.user_metadata as { wallet_address?: string } | undefined)
    ?.wallet_address;
  if (!s?.user || !wallet) return null;
  return { walletAddress: wallet, userId: s.user.id };
}

// Module-level store so every useWalletSession() consumer sees the same
// session state. Synced with Supabase Auth via onAuthStateChange below.
let currentSession: WalletSession | null = null;
const listeners = new Set<() => void>();
function emit() {
  for (const l of listeners) l();
}
function setSessionStore(s: WalletSession | null) {
  currentSession = s;
  emit();
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function getSnapshot() {
  return currentSession;
}
function getServerSnapshot(): WalletSession | null {
  return null;
}

// Initialize from existing Supabase session and keep in sync.
if (typeof window !== "undefined") {
  supabase.auth.getSession().then(({ data }) => {
    setSessionStore(sessionToWallet(data.session));
  });
  supabase.auth.onAuthStateChange((_event, sess) => {
    setSessionStore(sessionToWallet(sess));
  });
}

function buildMessage(address: string, issuedAt: string, nonce: string) {
  return [
    "Voxel Town wants you to sign in with your Solana account.",
    `Address: ${address}`,
    `Issued At: ${issuedAt}`,
    `Nonce: ${nonce}`,
  ].join("\n");
}

export function useWalletSession() {
  const { publicKey, signMessage, connected, disconnect, select } = useWallet();
  const address = publicKey?.toBase58() ?? null;

  const session = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If wallet disconnects or switches to a different account than the session,
  // sign out of Supabase so RLS scope follows the active wallet.
  useEffect(() => {
    if (!connected && session) {
      supabase.auth.signOut().catch(() => {});
      return;
    }
    if (session && address && session.walletAddress !== address) {
      supabase.auth.signOut().catch(() => {});
    }
  }, [connected, address, session]);

  const signIn = useCallback(async () => {
    if (!publicKey || !signMessage) {
      setError("Wallet doesn't support message signing");
      return null;
    }
    setSigningIn(true);
    setError(null);
    try {
      const addr = publicKey.toBase58();
      const issuedAt = new Date().toISOString();
      const nonce = crypto.randomUUID();
      const msg = buildMessage(addr, issuedAt, nonce);
      const sigBytes = await signMessage(new TextEncoder().encode(msg));
      const signature = bs58.encode(sigBytes);
      const { email, password, walletAddress } = await signInWithSolana({
        data: { address: addr, message: msg, signature },
      });

      // Try sign-in first. If user doesn't exist yet, sign-up then sign-in.
      let { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInErr) {
        const { error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { wallet_address: walletAddress } },
        });
        if (signUpErr && !/already/i.test(signUpErr.message)) {
          throw signUpErr;
        }
        const retry = await supabase.auth.signInWithPassword({ email, password });
        if (retry.error) throw retry.error;
      }

      // Ensure wallet_address is stored in user metadata (covers older accounts).
      await supabase.auth.updateUser({ data: { wallet_address: walletAddress } });

      // Claim any pre-existing wallet-keyed player/items rows.
      await supabase.rpc("claim_player_by_wallet", { p_wallet: walletAddress });

      const { data: ss } = await supabase.auth.getSession();
      const stored = sessionToWallet(ss.session);
      setSessionStore(stored);
      return stored;
    } catch (e) {
      const m = (e as Error)?.message ?? "Sign-in failed";
      setError(m);
      return null;
    } finally {
      setSigningIn(false);
    }
  }, [publicKey, signMessage]);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setSessionStore(null);
    try {
      await disconnect();
    } catch {
      // ignore
    }
    try {
      select(null);
    } catch {
      // ignore
    }
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem("walletName");
      } catch {
        // ignore
      }
    }
  }, [disconnect, select]);

  return {
    address,
    connected,
    session,
    // Back-compat: callers used `token` to gate queries. Now we expose a
    // truthy marker derived from the Supabase session.
    token: session ? "supabase" : null,
    walletAddress: session?.walletAddress ?? null,
    userId: session?.userId ?? null,
    signingIn,
    error,
    signIn,
    logout,
  };
}