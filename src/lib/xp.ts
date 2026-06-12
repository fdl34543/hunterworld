// XP / level / energy / cooldown math — shared client+server.

export const STUDY_DURATION_MS = 60_000;
export const STUDY_COOLDOWN_MS = 5 * 60_000;
export const STUDY_XP_REWARD = 50;
export const BEER_COOLDOWN_MS = 5 * 60_000;

export const ENERGY_REGEN_MS = 10 * 60_000;
export const BASE_MAX_HP = 100;
export const BASE_MAX_ENERGY = 5;
export const BASE_DAMAGE = 5;
export const BASE_DEFENSE = 2;

/** level = floor(sqrt(xp / 50)). XP 50 = Lv1, 200 = Lv2, 450 = Lv3, 800 = Lv4. */
export function levelFromXp(xp: number): number {
  if (xp < 50) return 0;
  return Math.floor(Math.sqrt(xp / 50));
}

export function xpForLevel(level: number): number {
  return level * level * 50;
}

export function xpProgress(xp: number) {
  const lvl = levelFromXp(xp);
  const curBase = xpForLevel(lvl);
  const nextBase = xpForLevel(lvl + 1);
  const into = xp - curBase;
  const span = nextBase - curBase;
  return { level: lvl, into, span, pct: span > 0 ? Math.min(100, (into / span) * 100) : 0, next: nextBase };
}

export function maxHpFor(level: number) {
  return BASE_MAX_HP + level * 10;
}
export function maxEnergyFor(level: number) {
  return BASE_MAX_ENERGY + level;
}
export function damageFor(level: number, base = BASE_DAMAGE) {
  return base + level;
}
export function defenseFor(level: number, base = BASE_DEFENSE) {
  return base + level;
}

/** Compute regenerated energy given last_energy_at + current energy + max. */
export function computeEnergyRegen(
  current: number,
  max: number,
  lastEnergyAt: number,
  now: number = Date.now(),
) {
  if (current >= max) return { energy: max, lastEnergyAt: now };
  const delta = Math.max(0, now - lastEnergyAt);
  const ticks = Math.floor(delta / ENERGY_REGEN_MS);
  if (ticks <= 0) return { energy: current, lastEnergyAt };
  const next = Math.min(max, current + ticks);
  return { energy: next, lastEnergyAt: lastEnergyAt + ticks * ENERGY_REGEN_MS };
}

export function studyCooldownRemaining(lastStudyAt: number | null, now = Date.now()) {
  if (!lastStudyAt) return 0;
  return Math.max(0, lastStudyAt + STUDY_COOLDOWN_MS - now);
}

export function beerCooldownRemaining(lastBeerAt: number | null, now = Date.now()) {
  if (!lastBeerAt) return 0;
  return Math.max(0, lastBeerAt + BEER_COOLDOWN_MS - now);
}

export function formatDuration(ms: number) {
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}m ${r}s` : `${r}s`;
}