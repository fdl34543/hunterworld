import type { Place } from "../types";

export const oasis: Place = {
  id: "oasis",
  name: "Hidden Oasis",
  job: "Wayfarer",
  emoji: "🌴",
  x: 12,
  y: 14,
  sprite: "oasis",
  description: "A rare pool of cool spring water amid the dunes. Restores the spirit.",
  action: "Drink (+8 gold tip from caravan)",
  perform: ({ award, toast }) => {
    award("place:oasis");
    toast("A caravan thanks you with coin (+8 gold)");
  },
};