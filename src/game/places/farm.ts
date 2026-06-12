import type { Place } from "../types";

export const farm: Place = {
  id: "farm",
  name: "Sunny Farm",
  job: "Farmer",
  emoji: "🌾",
  x: 25,
  y: 38,
  sprite: "farm",
  description: "Tend crops for a steady harvest.",
  action: "Harvest (+12 gold)",
  perform: ({ award, toast }) => {
    award("place:farm");
    toast("Harvested crops (+12 gold)");
  },
};