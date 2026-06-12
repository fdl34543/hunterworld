import type { MonsterSpawn } from "./types";

export type SeasonId = "spring" | "summer" | "autumn" | "winter";

export type Season = {
  id: SeasonId;
  name: string;
  emoji: string;
  /** Tailwind classes for the badge background gradient. */
  badgeClass: string;
  /** Boss def id from MONSTER_DEFS. */
  bossDefId: string;
  bossName: string;
  /** Short tagline / effect description shown in the UI. */
  effect: string;
};

/** Duration of each season in ms — 1 week per season, ~1 month full cycle. */
export const SEASON_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

/** Cycle anchor — fixed epoch so all clients agree on the current season. */
const SEASON_ANCHOR_MS = Date.UTC(2026, 0, 1, 0, 0, 0);

export const SEASONS: Season[] = [
  {
    id: "spring",
    name: "Spring",
    emoji: "🌸",
    badgeClass: "from-pink-400 to-emerald-400",
    bossDefId: "world_tree_guardian",
    bossName: "World Tree Guardian",
    effect: "Petals drift across the land",
  },
  {
    id: "summer",
    name: "Summer",
    emoji: "☀️",
    badgeClass: "from-amber-400 to-orange-500",
    bossDefId: "leviathan",
    bossName: "Leviathan",
    effect: "Sun-scorched heat haze shimmers",
  },
  {
    id: "autumn",
    name: "Autumn",
    emoji: "🍂",
    badgeClass: "from-orange-500 to-red-600",
    bossDefId: "harvest_titan",
    bossName: "Harvest Titan",
    effect: "Falling leaves blanket the world",
  },
  {
    id: "winter",
    name: "Winter",
    emoji: "❄️",
    badgeClass: "from-sky-300 to-indigo-500",
    bossDefId: "frost_dragon",
    bossName: "Ancient Frost Dragon",
    effect: "A frigid snowstorm rages",
  },
];

export function getCurrentSeason(now: number = Date.now()): {
  season: Season;
  index: number;
  remainingMs: number;
  elapsedMs: number;
} {
  const delta = Math.max(0, now - SEASON_ANCHOR_MS);
  const idx = Math.floor(delta / SEASON_DURATION_MS) % SEASONS.length;
  const elapsed = delta % SEASON_DURATION_MS;
  return {
    season: SEASONS[idx],
    index: idx,
    elapsedMs: elapsed,
    remainingMs: SEASON_DURATION_MS - elapsed,
  };
}

/** Where the world boss spawns on the town overworld map. */
export const WORLD_BOSS_SPAWN: MonsterSpawn = { defId: "world_boss", x: 25, y: 12 };

/** Map id used to track world-boss cooldown separately per season. */
export function worldBossMapId(seasonId: SeasonId): string {
  return `world-${seasonId}`;
}