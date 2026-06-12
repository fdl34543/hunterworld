import type { Place } from "../types";

export const blacksmith: Place = {
  id: "blacksmith",
  name: "Blacksmith",
  job: "Warrior",
  emoji: "⚒️",
  x: 11,
  y: 25,
  sprite: "blacksmith",
  description: "Forge weapons and armor.",
  action: "Browse Forge",
  perform: ({ toast }) => {
    toast("Welcome to the forge!");
  },
};