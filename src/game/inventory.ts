import { INVENTORY_SIZE } from "./constants";
import type { InventoryItem } from "./types";

export const INVENTORY: InventoryItem[] = [
  {
    id: "axe",
    name: "Axe",
    emoji: "🪓",
    effect: "Chop tree (+3 gold)",
    description: "A sturdy woodcutter's axe. Swing it at any tree to harvest planks worth a few coins at the market.",
    use: ({ award, toast }) => {
      award("tool:axe");
      toast("Chopped wood (+3 gold)");
    },
  },
  {
    id: "pick",
    name: "Pick",
    emoji: "⛏️",
    effect: "Mine ore (+5 gold)",
    description: "Heavy iron pickaxe. Best used against rocky outcrops to chip out raw ore.",
    use: ({ award, toast }) => {
      award("tool:pick");
      toast("Mined ore (+5 gold)");
    },
  },
  {
    id: "rod",
    name: "Fishing Rod",
    emoji: "🎣",
    effect: "Fish (+2 gold)",
    description: "A flexible bamboo rod. Cast it near water to reel in dinner — or a lucky pearl.",
    use: ({ award, toast }) => {
      award("tool:rod");
      toast("Caught a fish (+2 gold)");
    },
  },
  {
    id: "sword",
    name: "Sword",
    emoji: "⚔️",
    effect: "Train (+30 XP)",
    description: "A well-balanced blade. Practice swings with it to sharpen your skills and earn experience.",
    use: ({ award, toast }) => {
      award("tool:sword");
      toast("Trained (+30 XP)");
    },
  },
  {
    id: "bow",
    name: "Bow",
    emoji: "🏹",
    effect: "Hunt (+4 gold)",
    description: "A hunter's longbow. Bag small game for a respectable bounty of coin.",
    use: ({ award, toast }) => {
      award("tool:bow");
      toast("Hunted (+4 gold)");
    },
  },
  {
    id: "potion",
    name: "Lucky Potion",
    emoji: "🧪",
    effect: "Lucky brew (+10 gold)",
    description: "A shimmering brew of dubious origin. Drinking it tends to make coins appear in your pouch.",
    use: ({ award, toast }) => {
      award("tool:potion");
      toast("Drank potion (+10 gold)");
    },
  },
];

export const ITEM_DEFS: Record<string, InventoryItem> = INVENTORY.reduce(
  (acc, it) => {
    acc[it.id] = it;
    return acc;
  },
  {} as Record<string, InventoryItem>,
);

export const initialSlots = (): (string | null)[] => {
  const s: (string | null)[] = Array(INVENTORY_SIZE).fill(null);
  INVENTORY.forEach((it, i) => {
    s[i] = it.id;
  });
  return s;
};