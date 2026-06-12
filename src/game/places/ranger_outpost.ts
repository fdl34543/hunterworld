import type { Place } from "../types";

export const rangerOutpost: Place = {
  id: "ranger-outpost",
  name: "Ranger Outpost",
  job: "Mountaineer",
  emoji: "🏔️",
  x: 12,
  y: 16,
  sprite: "ranger-outpost",
  description: "A snowbound cabin where mountain rangers warm themselves by the fire.",
  action: "Trade Pelts (+25 gold)",
  perform: ({ award, toast }) => {
    award("place:ranger-outpost");
    toast("Ranger trades you for frost pelts (+25 gold)");
  },
};