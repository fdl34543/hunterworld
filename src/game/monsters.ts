import type { MonsterDef, MonsterSpawn } from "./types";

export const MONSTER_DEFS: Record<string, MonsterDef> = {
  slime: {
    id: "slime",
    name: "Slime",
    emoji: "🟢",
    sprite: "monster-slime",
    hp: 30,
    damage: 4,
    reward: 8,
    speed: 1.4,
    aggroRange: 5,
    attackRange: 1.1,
    attackCooldown: 1200,
  },
  skeleton: {
    id: "skeleton",
    name: "Skeleton",
    emoji: "💀",
    sprite: "monster-skeleton",
    hp: 60,
    damage: 8,
    reward: 18,
    speed: 1.8,
    aggroRange: 6,
    attackRange: 1.2,
    attackCooldown: 1400,
  },
  bat: {
    id: "bat",
    name: "Bat",
    emoji: "🦇",
    sprite: "monster-bat",
    hp: 20,
    damage: 3,
    reward: 6,
    speed: 2.4,
    aggroRange: 7,
    attackRange: 0.9,
    attackCooldown: 900,
  },
  boss: {
    id: "boss",
    name: "Dungeon Boss",
    emoji: "👑",
    sprite: "monster-skeleton",
    hp: 220,
    damage: 14,
    reward: 200,
    speed: 1.6,
    aggroRange: 8,
    attackRange: 1.4,
    attackCooldown: 1300,
  },
  wolf: {
    id: "wolf",
    name: "Dire Wolf",
    emoji: "🐺",
    sprite: "monster-wolf",
    hp: 45,
    damage: 7,
    reward: 14,
    speed: 2.2,
    aggroRange: 7,
    attackRange: 1.1,
    attackCooldown: 1100,
  },
  spider: {
    id: "spider",
    name: "Forest Spider",
    emoji: "🕷️",
    sprite: "monster-spider",
    hp: 35,
    damage: 6,
    reward: 12,
    speed: 1.9,
    aggroRange: 6,
    attackRange: 1.0,
    attackCooldown: 1100,
  },
  treant: {
    id: "treant",
    name: "Treant",
    emoji: "🌳",
    sprite: "monster-treant",
    hp: 90,
    damage: 11,
    reward: 28,
    speed: 1.2,
    aggroRange: 5,
    attackRange: 1.3,
    attackCooldown: 1500,
  },
  werewolf_boss: {
    id: "werewolf_boss",
    name: "Alpha Werewolf",
    emoji: "🌕",
    sprite: "monster-werewolf",
    hp: 280,
    damage: 17,
    reward: 260,
    speed: 1.9,
    aggroRange: 9,
    attackRange: 1.4,
    attackCooldown: 1200,
  },
  scorpion: {
    id: "scorpion",
    name: "Sand Scorpion",
    emoji: "🦂",
    sprite: "monster-scorpion",
    hp: 55,
    damage: 9,
    reward: 16,
    speed: 1.7,
    aggroRange: 6,
    attackRange: 1.1,
    attackCooldown: 1200,
  },
  mummy: {
    id: "mummy",
    name: "Wandering Mummy",
    emoji: "🧟",
    sprite: "monster-mummy",
    hp: 80,
    damage: 12,
    reward: 22,
    speed: 1.3,
    aggroRange: 6,
    attackRange: 1.2,
    attackCooldown: 1400,
  },
  sandworm: {
    id: "sandworm",
    name: "Sandworm",
    emoji: "🪱",
    sprite: "monster-sandworm",
    hp: 110,
    damage: 14,
    reward: 32,
    speed: 1.5,
    aggroRange: 7,
    attackRange: 1.3,
    attackCooldown: 1500,
  },
  pharaoh_boss: {
    id: "pharaoh_boss",
    name: "Pharaoh Anubis",
    emoji: "👑",
    sprite: "monster-pharaoh",
    hp: 340,
    damage: 19,
    reward: 320,
    speed: 1.7,
    aggroRange: 9,
    attackRange: 1.5,
    attackCooldown: 1250,
  },
  world_tree_guardian: {
    id: "world_tree_guardian",
    name: "World Tree Guardian",
    emoji: "🌸",
    sprite: "monster-world-tree",
    hp: 520,
    damage: 22,
    reward: 500,
    speed: 1.0,
    aggroRange: 9,
    attackRange: 1.6,
    attackCooldown: 1500,
  },
  leviathan: {
    id: "leviathan",
    name: "Leviathan",
    emoji: "🌊",
    sprite: "monster-leviathan",
    hp: 560,
    damage: 24,
    reward: 520,
    speed: 1.6,
    aggroRange: 10,
    attackRange: 1.7,
    attackCooldown: 1400,
  },
  harvest_titan: {
    id: "harvest_titan",
    name: "Harvest Titan",
    emoji: "🎃",
    sprite: "monster-harvest-titan",
    hp: 600,
    damage: 26,
    reward: 540,
    speed: 1.2,
    aggroRange: 9,
    attackRange: 1.6,
    attackCooldown: 1450,
  },
  frost_dragon: {
    id: "frost_dragon",
    name: "Ancient Frost Dragon",
    emoji: "🐉",
    sprite: "monster-frost-dragon",
    hp: 680,
    damage: 28,
    reward: 600,
    speed: 1.7,
    aggroRange: 11,
    attackRange: 1.8,
    attackCooldown: 1400,
  },
  yeti: {
    id: "yeti",
    name: "Snow Yeti",
    emoji: "🦍",
    sprite: "monster-yeti",
    hp: 130,
    damage: 16,
    reward: 38,
    speed: 1.4,
    aggroRange: 6,
    attackRange: 1.3,
    attackCooldown: 1400,
  },
  ice_wolf: {
    id: "ice_wolf",
    name: "Frost Wolf",
    emoji: "🐺",
    sprite: "monster-ice-wolf",
    hp: 95,
    damage: 13,
    reward: 28,
    speed: 2.1,
    aggroRange: 7,
    attackRange: 1.1,
    attackCooldown: 1100,
  },
  frost_imp: {
    id: "frost_imp",
    name: "Frost Imp",
    emoji: "❄️",
    sprite: "monster-frost-imp",
    hp: 70,
    damage: 11,
    reward: 22,
    speed: 2.0,
    aggroRange: 7,
    attackRange: 1.0,
    attackCooldown: 1000,
  },
  ice_golem_boss: {
    id: "ice_golem_boss",
    name: "Glacial Golem",
    emoji: "🧊",
    sprite: "monster-ice-golem",
    hp: 420,
    damage: 22,
    reward: 420,
    speed: 1.4,
    aggroRange: 9,
    attackRange: 1.5,
    attackCooldown: 1300,
  },
  crab: {
    id: "crab",
    name: "Giant Crab",
    emoji: "🦀",
    sprite: "monster-crab",
    hp: 110,
    damage: 14,
    reward: 30,
    speed: 1.5,
    aggroRange: 6,
    attackRange: 1.1,
    attackCooldown: 1200,
  },
  pirate: {
    id: "pirate",
    name: "Pirate Skeleton",
    emoji: "🏴‍☠️",
    sprite: "monster-pirate",
    hp: 140,
    damage: 17,
    reward: 36,
    speed: 1.8,
    aggroRange: 7,
    attackRange: 1.2,
    attackCooldown: 1200,
  },
  merfolk: {
    id: "merfolk",
    name: "Merfolk Raider",
    emoji: "🧜",
    sprite: "monster-merfolk",
    hp: 170,
    damage: 19,
    reward: 42,
    speed: 1.7,
    aggroRange: 7,
    attackRange: 1.3,
    attackCooldown: 1300,
  },
  kraken_boss: {
    id: "kraken_boss",
    name: "Abyssal Kraken",
    emoji: "🐙",
    sprite: "monster-kraken",
    hp: 480,
    damage: 24,
    reward: 460,
    speed: 1.5,
    aggroRange: 10,
    attackRange: 1.7,
    attackCooldown: 1350,
  },
};

