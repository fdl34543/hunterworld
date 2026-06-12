export const RARITIES = [
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
  "mythic",
  "ancient",
] as const;

export type Rarity = (typeof RARITIES)[number];

export const RARITY_META: Record<
  Rarity,
  {
    label: string;
    mult: number;
    priceMult: number;
    text: string;
    bg: string;
    border: string;
    ring: string;
    dropWeight: number;
  }
> = {
  common:    { label: "Common",    mult: 1.0, priceMult: 1,   text: "text-slate-700",   bg: "bg-slate-100",   border: "border-slate-300", ring: "ring-slate-300",   dropWeight: 60 },
  uncommon:  { label: "Uncommon",  mult: 1.5, priceMult: 2.4, text: "text-emerald-700", bg: "bg-emerald-50",  border: "border-emerald-400", ring: "ring-emerald-400", dropWeight: 30 },
  rare:      { label: "Rare",      mult: 2.2, priceMult: 5.6, text: "text-sky-700",     bg: "bg-sky-50",      border: "border-sky-400",   ring: "ring-sky-400",     dropWeight: 16 },
  epic:      { label: "Epic",      mult: 3.2, priceMult: 13,  text: "text-purple-700",  bg: "bg-purple-50",   border: "border-purple-500",ring: "ring-purple-500",  dropWeight: 8 },
  legendary: { label: "Legendary", mult: 4.5, priceMult: 28,  text: "text-orange-700",  bg: "bg-orange-50",   border: "border-orange-500",ring: "ring-orange-500",  dropWeight: 3 },
  mythic:    { label: "Mythic",    mult: 6.0, priceMult: 60,  text: "text-pink-700",    bg: "bg-pink-50",     border: "border-pink-500",  ring: "ring-pink-500",    dropWeight: 1 },
  ancient:   { label: "Ancient",   mult: 8.0, priceMult: 140, text: "text-amber-700",   bg: "bg-gradient-to-br from-amber-100 to-red-100", border: "border-amber-500", ring: "ring-amber-500", dropWeight: 0.3 },
};

/** Pick a rarity weighted by drop chance, biased upward by player level. */
export function rollRarity(level: number): Rarity {
  // Higher level → boost rarer drops. Multiply rare+ weights by (1 + level/8).
  const boost = 1 + level / 8;
  const entries = RARITIES.map((r) => {
    const w = RARITY_META[r].dropWeight;
    const isRare = r !== "common" && r !== "uncommon";
    return [r, isRare ? w * boost : w] as const;
  });
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let roll = Math.random() * total;
  for (const [r, w] of entries) {
    roll -= w;
    if (roll <= 0) return r;
  }
  return "common";
}