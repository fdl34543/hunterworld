import type { Place } from "../types";

export const market: Place = {
  id: "market",
  name: "Market",
  job: "Merchant",
  emoji: "🛒",
  x: 39,
  y: 25,
  sprite: "market",
  description: "Trade goods and supplies.",
  action: "Sell item",
  perform: ({ award, toast }) => {
    award("place:market");
    toast("Sold loot (+25 gold)");
  },
};