export const MAP_MONSTERS: Record<string, MonsterSpawn[]> = {};

/**
 * Pick dungeon spawns scaled to the player's level.
 * Tier 1 (lvl 0-4): mostly slimes & bats.
 * Tier 2 (lvl 5-12): mix of slimes, skeletons, bats.
 * Tier 3 (lvl 13+): mostly skeletons.
 */
export function dungeonSpawnsForLevel(level: number): MonsterSpawn[] {
  const baseSlots: Array<{ x: number; y: number }> = [
    { x: 18, y: 22 }, { x: 21, y: 28 }, { x: 30, y: 24 },
    { x: 26, y: 18 }, { x: 32, y: 32 }, { x: 14, y: 26 },
    { x: 24, y: 14 }, { x: 36, y: 28 }, { x: 20, y: 36 },
    { x: 16, y: 32 }, { x: 34, y: 16 }, { x: 28, y: 34 },
    { x: 12, y: 20 }, { x: 38, y: 22 }, { x: 22, y: 20 },
    { x: 34, y: 36 }, { x: 16, y: 38 }, { x: 30, y: 30 },
    { x: 10, y: 24 }, { x: 40, y: 26 }, { x: 14, y: 14 },
    { x: 36, y: 36 }, { x: 20, y: 10 }, { x: 30, y: 10 },
    { x: 10, y: 30 }, { x: 40, y: 18 }, { x: 26, y: 38 },
    { x: 18, y: 34 }, { x: 32, y: 14 }, { x: 22, y: 26 },
  ];
  // Monster count scales aggressively: 10 at lvl 0, +1 per level, capped at slots.
  const count = Math.min(baseSlots.length, 10 + level);
  let pool: string[];
  if (level <= 4) {
    pool = ["slime", "slime", "slime", "bat", "bat", "slime", "bat", "slime"];
  } else if (level <= 12) {
    pool = ["slime", "skeleton", "skeleton", "bat", "skeleton", "bat", "skeleton", "slime"];
  } else {
    pool = ["skeleton", "skeleton", "skeleton", "bat", "skeleton", "skeleton", "skeleton", "bat"];
  }
  return baseSlots.slice(0, count).map((s, i) => ({ defId: pool[i % pool.length], ...s }));
}

