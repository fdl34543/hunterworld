export type RemotePlayer = {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  level?: number;
  lastMoveAt?: number;
  character_sprite?: string;
};

export type ChatMessage = {
  id: string;
  name: string;
  color: string;
  text: string;
  ts: number;
};

export type Profile = {
  name: string;
  job: string;
  color: string;
  avatar: string;
  character_sprite: string;
};

export type PlaceActionCtx = {
  /** Claim a server-validated reward for an allowlisted event id, e.g. `place:market`. */
  award: (event: string) => void;
  toast: (m: string) => void;
  /** Open the study modal (only used by the library place). */
  openStudy?: () => void;
  /** Try to spend energy. Returns true on success. */
  spendEnergy?: () => Promise<boolean>;
};

export type Place = {
  id: string;
  name: string;
  job: string;
  emoji: string;
  x: number;
  y: number;
  sprite: string;
  description: string;
  action: string;
  perform: (ctx: PlaceActionCtx) => void;
  /** If set, interacting with this place teleports the player to another map. */
  transitionTo?: string;
  /** Optional gold cost required before perform() runs. */
  cost?: number;
};

export type Portal = {
  id: string;
  name: string;
  x: number;
  y: number;
};

export type MonsterDef = {
  id: string;
  name: string;
  emoji: string;
  sprite: string;
  hp: number;
  damage: number;
  reward: number;
  speed: number;
  aggroRange: number;
  attackRange: number;
  attackCooldown: number;
};

export type MonsterSpawn = { defId: string; x: number; y: number };

export type MonsterInstance = {
  id: string;
  defId: string;
  x: number;
  y: number;
  hp: number;
  lastAttack: number;
  hitFlash: number;
  maxHp?: number;
  scale?: number;
  isBoss?: boolean;
};

export type InventoryItemCtx = {
  award: (event: string) => void;
  toast: (m: string) => void;
};

export type InventoryItem = {
  id: string;
  name: string;
  emoji: string;
  effect: string;
  description: string;
  use: (ctx: InventoryItemCtx) => void;
};