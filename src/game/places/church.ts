import type { Place } from "../types";

export const church: Place = {
  id: "church",
  name: "Chapel",
  job: "Priest",
  emoji: "⛪",
  x: 25,
  y: 12,
  sprite: "church",
  description: "Pray for blessings and healing.",
  action: "Pray (heal to full)",
  perform: ({ toast }) => {
    toast("Blessed — fully healed");
  },
};