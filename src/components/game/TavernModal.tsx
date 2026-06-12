import { useEffect, useState } from "react";
import { BEER_MENU, type BeerDef } from "@/game/places/tavern";

export function TavernModal({
  gold,
  onOrder,
  onClose,
  cooldownRemaining,
}: {
  gold: number;
  onOrder: (beer: BeerDef) => void;
  onClose: () => void;
  cooldownRemaining?: number;
}) {
  const ready = !cooldownRemaining || cooldownRemaining <= 0;

  // Tick once per second so the timer updates while the modal is open.
  const [, force] = useState(0);
  useEffect(() => {
    if (!cooldownRemaining || cooldownRemaining <= 0) return;
    const t = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [cooldownRemaining]);

  const fmt = (ms: number) => {
    const s = Math.ceil(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center mmo-overlay">
      <div className="w-full max-w-md mmo-panel rounded-2xl p-6 shadow-2xl">
        <div className="mb-1 text-3xl">🍻</div>
        <h2 className="text-2xl font-extrabold text-amber-900">Beer Cafe</h2>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-amber-700">Tavern Keeper</p>
        <p className="mb-4 text-sm text-amber-900/80">
          Pick a brew. Stronger pours grant more XP… but the room may start to spin.
        </p>
        <div className="mb-4 flex items-center justify-between rounded-lg bg-amber-200/60 px-3 py-1.5 text-sm font-bold text-amber-900">
          <span>Your gold</span>
          <span>🪙 {gold}</span>
        </div>
        {!ready && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-center text-sm font-bold text-rose-700">
            Beer cooldown: {fmt(cooldownRemaining!)}
          </div>
        )}
        <ul className="mb-4 space-y-2">
          {BEER_MENU.map((b) => {
            const afford = gold >= b.cost;
            const canBuy = ready && afford;
            return (
              <li key={b.id}>
                <button
                  disabled={!canBuy}
                  onClick={() => onOrder(b)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${
                    canBuy
                      ? "border-amber-300 bg-white hover:bg-amber-100"
                      : "cursor-not-allowed border-slate-200 bg-slate-100 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{b.emoji}</span>
                    <div>
                      <div className="font-extrabold text-amber-900">{b.name}</div>
                      <div className="text-xs text-amber-900/70">{b.description}</div>
                    </div>
                  </div>
                  <div className="text-right text-xs font-bold">
                    <div className="text-rose-700">-{b.cost}🪙</div>
                    <div className="text-emerald-700">+{b.xp} XP</div>
                    <div className="text-amber-700">
                      {"🌀".repeat(b.intensity)}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
        <button
          onClick={onClose}
          className="w-full rounded-lg bg-amber-200 px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-300"
        >
          Leave
        </button>
      </div>
    </div>
  );
}
