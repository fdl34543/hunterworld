import { ITEM_BY_ID } from "@/game/items";
import type { Rarity } from "@/game/rarity";
import { RarityBadge } from "./RarityBadge";
import type { BossDrop } from "@/lib/players.functions";

export function BossDropModal({ drop, onClose }: { drop: BossDrop; onClose: () => void }) {
  const spellLabelFor = (s: BossDrop["spells"][number]) =>
    s.effect === "max_hp"
      ? `+${s.amount} Max HP`
      : s.effect === "damage"
        ? `+${s.amount} Damage`
        : `+${s.amount} Defense`;
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center mmo-overlay">
      <div className="w-full max-w-sm mmo-panel rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="text-3xl">👑</div>
        <h2 className="text-xl font-extrabold text-slate-900">Boss Defeated!</h2>
        <p className="text-xs text-slate-500">The dungeon boss yielded its hoard.</p>

        <div className="mt-4 space-y-2">
          {drop.items.map((it) => {
            const def = ITEM_BY_ID[it.def_id];
            return (
              <div key={it.id} className="rounded-lg border bg-white p-3">
                <div className="flex items-center gap-2">
                  <div className="text-2xl">{def?.emoji ?? "📦"}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-slate-900">{def?.name ?? it.def_id}</div>
                      <RarityBadge rarity={it.rarity as Rarity} />
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {it.kind === "weapon" ? `🗡 +${it.attack}` : `🛡 +${it.defense}`}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {drop.spells.map((s, i) => (
            <div key={i} className="rounded-lg border bg-white p-3">
              <div className="flex items-center gap-2">
                <div className="text-2xl">{s.emoji}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-bold text-slate-900">{s.name}</div>
                    <RarityBadge rarity={s.rarity} />
                  </div>
                  <div className="text-[11px] text-violet-700 font-semibold">{spellLabelFor(s)} (in inventory)</div>
                </div>
              </div>
            </div>
          ))}

          <div className="rounded-lg border bg-white p-3 text-center font-bold text-amber-700">
            💰 +{drop.gold} gold
          </div>

          <div className="rounded-lg border bg-white p-3 text-center font-bold text-sky-700">
            ✨ +{drop.xp} XP
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-lg bg-orange-500 px-4 py-2 font-bold text-white"
        >
          Claim
        </button>
      </div>
    </div>
  );
}