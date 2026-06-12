import type { Place } from "../types";

export const inn: Place = {
  id: "inn",
  name: "Cozy Inn",
  job: "Innkeeper",
  emoji: "🛏️",
  x: 13,
  y: 45,
  sprite: "inn",
  description: "Rest for the night and recover.",
  action: "Rest (+15 gold tip)",
  perform: ({ award, toast }) => {
    award("place:inn");
    toast("Well rested (+15 gold)");
  },
};