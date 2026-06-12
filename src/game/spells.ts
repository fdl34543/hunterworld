import { RARITY_META, type Rarity } from "./rarity";

export type SpellEffect = "max_hp" | "damage" | "defense" | "energy";

export type SpellDef = {
  id: string;
  name: string;
  emoji: string;
  effect: SpellEffect;
  baseAmount: number;
  basePrice: number;
  description: string;
};

export const SPELL_CATALOG: SpellDef[] = [
  { id: "hp-tonic",      name: "HP Tonic",       emoji: "❤️", effect: "max_hp",  baseAmount: 10, basePrice: 40, description: "Permanently raises your maximum HP." },
  { id: "strength-brew", name: "Strength Brew",  emoji: "💪", effect: "damage",  baseAmount: 1,  basePrice: 60, description: "Permanently raises your base damage." },
  { id: "iron-skin",     name: "Iron Skin",      emoji: "🛡", effect: "defense", baseAmount: 1,  basePrice: 60, description: "Permanently raises your base defense." },
  { id: "energy-orb",    name: "Energy Orb",     emoji: "🔋", effect: "energy",  baseAmount: 2,  basePrice: 35, description: "Restores a burst of energy immediately." },
];

export const SPELL_BY_ID: Record<string, SpellDef> = Object.fromEntries(
  SPELL_CATALOG.map((s) => [s.id, s]),
);

export function computeSpellStats(def: SpellDef, rarity: Rarity) {
  const m = RARITY_META[rarity].mult;
  const p = RARITY_META[rarity].priceMult;
  return {
    amount: Math.max(1, Math.round(def.baseAmount * m)),
    price: Math.round(def.basePrice * p),
  };
}

export function pickRandomSpell(): SpellDef {
  return SPELL_CATALOG[Math.floor(Math.random() * SPELL_CATALOG.length)];
}