import type { Place } from "../types";

export const desertTent: Place = {
  id: "desert-tent",
  name: "Nomad's Tent",
  job: "Trader",
  emoji: "⛺",
  x: 14,
  y: 36,
  sprite: "desert-tent",
  description: "A wandering trader brews mint tea and trades tall tales for coin.",
  action: "Trade tales (+25 XP)",
  perform: ({ award, toast }) => {
    award("place:desert-tent");
    toast("The nomad shares ancient lore (+25 XP)");
  },
};