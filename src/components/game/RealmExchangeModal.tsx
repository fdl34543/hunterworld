import { useEffect, useState } from "react";
import { REALM_CLAIM_COOLDOWN_MS } from "@/lib/realm.functions";

// Placeholder contract address — replace with the real one when available.
export const REALM_CA = "71p7Riw6WyBJmbS1HgSwLbjpNZfBptsDpcc9h9s4pump";

type Props = {
  gold: number;
  lastClaimAt: number | null;
  claiming?: boolean;
  onClaim: () => void;
  onStakeConfirmed: (amount: number) => void;
  onClose: () => void;
};

export function RealmExchangeModal({
  gold,
  lastClaimAt,
  claiming,
  onClaim,
  onStakeConfirmed,
  onClose,
}: Props) {
  const [view, setView] = useState<"main" | "stake">("main");
  const [stakeInput, setStakeInput] = useState("");
  const [, force] = useState(0);

  const now = Date.now();
  const remainingMs = lastClaimAt
    ? Math.max(0, REALM_CLAIM_COOLDOWN_MS - (now - lastClaimAt))
    : 0;
  const ready = remainingMs <= 0;

  useEffect(() => {
    if (ready) return;
    const t = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [ready]);

  const fmt = (ms: number) => {
    const s = Math.ceil(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${sec}s`;
    return `${sec}s`;
  };

  const buyUrl = `https://pump.fun/coin/${REALM_CA}`;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center mmo-overlay">
      <div className="w-full max-w-sm mmo-panel rounded-2xl p-6 shadow-2xl">
        {view === "main" ? (
          <>
            <div className="mb-1 text-3xl">🪙</div>
            <h2 className="text-2xl font-extrabold text-slate-900">Realm Exchange</h2>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Trader
            </p>
            <p className="mb-4 text-sm text-slate-600">
              Buy, stake, and claim $HUNT rewards.
            </p>

            <a
              href={buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-2 block w-full rounded-lg bg-orange-500 px-4 py-2.5 text-center font-bold text-white shadow hover:bg-orange-600"
            >
              Buy $HUNT on pump.fun ↗
            </a>

            <button
              onClick={() => setView("stake")}
              className="mb-2 w-full rounded-lg bg-indigo-500 px-4 py-2.5 font-bold text-white shadow hover:bg-indigo-600"
            >
              Stake $HUNT
            </button>

            <button
              onClick={onClaim}
              disabled={!ready || !!claiming}
              className={`mb-3 w-full rounded-lg px-4 py-2.5 font-bold text-white shadow transition-colors ${
                ready && !claiming
                  ? "bg-emerald-500 hover:bg-emerald-600"
                  : "cursor-not-allowed bg-slate-300 text-slate-500"
              }`}
            >
              {claiming
                ? "Claiming…"
                : ready
                  ? "Claim Daily Rewards (SOL / USDC / Gold)"
                  : `Next claim in ${fmt(remainingMs)}`}
            </button>

            <button
              onClick={onClose}
              className="w-full rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300"
            >
              Leave
            </button>
          </>
        ) : (
          <>
            <div className="mb-1 text-3xl">🔒</div>
            <h2 className="text-2xl font-extrabold text-slate-900">Stake $HUNT</h2>
            <p className="mb-4 text-sm text-slate-600">
              Enter the amount of $HUNT you want to stake.
            </p>

            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Amount
            </label>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              value={stakeInput}
              onChange={(e) => setStakeInput(e.target.value)}
              placeholder="0.0"
              className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-indigo-500"
              autoFocus
            />

            <button
              onClick={() => {
                const amt = Number(stakeInput);
                if (!Number.isFinite(amt) || amt <= 0) return;
                onStakeConfirmed(amt);
              }}
              disabled={!(Number(stakeInput) > 0)}
              className="mb-2 w-full rounded-lg bg-indigo-500 px-4 py-2.5 font-bold text-white shadow hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Confirm Stake
            </button>
            <button
              onClick={() => setView("main")}
              className="w-full rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300"
            >
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}