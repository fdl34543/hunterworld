import type { Place } from "../types";

export const bank: Place = {
  id: "bank",
  name: "Bank",
  job: "Banker",
  emoji: "🏦",
  x: 37,
  y: 45,
  sprite: "bank",
  description: "Store your fortune.",
  action: "Deposit (+10 gold bonus)",
  perform: ({ award, toast }) => {
    award("place:bank");
    toast("Deposit bonus (+10 gold)");
  },
};