import type { Place } from "../types";

export const beachDungeonEntrance: Place = {
  id: "beach-dungeon-entrance",
  name: "Drowned Grotto",
  job: "Diver",
  emoji: "🌊",
  x: 40,
  y: 38,
  sprite: "beach-dungeon-entrance",
  description: "A sea cave glowing with eerie teal light. The Abyssal Kraken slumbers within.",
  action: "Enter Drowned Grotto (-1 energy)",
  transitionTo: "beach-dungeon",
  perform: ({ toast }) => {
    toast("Salt water laps at your boots…");
  },
};