export const BOSS_SPAWN: MonsterSpawn = { defId: "boss", x: 25, y: 25 };

/** Forest overworld spawns — wolves & spiders, fewer than the dungeon. */
export function forestSpawnsForLevel(level: number): MonsterSpawn[] {
  const slots: Array<{ x: number; y: number }> = [
    { x: 8, y: 18 }, { x: 12, y: 32 }, { x: 18, y: 10 },
    { x: 22, y: 40 }, { x: 28, y: 14 }, { x: 32, y: 36 },
    { x: 38, y: 20 }, { x: 42, y: 32 }, { x: 16, y: 26 },
    { x: 26, y: 28 }, { x: 34, y: 8 }, { x: 8, y: 40 },
    { x: 40, y: 10 }, { x: 20, y: 22 }, { x: 30, y: 44 },
  ];
  const count = Math.min(slots.length, 6 + Math.floor(level / 2));
  const pool = level <= 6
    ? ["wolf", "spider", "wolf", "spider", "wolf"]
    : ["wolf", "spider", "wolf", "treant", "spider", "wolf"];
  return slots.slice(0, count).map((s, i) => ({ defId: pool[i % pool.length], ...s }));
}

/** Forest dungeon spawns — dense, treant-heavy. */
export function forestDungeonSpawnsForLevel(level: number): MonsterSpawn[] {
  const slots: Array<{ x: number; y: number }> = [
    { x: 18, y: 22 }, { x: 21, y: 28 }, { x: 30, y: 24 },
    { x: 26, y: 18 }, { x: 32, y: 32 }, { x: 14, y: 26 },
    { x: 24, y: 14 }, { x: 36, y: 28 }, { x: 20, y: 36 },
    { x: 16, y: 32 }, { x: 34, y: 16 }, { x: 28, y: 34 },
    { x: 12, y: 20 }, { x: 38, y: 22 }, { x: 22, y: 20 },
    { x: 34, y: 36 }, { x: 16, y: 38 }, { x: 30, y: 30 },
    { x: 10, y: 24 }, { x: 40, y: 26 }, { x: 14, y: 14 },
    { x: 36, y: 36 }, { x: 20, y: 10 }, { x: 30, y: 10 },
  ];
  const count = Math.min(slots.length, 10 + level);
  const pool = level <= 8
    ? ["wolf", "spider", "treant", "wolf", "spider", "wolf", "treant"]
    : ["treant", "wolf", "treant", "spider", "treant", "wolf", "treant"];
  return slots.slice(0, count).map((s, i) => ({ defId: pool[i % pool.length], ...s }));
}

