import type { Place } from "../types";

export const dungeonEntrance: Place = {
  id: "dungeon-entrance",
  name: "Dungeon Gate",
  job: "Guardian",
  emoji: "🗝️",
  x: 43,
  y: 38,
  sprite: "dungeon-entrance",
  description: "A foreboding doorway to the Ember Dungeon. Monsters lurk inside.",
  action: "Enter Dungeon (-1 energy)",
  transitionTo: "dungeon",
  perform: ({ toast }) => {
    // Energy is checked & spent in the GameCanvas onAction handler before
    // the transition fires; this just confirms.
    toast("Entering the dungeon…");
  },
};