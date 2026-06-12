import type { Place } from "../types";

export const beachHut: Place = {
  id: "beach-hut",
  name: "Beach Hut",
  job: "Castaway",
  emoji: "🏝️",
  x: 12,
  y: 14,
  sprite: "beach-hut",
  description: "A breezy thatched hut on stilts. A castaway sells salvage from shipwrecks.",
  action: "Buy Salvage (+20 gold)",
  perform: ({ award, toast }) => {
    award("place:beach-hut");
    toast("The castaway pays you for shells (+20 gold)");
  },
};