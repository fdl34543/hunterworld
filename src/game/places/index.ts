import type { Place } from "../types";
import { blacksmith } from "./blacksmith";
import { market } from "./market";
import { tavern } from "./tavern";
import { bank } from "./bank";
import { fountain } from "./fountain";
import { library } from "./library";
import { inn } from "./inn";
import { church } from "./church";
import { farm } from "./farm";
import { wizardTower } from "./wizard_tower";
import { dungeonEntrance } from "./dungeon_entrance";
import { realmExchange } from "./realm_exchange";
import { pvpArena } from "./pvp_arena";
import { hunterLodge } from "./hunter_lodge";
import { druidGrove } from "./druid_grove";
import { forestDungeonEntrance } from "./forest_dungeon_entrance";
import { desertPyramid } from "./desert_pyramid";
import { oasis } from "./oasis";
import { desertTent } from "./desert_tent";
import { rangerOutpost } from "./ranger_outpost";
import { mountainDungeonEntrance } from "./mountain_dungeon_entrance";
import { beachHut } from "./beach_hut";
import { beachDungeonEntrance } from "./beach_dungeon_entrance";

export const TOWN_PLACES: Place[] = [
  blacksmith,
  market,
  tavern,
  bank,
  fountain,
  library,
  inn,
  church,
  farm,
  wizardTower,
  dungeonEntrance,
  realmExchange,
  pvpArena,
];

export const FOREST_PLACES: Place[] = [
  hunterLodge,
  druidGrove,
  forestDungeonEntrance,
];

export const DESERT_PLACES: Place[] = [
  oasis,
  desertTent,
  desertPyramid,
];

export const MOUNTAIN_PLACES: Place[] = [
  rangerOutpost,
  mountainDungeonEntrance,
];

export const BEACH_PLACES: Place[] = [
  beachHut,
  beachDungeonEntrance,
];

export const PLACES: Place[] = TOWN_PLACES;