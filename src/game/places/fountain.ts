import type { Place } from "../types";

export const fountain: Place = {
  id: "fountain",
  name: "Wishing Fountain",
  job: "Mystic",
  emoji: "⛲",
  x: 25,
  y: 25,
  sprite: "fountain",
  description: "Make a wish for fortune.",
  action: "Toss a Coin (+random gold)",
  perform: ({ award, toast }) => {
    const reward = Math.floor(Math.random() * 30) + 1;
    award("place:fountain");
    toast(`The fountain grants +${reward} gold`);
  },
};