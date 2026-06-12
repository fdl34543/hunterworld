import { useState } from "react";
import { ITEM_CATALOG, computeItemStats, type ItemKind } from "@/game/items";
import { RARITIES, RARITY_META, type Rarity } from "@/game/rarity";
import { RarityBadge } from "./RarityBadge";
import type { DbPlayer } from "@/lib/players.functions";

type Tab = ItemKind;
const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: "weapon", label: "Weapons", emoji: "⚔️" },
  { id: "armor", label: "Armor", emoji: "🛡" },
  { id: "head", label: "Head", emoji: "⛑️" },
  { id: "arm", label: "Arms", emoji: "🥊" },
  { id: "accessory", label: "Accessories", emoji: "💍" },
];

export function BlacksmithModal({
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
  const [tab, setTab] = useState<Tab>("weapon");
  const [pickedRarity, setPickedRarity] = useState<Record<string, Rarity>>({});

  const renderShop = (kind: ItemKind) => {
    const items = ITEM_CATALOG.filter((i) => i.kind === kind);
    if (items.length === 0) {
      return <p className="text-sm text-slate-500">Nothing in stock here yet.</p>;
    }
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((def) => {
          const rarity = pickedRarity[def.id] ?? "common";
          const stats = computeItemStats(def, rarity);
          const canAfford = player.gold >= stats.price;
          const m = RARITY_META[rarity];
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
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                {stats.attack > 0 && (
                  <span className="text-rose-600 font-semibold">🗡 +{stats.attack}</span>
                )}
                {stats.defense > 0 && (
                  <span className="text-emerald-600 font-semibold">🛡 +{stats.defense}</span>
                )}
                {def.effect && stats.effectAmount > 0 && (
                  <span className="text-violet-600 font-semibold">
                    ✨ +{stats.effectAmount}{" "}
                    {def.effect === "damage"
                      ? "Damage"
                      : def.effect === "defense"
                        ? "Defense"
                        : "HP/s"}
                  </span>
                )}
                <span className="ml-auto text-amber-600 font-bold">💰 {stats.price}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {RARITIES.map((r) => {
                  const meta = RARITY_META[r];
                  const active = rarity === r;
                  return (
                    <button
                      key={r}
                      onClick={() => setPickedRarity((p) => ({ ...p, [def.id]: r }))}
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
                className="mt-2 w-full rounded-md bg-orange-500 px-3 py-1.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {canAfford ? `Buy (-${stats.price}g)` : `Need ${stats.price}g`}
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center mmo-overlay">
      <div className="w-full max-w-2xl mmo-panel rounded-2xl p-5 shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-2xl">⚒️</div>
            <h2 className="text-2xl font-extrabold text-slate-900">Blacksmith</h2>
            <p className="text-xs text-slate-500">
              Forge weapons & armor — they go into your inventory. Equip from the inventory panel.
            </p>
          </div>
          <div className="text-right text-sm font-bold text-amber-600">💰 {player.gold}</div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1 border-b">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`-mb-px border-b-2 px-3 py-1.5 text-sm font-semibold ${
                tab === t.id ? "border-orange-500 text-orange-600" : "border-transparent text-slate-500"
              }`}
            >
              <span className="mr-1">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>
        <div className="mt-3 overflow-y-auto pr-1">{renderShop(tab)}</div>
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