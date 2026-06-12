import type { Place } from "../types";

export const mountainDungeonEntrance: Place = {
  id: "mountain-dungeon-entrance",
  name: "Frozen Caverns",
  job: "Explorer",
  emoji: "🧊",
  x: 38,
  y: 38,
  sprite: "mountain-dungeon-entrance",
  description: "A glacial cave humming with arcane cold. The Glacial Golem stirs within.",
  action: "Enter Frozen Caverns (-1 energy)",
  transitionTo: "mountain-dungeon",
  perform: ({ toast }) => {
    toast("You step into the bitter cold…");
  },
};