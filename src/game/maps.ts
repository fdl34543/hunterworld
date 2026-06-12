import townImg from "@/assets/map-town.jpg";
import forestImg from "@/assets/map-forest.jpg";
import desertImg from "@/assets/map-desert.jpg";
import mountainImg from "@/assets/map-mountain.jpg";
import beachImg from "@/assets/map-beach.jpg";
import dungeonImg from "@/assets/map-dungeon.jpg";

import { MAP_SIZE } from "./constants";
import {
  TOWN_PLACES,
  FOREST_PLACES,
  DESERT_PLACES,
  MOUNTAIN_PLACES,
  BEACH_PLACES,
} from "./places";
import type { Place, Portal } from "./types";

export type MapTheme = {
  grass: [string, string];
  dirt: [string, string];
  grassEdge: [string, string];
  dirtEdge: [string, string];
  sky: [string, string];
};

export type MapDef = {
  id: string;
  name: string;
  description: string;
  minLevel: number;
  image: string;
  theme: MapTheme;
  seed: number;
  treeDensity: number;
  places: Place[];
  portals: Portal[];
  /** Hide from the portal travel modal (e.g. side dungeons reached via places). */
  hidden?: boolean;
  /** Apply a night-vision darkness overlay around the player. */
  nightVision?: boolean;
};

const mid = Math.floor(MAP_SIZE / 2);

const PORTALS_LR: Portal[] = [
  { id: "left", name: "Left Portal", x: 2, y: mid },
  { id: "right", name: "Right Portal", x: MAP_SIZE - 3, y: mid },
];

const TOWN_THEME: MapTheme = {
  grass: ["#6ec547", "#65b840"],
  dirt: ["#d9b376", "#cda968"],
  grassEdge: ["#4a8a2e", "#3e7526"],
  dirtEdge: ["#a07a48", "#8a663a"],
  sky: ["#87ceeb", "#bce28b"],
};

const FOREST_THEME: MapTheme = {
  grass: ["#3f8f3a", "#357a32"],
  dirt: ["#7a6244", "#6b563a"],
  grassEdge: ["#244e22", "#1c3d1a"],
  dirtEdge: ["#4e3d27", "#3b2d1b"],
  sky: ["#1f2937", "#3b5c40"],
};

const DESERT_THEME: MapTheme = {
  grass: ["#e8c87a", "#dab465"],
  dirt: ["#c69856", "#b78643"],
  grassEdge: ["#a8843a", "#8a6a2c"],
  dirtEdge: ["#8a6428", "#6f4e1c"],
  sky: ["#ffd07a", "#f4a14a"],
};

const MOUNTAIN_THEME: MapTheme = {
  grass: ["#dde8f0", "#c6d4e0"],
  dirt: ["#8aa0b4", "#7891a8"],
  grassEdge: ["#9fb3c4", "#88a0b2"],
  dirtEdge: ["#566a7c", "#41525f"],
  sky: ["#a8c8e8", "#dbe9f2"],
};

const BEACH_THEME: MapTheme = {
  grass: ["#f6e3a1", "#ecd789"],
  dirt: ["#d5b76a", "#c2a557"],
  grassEdge: ["#b89645", "#9a7c34"],
  dirtEdge: ["#8a6a28", "#6c521d"],
  sky: ["#5ed1e8", "#a8ecf4"],
};

const DUNGEON_THEME: MapTheme = {
  grass: ["#3a2a2a", "#2f2222"],
  dirt: ["#5a3030", "#4a2828"],
  grassEdge: ["#1c1414", "#120d0d"],
  dirtEdge: ["#3a1818", "#2a1212"],
  sky: ["#1a0a0a", "#4a1818"],
};

const DESERT_DUNGEON_THEME: MapTheme = {
  grass: ["#b8893f", "#a87830"],
  dirt: ["#7a5320", "#603f18"],
  grassEdge: ["#74521e", "#5c3f14"],
  dirtEdge: ["#3f2810", "#2a1a08"],
  sky: ["#2a160a", "#5a2a10"],
};

const MOUNTAIN_DUNGEON_THEME: MapTheme = {
  grass: ["#8aa6c0", "#6f8aa4"],
  dirt: ["#48607a", "#33485e"],
  grassEdge: ["#4a5e74", "#34465a"],
  dirtEdge: ["#1d2a38", "#11192a"],
  sky: ["#0a1a2c", "#1c3a58"],
};

const BEACH_DUNGEON_THEME: MapTheme = {
  grass: ["#3a7a8a", "#2c6272"],
  dirt: ["#1f4a58", "#143744"],
  grassEdge: ["#1e4c58", "#143942"],
  dirtEdge: ["#0a2630", "#061a22"],
  sky: ["#04121c", "#0a2a3a"],
};

