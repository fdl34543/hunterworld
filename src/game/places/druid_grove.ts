import type { Place } from "../types";

export const druidGrove: Place = {
  id: "druid-grove",
  name: "Druid Grove",
  job: "Druid",
  emoji: "🍄",
  x: 38,
  y: 12,
  sprite: "druid-grove",
  description: "Ancient stones that mend the weary. The druids restore your HP.",
  action: "Commune (+full HP)",
  perform: ({ toast }) => {
    toast("The grove restores you to full health");
  },
};