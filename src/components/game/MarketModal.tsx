import type { DbPlayer, DbPlayerItem } from "@/lib/players.functions";
import { resolveItemMeta } from "@/game/itemMeta";
import { ITEM_BY_ID, computeItemStats } from "@/game/items";
import { SPELL_BY_ID, computeSpellStats } from "@/game/spells";
import { CONSUMABLE_BY_ID } from "@/game/consumables";
import { RARITY_META, type Rarity } from "@/game/rarity";
import { RarityBadge } from "./RarityBadge";

function sellValue(it: DbPlayerItem): number {
  if (it.kind === "spell") {
    const def = SPELL_BY_ID[it.def_id];
    if (def) return Math.max(1, Math.floor(computeSpellStats(def, it.rarity as Rarity).price * 0.5));
    return 5;
  }
  if (it.kind === "consumable") {
    const def = CONSUMABLE_BY_ID[it.def_id];
    if (def?.effect === "gold") return Math.max(1, def.amount);
    return 3;
  }
  const def = ITEM_BY_ID[it.def_id];
  if (def) return Math.max(1, Math.floor(computeItemStats(def, it.rarity as Rarity).price * 0.5));
  return 1;
}

export function MarketModal({
  player,
  items,
  busy,
  onSell,
  onClose,
}: {
  player: DbPlayer;
  items: DbPlayerItem[];
  busy: boolean;
  onSell: (itemId: string) => void;
  onClose: () => void;
}) {
  const sellable = items.filter((it) => it.slot_kind === "inventory");

  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center mmo-overlay"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl mmo-panel rounded-2xl p-5 shadow-2xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-2xl">🛒</div>
            <h2 className="text-2xl font-extrabold text-slate-900">Market</h2>
            <p className="text-xs text-slate-500">
              Sell items from your inventory for gold (50% of forge price).
            </p>
          </div>
          <div className="text-right text-sm font-bold text-amber-600">💰 {player.gold}</div>
        </div>
        <div className="mt-3 overflow-y-auto pr-1">
          {sellable.length === 0 ? (
            <p className="text-sm text-slate-500">Your inventory is empty.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {sellable.map((it) => {
                const meta = resolveItemMeta(it);
                const price = sellValue(it);
                const r = RARITY_META[it.rarity as Rarity];
                return (
                  <div
                    key={it.id}
                    className={`flex items-center gap-2 rounded-lg border-2 bg-white p-2 ${r?.border ?? "border-slate-200"}`}
                  >
                    <div className="text-2xl">{meta.emoji}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <div className="truncate text-sm font-bold text-slate-900">{meta.name}</div>
                        <RarityBadge rarity={it.rarity as Rarity} />
                      </div>
                      <div className="truncate text-[11px] text-slate-500">{meta.stats ?? meta.subtitle}</div>
                    </div>
                    <button
                      onClick={() => onSell(it.id)}
                      disabled={busy}
                      className="rounded-md bg-amber-500 px-2.5 py-1 text-xs font-bold text-white shadow hover:bg-amber-600 disabled:bg-slate-300"
                    >
                      Sell +{price}g
                    </button>
                  </div>
                );
              })}
            </div>
          )}
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