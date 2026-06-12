import type { Place } from "../types";

export const pvpArena: Place = {
  id: "pvp_arena",
  name: "PvP Arena",
  job: "Gladiator",
  emoji: "⚔️",
  x: 38,
  y: 12,
  sprite: "pvp-arena",
  description:
    "🚧 Coming Soon! Battle other players in epic duels and tournaments. This arena is being prepared by the realm's blacksmiths — stay tuned!",
  action: "Notify Me",
  perform: ({ toast }) => {
    toast("⚔️ PvP Arena — Coming Soon!");
  },
};