export const FOREST_BOSS_SPAWN: MonsterSpawn = { defId: "werewolf_boss", x: 25, y: 25 };

/** Desert overworld spawns — scorpions & mummies roam the dunes. */
export function desertSpawnsForLevel(level: number): MonsterSpawn[] {
  const slots: Array<{ x: number; y: number }> = [
    { x: 8, y: 20 }, { x: 16, y: 8 }, { x: 22, y: 30 },
    { x: 30, y: 18 }, { x: 36, y: 30 }, { x: 26, y: 10 },
    { x: 40, y: 18 }, { x: 8, y: 30 }, { x: 32, y: 8 },
    { x: 20, y: 22 }, { x: 28, y: 26 }, { x: 34, y: 14 },
    { x: 18, y: 28 }, { x: 30, y: 34 }, { x: 24, y: 18 },
  ];
  const count = Math.min(slots.length, 6 + Math.floor(level / 2));
  const pool = level <= 12
    ? ["scorpion", "mummy", "scorpion", "mummy", "scorpion"]
    : ["scorpion", "mummy", "sandworm", "mummy", "scorpion", "sandworm"];
  return slots.slice(0, count).map((s, i) => ({ defId: pool[i % pool.length], ...s }));
}

/** Desert dungeon (pyramid) spawns — dense, sandworm-heavy. */
export function desertDungeonSpawnsForLevel(level: number): MonsterSpawn[] {
  const slots: Array<{ x: number; y: number }> = [
    { x: 18, y: 22 }, { x: 21, y: 28 }, { x: 30, y: 24 },
    { x: 26, y: 18 }, { x: 32, y: 32 }, { x: 14, y: 26 },
    { x: 24, y: 14 }, { x: 36, y: 28 }, { x: 20, y: 36 },
    { x: 16, y: 32 }, { x: 34, y: 16 }, { x: 28, y: 34 },
    { x: 12, y: 20 }, { x: 38, y: 22 }, { x: 22, y: 20 },
    { x: 34, y: 36 }, { x: 16, y: 38 }, { x: 30, y: 30 },
    { x: 10, y: 24 }, { x: 40, y: 26 }, { x: 14, y: 14 },
    { x: 36, y: 36 }, { x: 20, y: 10 }, { x: 30, y: 10 },
  ];
  const count = Math.min(slots.length, 10 + level);
  const pool = level <= 12
    ? ["mummy", "scorpion", "mummy", "sandworm", "mummy", "scorpion", "mummy"]
    : ["sandworm", "mummy", "sandworm", "scorpion", "sandworm", "mummy", "sandworm"];
  return slots.slice(0, count).map((s, i) => ({ defId: pool[i % pool.length], ...s }));
}

export const DESERT_BOSS_SPAWN: MonsterSpawn = { defId: "pharaoh_boss", x: 25, y: 25 };

/** Mountain overworld spawns — yetis, ice wolves & frost imps roam the peaks. */
export function mountainSpawnsForLevel(level: number): MonsterSpawn[] {
  const slots: Array<{ x: number; y: number }> = [
    { x: 8, y: 18 }, { x: 14, y: 30 }, { x: 20, y: 12 },
    { x: 24, y: 38 }, { x: 30, y: 16 }, { x: 34, y: 34 },
    { x: 38, y: 22 }, { x: 42, y: 30 }, { x: 16, y: 24 },
    { x: 26, y: 28 }, { x: 32, y: 10 }, { x: 10, y: 38 },
    { x: 36, y: 12 }, { x: 22, y: 22 }, { x: 28, y: 42 },
  ];
  const count = Math.min(slots.length, 6 + Math.floor(level / 2));
  const pool = level <= 16
    ? ["frost_imp", "ice_wolf", "frost_imp", "yeti", "ice_wolf"]
    : ["yeti", "ice_wolf", "yeti", "frost_imp", "ice_wolf", "yeti"];
  return slots.slice(0, count).map((s, i) => ({ defId: pool[i % pool.length], ...s }));
}

