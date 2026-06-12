import warriorImg from "@/assets/character.png";
import warrior2Img from "@/assets/character-warrior.png";
import knightImg from "@/assets/character-knight.png";
import mageImg from "@/assets/character-mage.png";
import ninjaImg from "@/assets/character-ninja.png";
import archerImg from "@/assets/character-archer.png";
import assassinImg from "@/assets/character-assassin.png";
import paladinImg from "@/assets/character-paladin.png";
import samuraiImg from "@/assets/character-samurai.png";
import monkImg from "@/assets/character-monk.png";
import necromancerImg from "@/assets/character-necromancer.png";

export type CharacterSpriteId =
  | "warrior"
  | "warrior2"
  | "knight"
  | "mage"
  | "ninja"
  | "archer"
  | "assassin"
  | "paladin"
  | "samurai"
  | "monk"
  | "necromancer";

export type CharacterSpriteDef = {
  id: CharacterSpriteId;
  name: string;
  src: string;
};

export const CHARACTER_SPRITES: CharacterSpriteDef[] = [
  { id: "warrior", name: "Hero", src: warriorImg },
  { id: "warrior2", name: "Warrior", src: warrior2Img },
  { id: "knight", name: "Knight", src: knightImg },
  { id: "paladin", name: "Paladin", src: paladinImg },
  { id: "mage", name: "Mage", src: mageImg },
  { id: "necromancer", name: "Necromancer", src: necromancerImg },
  { id: "archer", name: "Archer", src: archerImg },
  { id: "ninja", name: "Ninja", src: ninjaImg },
  { id: "assassin", name: "Assassin", src: assassinImg },
  { id: "samurai", name: "Samurai", src: samuraiImg },
  { id: "monk", name: "Monk", src: monkImg },
];

export const CHARACTER_SPRITE_IDS = CHARACTER_SPRITES.map((c) => c.id) as [
  CharacterSpriteId,
  ...CharacterSpriteId[],
];

export const DEFAULT_CHARACTER_SPRITE: CharacterSpriteId = "warrior";

export function isCharacterSpriteId(v: unknown): v is CharacterSpriteId {
  return typeof v === "string" && (CHARACTER_SPRITE_IDS as string[]).includes(v);
}

export function normalizeCharacterSprite(v: unknown): CharacterSpriteId {
  return isCharacterSpriteId(v) ? v : DEFAULT_CHARACTER_SPRITE;
}