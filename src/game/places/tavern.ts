import type { Place } from "../types";

export type BeerDef = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  cost: number;
  xp: number;
  /** Drunk effect duration in ms. */
  drunkMs: number;
  /** 1 = mild, 2 = medium, 3 = strong. */
  intensity: 1 | 2 | 3;
};

export const BEER_MENU: BeerDef[] = [
  { id: "light-lager",   name: "Light Lager",     emoji: "🍺", description: "Crisp and refreshing — a starter sip.",    cost: 10,   xp: 15,  drunkMs: 3000,  intensity: 1 },
  { id: "wheat-ale",     name: "Wheat Ale",       emoji: "🍻", description: "Cloudy and citrusy — a tavern classic.",   cost: 45,  xp: 50,  drunkMs: 5000,  intensity: 1 },
  { id: "amber-stout",   name: "Amber Stout",     emoji: "🥃", description: "Dark, roasty, and dangerously smooth.",    cost: 85,  xp: 120, drunkMs: 7000,  intensity: 2 },
  { id: "dwarven-mead",  name: "Dwarven Mead",    emoji: "🍯", description: "Honey-sweet brew of the mountain folk.",   cost: 120,  xp: 260, drunkMs: 10000, intensity: 2 },
  { id: "dragon-brew",   name: "Dragon's Brew",   emoji: "🐉", description: "Smoldering hot — only the brave dare.",    cost: 190, xp: 450, drunkMs: 14000, intensity: 3 },
];

export const tavern: Place = {
  id: "tavern",
  name: "Beer Cafe",
  job: "Bard",
  emoji: "🍻",
  x: 13,
  y: 6,
  sprite: "tavern",
  description: "A cozy beer cafe. Pick your poison.",
  action: "Order a Beer",
  // Real cost & reward are decided in the beer-selection modal.
  perform: () => {},
};