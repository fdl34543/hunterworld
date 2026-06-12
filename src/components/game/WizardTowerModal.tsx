import { useState } from "react";
import { SPELL_CATALOG, computeSpellStats } from "@/game/spells";
import { RARITIES, RARITY_META, type Rarity } from "@/game/rarity";
import { RarityBadge } from "./RarityBadge";
import type { DbPlayer } from "@/lib/players.functions";

export function WizardTowerModal({
  player,
  busy,
  onBuy,
  onClose,
}: {
  player: DbPlayer;
  busy: boolean;
  onBuy: (defId: string, rarity: Rarity) => void;
  onClose: () => void;
}) {
  const [picked, setPicked] = useState<Record<string, Rarity>>({});
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center mmo-overlay">
      <div className="w-full max-w-2xl mmo-panel rounded-2xl p-5 shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-2xl">🧙</div>
            <h2 className="text-2xl font-extrabold text-slate-900">Wizard Tower</h2>
            <p className="text-xs text-slate-500">Buy spells that permanently boost your stats.</p>
          </div>
          <div className="text-right text-sm font-bold text-amber-600">💰 {player.gold}</div>
        </div>
        <div className="mt-4 grid gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
          {SPELL_CATALOG.map((def) => {
            const rarity = picked[def.id] ?? "common";
            const stats = computeSpellStats(def, rarity);
            const canAfford = player.gold >= stats.price;
            const m = RARITY_META[rarity];
            const label =
              def.effect === "max_hp"
                ? `+${stats.amount} Max HP`
                : def.effect === "damage"
                  ? `+${stats.amount} Damage`
                  : def.effect === "defense"
                    ? `+${stats.amount} Defense`
                    : `+${stats.amount} Energy`;
            return (
              <div key={def.id} className={`rounded-lg border-2 bg-white p-3 shadow-sm ${m.border}`}>
                <div className="flex items-center gap-2">
                  <div className="text-2xl">{def.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-slate-900 truncate">{def.name}</div>
                      <RarityBadge rarity={rarity} />
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{def.description}</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center text-xs">
                  <span className="font-semibold text-violet-700">✨ {label}</span>
                  <span className="ml-auto font-bold text-amber-600">💰 {stats.price}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {RARITIES.map((r) => {
                    const meta = RARITY_META[r];
                    const active = rarity === r;
                    return (
                      <button
                        key={r}
                        onClick={() => setPicked((p) => ({ ...p, [def.id]: r }))}
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold border ${meta.border} ${active ? meta.bg + " " + meta.text : "bg-white text-slate-500"}`}
                      >
                        {meta.label[0]}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => onBuy(def.id, rarity)}
                  disabled={!canAfford || busy}
                  className="mt-2 w-full rounded-md bg-violet-500 px-3 py-1.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {canAfford ? `Cast (-${stats.price}g)` : `Need ${stats.price}g`}
                </button>
              </div>
            );
          })}
        </div>
        <button
          onClick={onClose}
          className="mt-3 w-full rounded-lg bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
        >
          Leave
        </button>
      </div>
    </div>
  );
}