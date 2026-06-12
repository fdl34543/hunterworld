import type { Place } from "../types";

export const forestDungeonEntrance: Place = {
  id: "forest-dungeon-entrance",
  name: "Hollow Tree",
  job: "Warden",
  emoji: "🌲",
  x: 40,
  y: 40,
  sprite: "forest-dungeon-entrance",
  description: "A hollow ancient tree humming with green magic. The Alpha Werewolf lairs within.",
  action: "Enter Forest Dungeon (-1 energy)",
  transitionTo: "forest-dungeon",
  perform: ({ toast }) => {
    toast("Descending into the hollow…");
  },
};