/** Mountain dungeon (Frozen Caverns) spawns — dense, yeti-heavy. */
export function mountainDungeonSpawnsForLevel(level: number): MonsterSpawn[] {
  const slots: Array<{ x: number; y: number }> = [
    { x: 18, y: 22 }, { x: 21, y: 28 }, { x: 30, y: 24 },
    { x: 26, y: 18 }, { x: 32, y: 32 }, { x: 14, y: 26 },
    { x: 24, y: 14 }, { x: 36, y: 28 }, { x: 20, y: 36 },
    { x: 16, y: 32 }, { x: 34, y: 16 }, { x: 28, y: 34 },
    { x: 12, y: 20 }, { x: 38, y: 22 }, { x: 22, y: 20 },
    { x: 34, y: 36 }, { x: 16, y: 38 }, { x: 30, y: 30 },
    { x: 10, y: 24 }, { x: 40, y: 26 }, { x: 14, y: 14 },
    { x: 36, y: 36 }, { x: 20, y: 10 }, { x: 30, y: 10 },
  ];
  const count = Math.min(slots.length, 10 + level);
  const pool = level <= 18
    ? ["yeti", "ice_wolf", "yeti", "frost_imp", "yeti", "ice_wolf", "yeti"]
    : ["yeti", "yeti", "ice_wolf", "yeti", "frost_imp", "yeti", "yeti"];
  return slots.slice(0, count).map((s, i) => ({ defId: pool[i % pool.length], ...s }));
}

export const MOUNTAIN_BOSS_SPAWN: MonsterSpawn = { defId: "ice_golem_boss", x: 25, y: 25 };

/** Beach overworld spawns — crabs, pirates & merfolk patrol the shore. */
export function beachSpawnsForLevel(level: number): MonsterSpawn[] {
  const slots: Array<{ x: number; y: number }> = [
    { x: 10, y: 20 }, { x: 16, y: 10 }, { x: 22, y: 32 },
    { x: 28, y: 18 }, { x: 34, y: 32 }, { x: 26, y: 12 },
    { x: 40, y: 20 }, { x: 8, y: 32 }, { x: 32, y: 10 },
    { x: 20, y: 24 }, { x: 28, y: 28 }, { x: 36, y: 16 },
    { x: 18, y: 30 }, { x: 30, y: 36 }, { x: 24, y: 20 },
  ];
  const count = Math.min(slots.length, 6 + Math.floor(level / 2));
  const pool = level <= 22
    ? ["crab", "pirate", "crab", "pirate", "crab"]
    : ["crab", "pirate", "merfolk", "pirate", "merfolk", "crab"];
  return slots.slice(0, count).map((s, i) => ({ defId: pool[i % pool.length], ...s }));
}

/** Beach dungeon (Drowned Grotto) spawns — dense, merfolk-heavy. */
export function beachDungeonSpawnsForLevel(level: number): MonsterSpawn[] {
  const slots: Array<{ x: number; y: number }> = [
    { x: 18, y: 22 }, { x: 21, y: 28 }, { x: 30, y: 24 },
    { x: 26, y: 18 }, { x: 32, y: 32 }, { x: 14, y: 26 },
    { x: 24, y: 14 }, { x: 36, y: 28 }, { x: 20, y: 36 },
    { x: 16, y: 32 }, { x: 34, y: 16 }, { x: 28, y: 34 },
    { x: 12, y: 20 }, { x: 38, y: 22 }, { x: 22, y: 20 },
    { x: 34, y: 36 }, { x: 16, y: 38 }, { x: 30, y: 30 },
    { x: 10, y: 24 }, { x: 40, y: 26 }, { x: 14, y: 14 },
    { x: 36, y: 36 }, { x: 20, y: 10 }, { x: 30, y: 10 },
  ];
  const count = Math.min(slots.length, 10 + level);
  const pool = level <= 24
    ? ["merfolk", "pirate", "merfolk", "crab", "merfolk", "pirate", "merfolk"]
    : ["merfolk", "merfolk", "pirate", "merfolk", "crab", "merfolk", "merfolk"];
  return slots.slice(0, count).map((s, i) => ({ defId: pool[i % pool.length], ...s }));
}

export const BEACH_BOSS_SPAWN: MonsterSpawn = { defId: "kraken_boss", x: 25, y: 25 };

/** Per-level scaling for hp / damage / reward. */
export function monsterScale(level: number) {
  return 1 + level * 0.2;
}