const FOREST_NIGHT_THEME: MapTheme = {
  grass: ["#1f3a22", "#1a311c"],
  dirt: ["#3a2e1c", "#2e2415"],
  grassEdge: ["#0e1f10", "#091509"],
  dirtEdge: ["#241a0e", "#1a1208"],
  sky: ["#0a1424", "#1a2c3a"],
};

const FOREST_DUNGEON_THEME: MapTheme = {
  grass: ["#1a2a1a", "#142214"],
  dirt: ["#2a3a2a", "#1f2c1f"],
  grassEdge: ["#0a140a", "#060d06"],
  dirtEdge: ["#162216", "#0e160e"],
  sky: ["#050d0a", "#0e2218"],
};

export const MAPS: MapDef[] = [
  {
    id: "town",
    name: "Voxel Town",
    description: "Bustling starter village. Shops, friends, and quests.",
    minLevel: 1,
    image: townImg,
    theme: TOWN_THEME,
    seed: 1,
    treeDensity: 0.05,
    places: TOWN_PLACES,
    portals: PORTALS_LR,
  },
  {
    id: "forest",
    name: "Whispering Forest",
    description: "Dense night-shrouded woods. Wolves stalk the dark.",
    minLevel: 5,
    image: forestImg,
    theme: FOREST_NIGHT_THEME,
    seed: 7,
    treeDensity: 0.14,
    places: FOREST_PLACES,
    portals: PORTALS_LR,
    nightVision: true,
  },
  {
    id: "desert",
    name: "Golden Desert",
    description: "Endless dunes and ruins of forgotten kings.",
    minLevel: 10,
    image: desertImg,
    theme: DESERT_THEME,
    seed: 13,
    treeDensity: 0.02,
    places: DESERT_PLACES,
    portals: PORTALS_LR,
  },
  {
    id: "mountain",
    name: "Frostpeak Mountain",
    description: "Icy heights where dragons nest.",
    minLevel: 15,
    image: mountainImg,
    theme: MOUNTAIN_THEME,
    seed: 21,
    treeDensity: 0.07,
    places: MOUNTAIN_PLACES,
    portals: PORTALS_LR,
  },
  {
    id: "beach",
    name: "Sunlit Shores",
    description: "Tropical island full of treasure.",
    minLevel: 20,
    image: beachImg,
    theme: BEACH_THEME,
    seed: 33,
    treeDensity: 0.04,
    places: BEACH_PLACES,
    portals: PORTALS_LR,
  },
  {
    id: "dungeon",
    name: "Ember Dungeon",
    description: "The final trial. Only legends return.",
    minLevel: 30,
    image: dungeonImg,
    theme: DUNGEON_THEME,
    seed: 99,
    treeDensity: 0.01,
    places: [],
    portals: PORTALS_LR,
  },
  {
    id: "forest-dungeon",
    name: "Hollow Lair",
    description: "Pitch-black warren beneath the Whispering Forest. The Alpha Werewolf rules here.",
    minLevel: 5,
    image: forestImg,
    theme: FOREST_DUNGEON_THEME,
    seed: 71,
    treeDensity: 0.02,
    places: [],
    portals: PORTALS_LR,
    hidden: true,
    nightVision: true,
  },
  {
    id: "desert-dungeon",
    name: "Tomb of Anubis",
    description: "A sand-choked labyrinth deep beneath the pyramid. Pharaoh Anubis broods here.",
    minLevel: 10,
    image: desertImg,
    theme: DESERT_DUNGEON_THEME,
    seed: 131,
    treeDensity: 0.01,
    places: [],
    portals: PORTALS_LR,
    hidden: true,
  },
  {
    id: "mountain-dungeon",
    name: "Frozen Caverns",
    description: "A glacial labyrinth deep beneath the peaks. The Glacial Golem reigns here.",
    minLevel: 15,
    image: mountainImg,
    theme: MOUNTAIN_DUNGEON_THEME,
    seed: 181,
    treeDensity: 0.01,
    places: [],
    portals: PORTALS_LR,
    hidden: true,
  },
  {
    id: "beach-dungeon",
    name: "Drowned Grotto",
    description: "A sea-flooded cave system beneath the shore. The Abyssal Kraken slumbers here.",
    minLevel: 20,
    image: beachImg,
    theme: BEACH_DUNGEON_THEME,
    seed: 233,
    treeDensity: 0.01,
    places: [],
    portals: PORTALS_LR,
    hidden: true,
  },
];

export const getMap = (id: string): MapDef => MAPS.find((m) => m.id === id) ?? MAPS[0];