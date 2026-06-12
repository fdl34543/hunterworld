import type { DbPlayerItem } from "@/lib/players.functions";
import { ITEM_BY_ID, WEARABLE_KINDS } from "@/game/items";
import { SPELL_BY_ID } from "@/game/spells";
import { CONSUMABLE_BY_ID } from "@/game/consumables";
import { RARITY_META, type Rarity } from "@/game/rarity";

export type ItemMeta = {
  name: string;
  emoji: string;
  description: string;
  subtitle: string;
  rarity?: Rarity;
  stats?: string;
  useLabel?: string;
};

export function resolveItemMeta(it: DbPlayerItem): ItemMeta {
  const rarity = it.rarity as Rarity;
  const rarityLabel = RARITY_META[rarity]?.label ?? "";

  if (WEARABLE_KINDS.has(it.kind)) {
    const def = ITEM_BY_ID[it.def_id];
    const parts: string[] = [];
    if (it.attack) parts.push(`🗡 +${it.attack} Attack`);
    if (it.defense) parts.push(`🛡 +${it.defense} Defense`);
    if (it.effect && it.amount) {
      const label =
        it.effect === "damage"
          ? `+${it.amount} Damage`
          : it.effect === "defense"
            ? `+${it.amount} Defense`
            : it.effect === "hp_regen"
              ? `+${it.amount} HP regen/s`
              : `${it.effect} +${it.amount}`;
      parts.push(`✨ ${label}`);
    }
    return {
      name: def?.name ?? it.def_id,
      emoji: def?.emoji ?? "📦",
      description: def?.description ?? "",
      subtitle: `${rarityLabel} ${it.kind}`,
      rarity,
      stats: parts.join(" · "),
      useLabel: "Equip",
    };
  }
  if (it.kind === "spell") {
    const def = SPELL_BY_ID[it.def_id];
    const label =
      it.effect === "max_hp"
        ? `+${it.amount} Max HP`
        : it.effect === "damage"
          ? `+${it.amount} Damage`
          : `+${it.amount} Defense`;
    return {
      name: def?.name ?? it.def_id,
      emoji: def?.emoji ?? "✨",
      description: def?.description ?? "Permanently boosts a stat.",
      subtitle: `${rarityLabel} spell`,
      rarity,
      stats: `✨ ${label} (permanent)`,
      useLabel: "Cast",
    };
  }
  const def = CONSUMABLE_BY_ID[it.def_id];
  const label = it.effect === "xp" ? `+${it.amount} XP` : `+${it.amount} Gold`;
  return {
    name: def?.name ?? it.def_id,
    emoji: def?.emoji ?? "🎁",
    description: def?.description ?? "A starter item.",
    subtitle: "Consumable",
    rarity,
    stats: `🎁 ${label} (one-time)`,
    useLabel: "Use",
  };
}