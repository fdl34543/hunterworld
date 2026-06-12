import { RARITY_META, type Rarity } from "./rarity";

export type ItemKind = "weapon" | "armor" | "head" | "arm" | "accessory";

export type ItemEffect = "damage" | "defense" | "hp_regen";

/** Wear slot indices for equipment kinds. */
export const WEAR_KIND_BY_INDEX = ["weapon", "armor", "head", "arm", "accessory"] as const;
export type WearableKind = typeof WEAR_KIND_BY_INDEX[number];
export const WEAR_INDEX_BY_KIND: Record<WearableKind, number> = {
  weapon: 0,
  armor: 1,
  head: 2,
  arm: 3,
  accessory: 4,
};
export const WEARABLE_KINDS: ReadonlySet<string> = new Set(WEAR_KIND_BY_INDEX);

export type ItemDef = {
  id: string;
  name: string;
  emoji: string;
  kind: ItemKind;
  baseAttack: number;
  baseDefense: number;
  basePrice: number;
  /** Optional secondary effect applied while worn. */
  effect?: ItemEffect;
  /** Base amount for the effect at common rarity. */
  baseEffectAmount?: number;
  description: string;
};

export const ITEM_CATALOG: ItemDef[] = [
  { id: "iron-sword",  name: "Iron Sword",   emoji: "⚔️",  kind: "weapon", baseAttack: 5, baseDefense: 0, basePrice: 50,  description: "A trusty blade for any aspiring warrior." },
  { id: "hunter-bow",  name: "Hunter Bow",   emoji: "🏹",  kind: "weapon", baseAttack: 4, baseDefense: 0, basePrice: 45,  description: "Light and swift — ideal for archers." },
  { id: "battle-axe",  name: "Battle Axe",   emoji: "🪓",  kind: "weapon", baseAttack: 7, baseDefense: 0, basePrice: 70,  description: "Heavy but punishing on impact." },
  { id: "mage-staff",  name: "Mage Staff",   emoji: "🔮",  kind: "weapon", baseAttack: 6, baseDefense: 0, basePrice: 60,  description: "Channels arcane fury into every swing." },
  { id: "dagger",      name: "Rogue Dagger", emoji: "🗡️", kind: "weapon", baseAttack: 3, baseDefense: 0, basePrice: 35,  description: "Quick strikes in tight quarters." },
  { id: "leather-vest",name: "Leather Vest", emoji: "🦺",  kind: "armor",  baseAttack: 0, baseDefense: 3, basePrice: 40,  description: "Basic protection that won't slow you down." },
  { id: "chain-mail",  name: "Chain Mail",   emoji: "⛓️", kind: "armor",  baseAttack: 0, baseDefense: 5, basePrice: 60,  description: "Sturdy interlocking rings." },
  { id: "plate-armor", name: "Plate Armor",  emoji: "🛡️", kind: "armor",  baseAttack: 0, baseDefense: 8, basePrice: 90,  description: "Heavy steel plates that turn aside most blows." },
  { id: "mage-robe",   name: "Mage Robe",    emoji: "🥋",  kind: "armor",  baseAttack: 0, baseDefense: 4, basePrice: 55,  description: "Woven with protective sigils." },
  // Head
  { id: "iron-helm",     name: "Iron Helm",     emoji: "⛑️", kind: "head", baseAttack: 0, baseDefense: 2, basePrice: 45, effect: "defense",   baseEffectAmount: 1, description: "A solid steel cap that turns aside glancing blows." },
  { id: "warrior-crown", name: "Warrior Crown", emoji: "👑", kind: "head", baseAttack: 0, baseDefense: 1, basePrice: 80, effect: "damage",    baseEffectAmount: 2, description: "Worn by champions — inspires fierce strikes." },
  { id: "wizard-hood",   name: "Wizard Hood",   emoji: "🎩", kind: "head", baseAttack: 0, baseDefense: 1, basePrice: 65, effect: "hp_regen",  baseEffectAmount: 1, description: "Mystic threads slowly mend wounds." },
  // Arm / gauntlets
  { id: "iron-gauntlets",  name: "Iron Gauntlets",  emoji: "🥊", kind: "arm", baseAttack: 1, baseDefense: 1, basePrice: 50, effect: "damage",  baseEffectAmount: 1, description: "Heavy gauntlets that add weight to your swings." },
  { id: "leather-bracers", name: "Leather Bracers", emoji: "🪢", kind: "arm", baseAttack: 0, baseDefense: 2, basePrice: 35, effect: "defense", baseEffectAmount: 1, description: "Snug bracers that absorb impact." },
  { id: "shield-bracer",   name: "Shield Bracer",   emoji: "🛡", kind: "arm", baseAttack: 0, baseDefense: 4, basePrice: 70, effect: "defense", baseEffectAmount: 1, description: "A built-in buckler for quick parries." },
  // Accessories
  { id: "ruby-ring",   name: "Ruby Ring",   emoji: "💍", kind: "accessory", baseAttack: 0, baseDefense: 0, basePrice: 80,  effect: "damage",   baseEffectAmount: 2, description: "A gem that hums with battle-fury." },
  { id: "jade-amulet", name: "Jade Amulet", emoji: "📿", kind: "accessory", baseAttack: 0, baseDefense: 0, basePrice: 90,  effect: "defense",  baseEffectAmount: 2, description: "A ward stone that softens every blow." },
  { id: "life-pendant",name: "Life Pendant",emoji: "💎", kind: "accessory", baseAttack: 0, baseDefense: 0, basePrice: 110, effect: "hp_regen", baseEffectAmount: 2, description: "Slowly knits closed your wounds." },
];

export const ITEM_BY_ID: Record<string, ItemDef> = Object.fromEntries(
  ITEM_CATALOG.map((i) => [i.id, i]),
);

export function computeItemStats(def: ItemDef, rarity: Rarity) {
  const m = RARITY_META[rarity].mult;
  const p = RARITY_META[rarity].priceMult;
  return {
    attack: Math.round(def.baseAttack * m),
    defense: Math.round(def.baseDefense * m),
    price: Math.round(def.basePrice * p),
    effectAmount: def.baseEffectAmount
      ? Math.max(1, Math.round(def.baseEffectAmount * m))
      : 0,
  };
}

export function pickRandomItem(kind?: ItemKind): ItemDef {
  const pool = kind ? ITEM_CATALOG.filter((i) => i.kind === kind) : ITEM_CATALOG;
  return pool[Math.floor(Math.random() * pool.length)];
}