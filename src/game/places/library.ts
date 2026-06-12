import type { Place } from "../types";

export const library: Place = {
  id: "library",
  name: "Library",
  job: "Scholar",
  emoji: "📚",
  x: 37,
  y: 6,
  sprite: "library",
  description: "Study ancient tomes for wisdom.",
  action: "Study (+50 XP)",
  perform: ({ openStudy, toast }) => {
    if (openStudy) openStudy();
    else toast("Study unavailable");
  },
};