import { JOBS, MAP_SIZE, TILE_H, TILE_W } from "./constants";

export function isoProject(x: number, y: number) {
  return {
    sx: (x - y) * (TILE_W / 2),
    sy: (x + y) * (TILE_H / 2),
  };
}

export function colorFromId(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return `hsl(${h % 360}, 70%, 55%)`;
}

export function pickJob(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return JOBS[h % JOBS.length];
}

function carvePath(
  tiles: ("grass" | "dirt")[][],
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  width = 1,
) {
  const size = tiles.length;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const steps = Math.max(Math.abs(dx), Math.abs(dy), 1);
  for (let i = 0; i <= steps; i++) {
    const cx = x1 + (dx * i) / steps;
    const cy = y1 + (dy * i) / steps;
    for (let oy = -width; oy <= width; oy++) {
      for (let ox = -width; ox <= width; ox++) {
        const px = Math.round(cx + ox);
        const py = Math.round(cy + oy);
        if (px >= 0 && px < size && py >= 0 && py < size) {
          tiles[py][px] = "dirt";
        }
      }
    }
  }
}

// Simple mulberry32 PRNG so each map produces stable scenery.
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type MapBuild = {
  tiles: ("grass" | "dirt")[][];
  props: { type: string; x: number; y: number }[];
};

export function buildMap(opts?: {
  seed?: number;
  size?: number;
  occupied?: { x: number; y: number; r: number }[];
  treeDensity?: number;
  treeType?: string;
}): MapBuild {
  const size = opts?.size ?? MAP_SIZE;
  const seed = opts?.seed ?? 1;
  const occupied = opts?.occupied ?? [];
  const density = opts?.treeDensity ?? 0.06;
  const treeType = opts?.treeType ?? "tree";
  const mid = Math.floor(size / 2);

  const tiles: ("grass" | "dirt")[][] = [];
  for (let y = 0; y < size; y++) {
    tiles[y] = [];
    for (let x = 0; x < size; x++) tiles[y][x] = "grass";
  }

  // Tidy grid plan: 1 horizontal main road (portal-to-portal), 3 vertical roads,
  // 2 horizontal cross-streets, plus a plaza ring around the fountain.
  const leftRoad = 13;
  const rightRoad = 37;
  const topRow = 6;
  const botRow = 44;
  // Main east-west portal road.
  carvePath(tiles, 1, mid, size - 2, mid, 1);
  // Vertical streets.
  carvePath(tiles, leftRoad, topRow - 2, leftRoad, botRow + 2, 0);
  carvePath(tiles, rightRoad, topRow - 2, rightRoad, botRow + 2, 0);
  carvePath(tiles, mid, topRow + 2, mid, botRow - 2, 0);
  // Cross streets that link the verticals.
  carvePath(tiles, leftRoad, topRow, rightRoad, topRow, 0);
  carvePath(tiles, leftRoad, botRow, rightRoad, botRow, 0);
  // Spurs out to side buildings (wizard tower west, dungeon east).
  carvePath(tiles, leftRoad, 12, 7, 12, 0);
  carvePath(tiles, rightRoad, 38, 43, 38, 0);
  // Plaza ring around the fountain.
  carvePath(tiles, mid - 3, mid - 3, mid + 3, mid - 3, 0);
  carvePath(tiles, mid - 3, mid + 3, mid + 3, mid + 3, 0);
  carvePath(tiles, mid - 3, mid - 3, mid - 3, mid + 3, 0);
  carvePath(tiles, mid + 3, mid - 3, mid + 3, mid + 3, 0);

  const rand = rng(seed);
  const props: MapBuild["props"] = [];
  const isFar = (x: number, y: number) =>
    occupied.every((o) => Math.hypot(o.x - x, o.y - y) > o.r);

  // Trees should hug grass only and stay clear of roads (no dirt neighbour
  // within a 1-tile radius) so paths read crisply on the map.
  const awayFromRoad = (x: number, y: number) => {
    for (let oy = -1; oy <= 1; oy++) {
      for (let ox = -1; ox <= 1; ox++) {
        const nx = x + ox;
        const ny = y + oy;
        if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
        if (tiles[ny][nx] === "dirt") return false;
      }
    }
    return true;
  };

  const treeTarget = Math.floor(size * size * density);
  let attempts = 0;
  while (props.length < treeTarget && attempts < treeTarget * 8) {
    attempts++;
    const x = Math.floor(rand() * size);
    const y = Math.floor(rand() * size);
    if (tiles[y][x] !== "grass") continue;
    if (!isFar(x, y)) continue;
    if (!awayFromRoad(x, y)) continue;
    // Don't pile trees on top of each other.
    if (props.some((p) => Math.abs(p.x - x) < 2 && Math.abs(p.y - y) < 2)) continue;
    props.push({ type: treeType, x, y });
  }
  return { tiles, props };
}