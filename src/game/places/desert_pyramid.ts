import type { Place } from "../types";

export const desertPyramid: Place = {
  id: "desert-pyramid-entrance",
  name: "Cursed Pyramid",
  job: "Tomb Raider",
  emoji: "🔺",
  x: 40,
  y: 40,
  sprite: "pyramid",
  description: "An ancient pyramid sealed for millennia. Pharaoh Anubis stirs within.",
  action: "Enter Pyramid (-1 energy)",
  transitionTo: "desert-dungeon",
  perform: ({ toast }) => {
    toast("The pyramid doors creak open…");
  },
};