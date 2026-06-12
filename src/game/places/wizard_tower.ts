import type { Place } from "../types";

export const wizardTower: Place = {
  id: "wizard-tower",
  name: "Wizard Tower",
  job: "Archmage",
  emoji: "🧙",
  x: 7,
  y: 12,
  sprite: "wizard-tower",
  description: "Buy arcane spells to permanently boost your stats.",
  action: "Browse Spells",
  perform: ({ toast }) => {
    toast("The archmage welcomes you.");
  },
};