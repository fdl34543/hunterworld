// Server functions for Realm Exchange. Handles the daily reward claim
// with a 24h cooldown enforced server-side.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const REALM_CLAIM_COOLDOWN_MS = 24 * 60 * 60 * 1000;

/** Fixed daily rewards. SOL/USDC are demo numbers (off-chain). */
const DAILY_GOLD = 25;
const DAILY_SOL = 0.005;
const DAILY_USDC = 0.25;

function dbFail(error: unknown, clientMessage = "Server error"): never {
  // eslint-disable-next-line no-console
  console.error("[realm.functions] db error:", error);
  throw new Error(clientMessage);
}

export type RealmClaimResult = {
  rewards: { gold: number; sol: number; usdc: number };
  nextClaimAt: string;
  player: {
    gold: number;
    last_realm_claim_at: string | null;
  };
  walletAddress: string | null;
};

export const claimRealmReward = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<RealmClaimResult> => {
    const { supabase, userId } = context;
    const { data: cur, error } = await supabase
      .from("players")
      .select("gold,last_realm_claim_at,wallet_address")
      .eq("user_id", userId)
      .single();
    if (error) dbFail(error);

    const now = Date.now();
    const last = cur.last_realm_claim_at
      ? new Date(cur.last_realm_claim_at).getTime()
      : 0;
    if (last && now - last < REALM_CLAIM_COOLDOWN_MS) {
      const remainingMs = REALM_CLAIM_COOLDOWN_MS - (now - last);
      const hrs = Math.ceil(remainingMs / (60 * 60 * 1000));
      throw new Error(`Already claimed. Try again in ~${hrs}h.`);
    }

    const nowIso = new Date(now).toISOString();
    const { data: row, error: e2 } = await supabase
      .from("players")
      .update({
        gold: cur.gold + DAILY_GOLD,
        last_realm_claim_at: nowIso,
      })
      .eq("user_id", userId)
      .select("gold,last_realm_claim_at")
      .single();
    if (e2) dbFail(e2);

    return {
      rewards: { gold: DAILY_GOLD, sol: DAILY_SOL, usdc: DAILY_USDC },
      nextClaimAt: new Date(now + REALM_CLAIM_COOLDOWN_MS).toISOString(),
      player: {
        gold: row.gold,
        last_realm_claim_at: row.last_realm_claim_at,
      },
      walletAddress: cur.wallet_address ?? null,
    };
  });