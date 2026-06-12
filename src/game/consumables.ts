// Catalog of starter inventory items + reward mapping used by the server's
// `useItem` handler and the client tooltip.

export type ConsumableDef = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  effect: "gold" | "xp";
  amount: number;
};

export const CONSUMABLE_CATALOG: ConsumableDef[] = [
  { id: "axe",    name: "Axe",          emoji: "🪓",  description: "Chop wood for a small bounty of coin.", effect: "gold", amount: 3 },
  { id: "pick",   name: "Pick",         emoji: "⛏️",  description: "Mine ore for a decent payout.",          effect: "gold", amount: 5 },
  { id: "rod",    name: "Fishing Rod",  emoji: "🎣",  description: "Cast a line for a quick bite of coin.",  effect: "gold", amount: 2 },
  { id: "trainer-sword", name: "Trainer Sword", emoji: "⚔️", description: "Practice swings to gain experience.", effect: "xp",   amount: 30 },
  { id: "hunting-bow",   name: "Hunting Bow",   emoji: "🏹", description: "Bag small game for a respectable bounty.", effect: "gold", amount: 4 },
  { id: "lucky-potion",  name: "Lucky Potion",  emoji: "🧪", description: "A brew that mysteriously fills your purse.", effect: "gold", amount: 10 },
];

export const CONSUMABLE_BY_ID: Record<string, ConsumableDef> = Object.fromEntries(
  CONSUMABLE_CATALOG.map((c) => [c.id, c]),
);

/** Slot positions 0..5 for the six starter items granted to new players. */
export const STARTER_ORDER = CONSUMABLE_CATALOG.map((c) => c.id);