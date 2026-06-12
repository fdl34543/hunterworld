import type { Place } from "../types";

export const hunterLodge: Place = {
  id: "hunter-lodge",
  name: "Hunter's Lodge",
  job: "Ranger",
  emoji: "🏹",
  x: 10,
  y: 14,
  sprite: "hunter-lodge",
  description: "A rugged cabin where rangers rest. Bounty paid for slain beasts.",
  action: "Collect Bounty (+15 gold)",
  perform: ({ award, toast }) => {
    award("place:hunter-lodge");
    toast("Ranger pays you for pelts (+15 gold)");
  },
};