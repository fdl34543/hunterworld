// Server functions for the players table. All writes go through Supabase
// Auth + RLS — every server fn here uses `requireSupabaseAuth`, so queries
// run as the signed-in user and RLS scopes rows by `user_id = auth.uid()`.
// No service-role / supabaseAdmin import anywhere.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  computeEnergyRegen,
  levelFromXp,
  maxEnergyFor,
  STUDY_COOLDOWN_MS,
  STUDY_XP_REWARD,
} from "./xp";
import { CHARACTER_SPRITE_IDS, DEFAULT_CHARACTER_SPRITE } from "@/game/characters";

export const FOUNTAIN_COOLDOWN_MS = 5 * 60 * 1000;
export const FARM_COOLDOWN_MS = 5 * 60 * 1000;
export const BEER_COOLDOWN_MS = 5 * 60 * 1000;

/**
 * Wrap a raw Supabase / Postgres error so its `message` (which can leak table
 * names, constraint names, and other schema details) never reaches the
 * client. The raw error is logged server-side for debugging.
 */
function dbFail(error: unknown, clientMessage = "Server error"): never {
  // eslint-disable-next-line no-console
  console.error("[players.functions] db error:", error);
  throw new Error(clientMessage);
}

type DbPlayer = {
  id: string;
  user_id: string | null;
  wallet_address: string | null;
  name: string;
  job: string;
  color: string;
  avatar: string;
  custom_avatar_url: string | null;
  character_sprite: string;
  gold: number;
  xp: number;
  hp: number;
  energy: number;
  base_damage: number;
  base_defense: number;
  last_energy_at: string;
  last_study_at: string | null;
  last_fountain_at: string | null;
  last_farm_at: string | null;
  last_beer_at: string | null;
  max_hp: number;
  equipped_weapon: string | null;
  equipped_armor: string | null;
  last_boss_at: string | null;
  last_boss_at_by_map: Record<string, string> | null;
  last_realm_claim_at: string | null;
  created_at: string;
  updated_at: string;
};

type DbPlayerItem = {
  id: string;
  user_id: string | null;
  wallet_address: string | null;
  def_id: string;
  kind: "weapon" | "armor" | "head" | "arm" | "accessory" | "consumable" | "spell";
  rarity: string;
  attack: number;
  defense: number;
  effect: string | null;
  amount: number;
  slot_kind: "inventory" | "wear";
  slot_index: number;
  acquired_at: string;
};

function applyRegen(p: DbPlayer): { player: DbPlayer; changed: boolean } {
  const max = maxEnergyFor(levelFromXp(p.xp));
  const { energy, lastEnergyAt } = computeEnergyRegen(
    p.energy,
    max,
    new Date(p.last_energy_at).getTime(),
  );
  if (energy === p.energy && new Date(p.last_energy_at).getTime() === lastEnergyAt) {
    return { player: p, changed: false };
  }
  return {
    player: { ...p, energy, last_energy_at: new Date(lastEnergyAt).toISOString() },
    changed: true,
  };
}

function walletFromClaims(claims: any): string | null {
  const meta = claims?.user_metadata ?? claims?.["user_metadata"];
  return meta?.wallet_address ?? null;
}

/** Fetch the player for the signed-in user, or null if not yet created. */
export const getMyPlayer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DbPlayer | null> => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("players")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) dbFail(error);
    if (!row) return null;
    const { player, changed } = applyRegen(row as DbPlayer);
    if (changed) {
      await supabase
        .from("players")
        .update({ energy: player.energy, last_energy_at: player.last_energy_at })
        .eq("user_id", userId);
    }
    return player;
  });

const CreateInput = z.object({
  name: z.string().trim().min(1).max(16),
  job: z.string().min(1).max(20),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  avatar: z.string().min(1).max(8),
  character_sprite: z.enum(CHARACTER_SPRITE_IDS).optional(),
});

export const createMyPlayer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => CreateInput.parse(input))
  .handler(async ({ data, context }): Promise<DbPlayer> => {
    const { supabase, userId, claims } = context;
    const walletAddress = walletFromClaims(claims);
    const { data: row, error } = await supabase
      .from("players")
      .insert({
        user_id: userId,
        wallet_address: walletAddress,
        name: data.name,
        job: data.job,
        color: data.color,
        avatar: data.avatar,
        character_sprite: data.character_sprite ?? DEFAULT_CHARACTER_SPRITE,
      })
      .select("*")
      .single();
    if (error) dbFail(error);
    // Seed the six starter consumables into the inventory.
    const { CONSUMABLE_CATALOG } = await import("@/game/consumables");
    const starterRows = CONSUMABLE_CATALOG.map((c, idx) => ({
      user_id: userId,
      wallet_address: walletAddress,
      def_id: c.id,
      kind: "consumable",
      rarity: "common",
      attack: 0,
      defense: 0,
      effect: c.effect,
      amount: c.amount,
      slot_kind: "inventory",
      slot_index: idx,
    }));
    await supabase.from("player_items").insert(starterRows);
    return row as DbPlayer;
  });

const PatchInput = z.object({
  patch: z.object({
    name: z.string().trim().min(1).max(16).optional(),
    job: z.string().min(1).max(20).optional(),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    avatar: z.string().min(1).max(8).optional(),
    custom_avatar_url: z.string().max(400_000).nullable().optional(),
    character_sprite: z.enum(CHARACTER_SPRITE_IDS).optional(),
  }),
});

export const updateMyPlayer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => PatchInput.parse(input))
  .handler(async ({ data, context }): Promise<DbPlayer> => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("players")
      .update(data.patch)
      .eq("user_id", userId)
      .select("*")
      .single();
    if (error) dbFail(error);
    return row as DbPlayer;
  });

const SetHpInput = z.object({ hp: z.number().int().min(0).max(100_000) });
export const setMyHp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => SetHpInput.parse(input))
  .handler(async ({ data, context }): Promise<DbPlayer> => {
    const { supabase, userId } = context;
    const { data: cur, error: e0 } = await supabase
      .from("players")
      .select("max_hp")
      .eq("user_id", userId)
      .single();
    if (e0) dbFail(e0);
    const clamped = Math.max(0, Math.min(data.hp, cur.max_hp ?? 100));
    const { data: row, error } = await supabase
      .from("players")
      .update({ hp: clamped })
      .eq("user_id", userId)
      .select("*")
      .single();
    if (error) dbFail(error);
    return row as DbPlayer;
  });

const EnergyInput = z.object({ amount: z.number().int().min(1).max(5).default(1) });
export const consumeEnergy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => EnergyInput.parse(input))
  .handler(async ({ data, context }): Promise<DbPlayer> => {
    const { supabase, userId } = context;
    const { data: cur, error } = await supabase
      .from("players")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (error) dbFail(error);
    const { player } = applyRegen(cur as DbPlayer);
    if (player.energy < data.amount) {
      throw new Error(`Not enough energy (${player.energy})`);
    }
    const { data: row, error: e2 } = await supabase
      .from("players")
      .update({
        energy: player.energy - data.amount,
        last_energy_at: player.last_energy_at,
      })
      .eq("user_id", userId)
      .select("*")
      .single();
    if (e2) dbFail(e2);
    return row as DbPlayer;
  });

export const completeStudy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DbPlayer> => {
    const { supabase, userId } = context;
    const { data: cur, error } = await supabase
      .from("players")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (error) dbFail(error);
    const now = Date.now();
    const last = (cur as DbPlayer).last_study_at
      ? new Date((cur as DbPlayer).last_study_at!).getTime()
      : 0;
    if (last && now - last < STUDY_COOLDOWN_MS - 1000) {
      throw new Error("Study still on cooldown");
    }
    const { data: row, error: e2 } = await supabase
      .from("players")
      .update({
        xp: (cur as DbPlayer).xp + STUDY_XP_REWARD,
        last_study_at: new Date(now).toISOString(),
      })
      .eq("user_id", userId)
      .select("*")
      .single();
    if (e2) dbFail(e2);
    return row as DbPlayer;
  });

const PLACE_REWARDS: Record<string, { gold?: number; xp?: number }> = {
  market: { gold: 25 },
  bank: { gold: 10 },
  inn: { gold: 15 },
  oasis: { gold: 8 },
  "hunter-lodge": { gold: 15 },
  "desert-tent": { xp: 25 },
};

const TOOL_REWARDS: Record<string, { gold?: number; xp?: number }> = {
  axe: { gold: 3 },
  pick: { gold: 5 },
  rod: { gold: 2 },
  sword: { xp: 30 },
  bow: { gold: 4 },
  potion: { gold: 10 },
};

const lastAwardAt = new Map<string, number[]>();
function rateLimit(uid: string, limitPerMin = 120) {
  const now = Date.now();
  const arr = (lastAwardAt.get(uid) ?? []).filter((t) => now - t < 60_000);
  if (arr.length >= limitPerMin) throw new Error("Slow down");
  arr.push(now);
  lastAwardAt.set(uid, arr);
}

const ClaimRewardInput = z.object({
  event: z.string().min(3).max(64).regex(/^(place|monster):[a-z0-9_-]{1,40}$/i),
  scale: z.number().min(0.5).max(4).default(1),
});

export const claimReward = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => ClaimRewardInput.parse(input))
  .handler(async ({ data, context }): Promise<DbPlayer> => {
    const { supabase, userId } = context;
    rateLimit(userId);

    let goldDelta = 0;
    let xpDelta = 0;
    const [kind, id] = data.event.split(":");
    if (kind === "place") {
      const r = PLACE_REWARDS[id];
      if (!r) throw new Error("Unknown event");
      goldDelta = r.gold ?? 0;
      xpDelta = r.xp ?? 0;
    } else if (kind === "tool") {
      const r = TOOL_REWARDS[id];
      if (!r) throw new Error("Unknown event");
      goldDelta = r.gold ?? 0;
      xpDelta = r.xp ?? 0;
    } else if (kind === "monster") {
      const { MONSTER_DEFS } = await import("@/game/monsters");
      const def = MONSTER_DEFS[id];
      if (!def) throw new Error("Unknown event");
      goldDelta = Math.round(def.reward * data.scale);
      // Award XP scaled with monster strength (reward acts as power proxy).
      xpDelta = Math.max(1, Math.round(def.reward * 0.6 * data.scale));
    } else {
      throw new Error("Unknown event");
    }

    const { data: cur, error } = await supabase
      .from("players")
      .select("xp,gold")
      .eq("user_id", userId)
      .single();
    if (error) dbFail(error);
    const nextXp = Math.max(0, cur.xp + xpDelta);
    const nextGold = Math.max(0, cur.gold + goldDelta);
    const { data: row, error: e2 } = await supabase
      .from("players")
      .update({ xp: nextXp, gold: nextGold })
      .eq("user_id", userId)
      .select("*")
      .single();
    if (e2) dbFail(e2);
    return row as DbPlayer;
  });

export const useFountain = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ player: DbPlayer; reward: number }> => {
    const { supabase, userId } = context;
    const { data: cur, error } = await supabase
      .from("players")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (error) dbFail(error);
    const p = cur as DbPlayer;
    const now = Date.now();
    const last = p.last_fountain_at ? new Date(p.last_fountain_at).getTime() : 0;
    if (last && now - last < FOUNTAIN_COOLDOWN_MS - 1000) {
      throw new Error("Fountain still on cooldown");
    }
    const reward = Math.floor(Math.random() * 30) + 1;
    const { data: row, error: e2 } = await supabase
      .from("players")
      .update({ gold: p.gold + reward, last_fountain_at: new Date(now).toISOString() })
      .eq("user_id", userId)
      .select("*")
      .single();
    if (e2) dbFail(e2);
    return { player: row as DbPlayer, reward };
  });

export const useFarm = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ player: DbPlayer; reward: number }> => {
    const { supabase, userId } = context;
    const { data: cur, error } = await supabase
      .from("players")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (error) dbFail(error);
    const p = cur as DbPlayer;
    const now = Date.now();
    const last = p.last_farm_at ? new Date(p.last_farm_at).getTime() : 0;
    if (last && now - last < FARM_COOLDOWN_MS - 1000) {
      throw new Error("Farm still on cooldown");
    }
    const reward = 12;
    const { data: row, error: e2 } = await supabase
      .from("players")
      .update({ gold: p.gold + reward, last_farm_at: new Date(now).toISOString() })
      .eq("user_id", userId)
      .select("*")
      .single();
    if (e2) dbFail(e2);
    return { player: row as DbPlayer, reward };
  });

const BeerInput = z.object({ beerId: z.string().min(1) });
export const useBeer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => BeerInput.parse(input))
  .handler(async ({ data, context }): Promise<DbPlayer> => {
    const { supabase, userId } = context;
    const { data: cur, error } = await supabase
      .from("players")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (error) dbFail(error);
    const p = cur as DbPlayer;
    const now = Date.now();
    const last = p.last_beer_at ? new Date(p.last_beer_at).getTime() : 0;
    if (last && now - last < BEER_COOLDOWN_MS - 1000) {
      throw new Error("Beer still on cooldown");
    }
    const { BEER_MENU } = await import("@/game/places/tavern");
    const beer = BEER_MENU.find((b) => b.id === data.beerId);
    if (!beer) throw new Error("Unknown beer");
    if (p.gold < beer.cost) throw new Error(`Not enough gold (need ${beer.cost})`);
    const { data: row, error: e2 } = await supabase
      .from("players")
      .update({
        gold: p.gold - beer.cost,
        xp: p.xp + beer.xp,
        last_beer_at: new Date(now).toISOString(),
      })
      .eq("user_id", userId)
      .select("*")
      .single();
    if (e2) dbFail(e2);
    return row as DbPlayer;
  });

export type { DbPlayer };
export type { DbPlayerItem };

// ---------- Items, spells, boss ----------

import {
  ITEM_BY_ID,
  computeItemStats,
  pickRandomItem,
  WEAR_KIND_BY_INDEX,
  WEARABLE_KINDS,
  WEAR_INDEX_BY_KIND,
  type WearableKind,
} from "@/game/items";
import { SPELL_BY_ID, computeSpellStats, pickRandomSpell } from "@/game/spells";
import { RARITIES, RARITY_META, rollRarity, type Rarity } from "@/game/rarity";
import { CONSUMABLE_BY_ID } from "@/game/consumables";

void RARITY_META;

const RarityZ = z.enum(RARITIES as unknown as [Rarity, ...Rarity[]]);

const INVENTORY_SLOTS = 30;

async function firstFreeInventorySlot(db: any, userId: string): Promise<number> {
  const { data, error } = await db
    .from("player_items")
    .select("slot_index")
    .eq("user_id", userId)
    .eq("slot_kind", "inventory");
  if (error) dbFail(error);
  const used = new Set<number>((data ?? []).map((r: any) => r.slot_index));
  for (let i = 0; i < INVENTORY_SLOTS; i++) if (!used.has(i)) return i;
  throw new Error("Inventory full");
}

export const getMyInventory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DbPlayerItem[]> => {
    const { supabase, userId } = context;
    const { data: rows, error } = await supabase
      .from("player_items")
      .select("*")
      .eq("user_id", userId)
      .order("slot_kind", { ascending: true })
      .order("slot_index", { ascending: true });
    if (error) dbFail(error);
    return (rows ?? []) as DbPlayerItem[];
  });

const BuyItemInput = z.object({
  defId: z.string().min(1),
  rarity: RarityZ,
});

export const buyItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => BuyItemInput.parse(input))
  .handler(async ({ data, context }): Promise<{ player: DbPlayer; item: DbPlayerItem }> => {
    const { supabase, userId, claims } = context;
    const walletAddress = walletFromClaims(claims);
    const def = ITEM_BY_ID[data.defId];
    if (!def) throw new Error("Unknown item");
    const stats = computeItemStats(def, data.rarity);
    const { data: cur, error: e1 } = await supabase
      .from("players")
      .select("gold")
      .eq("user_id", userId)
      .single();
    if (e1) dbFail(e1);
    if (cur.gold < stats.price) throw new Error(`Not enough gold (need ${stats.price})`);
    const freeSlot = await firstFreeInventorySlot(supabase, userId);
    const { data: item, error: e2 } = await supabase
      .from("player_items")
      .insert({
        user_id: userId,
        wallet_address: walletAddress,
        def_id: def.id,
        kind: def.kind,
        rarity: data.rarity,
        attack: stats.attack,
        defense: stats.defense,
        effect: def.effect ?? null,
        amount: stats.effectAmount,
        slot_kind: "inventory",
        slot_index: freeSlot,
      })
      .select("*")
      .single();
    if (e2) dbFail(e2);
    const { data: player, error: e3 } = await supabase
      .from("players")
      .update({ gold: cur.gold - stats.price })
      .eq("user_id", userId)
      .select("*")
      .single();
    if (e3) dbFail(e3);
    return { player: player as DbPlayer, item: item as DbPlayerItem };
  });

const PlaceInput = z.object({
  itemId: z.string().uuid(),
  slotKind: z.enum(["inventory", "wear"]),
  slotIndex: z.number().int().min(0).max(29),
});

export const placeItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => PlaceInput.parse(input))
  .handler(async ({ data, context }): Promise<{ items: DbPlayerItem[] }> => {
    const { supabase, userId } = context;
    const { data: src, error: e1 } = await supabase
      .from("player_items")
      .select("*")
      .eq("id", data.itemId)
      .single();
    if (e1) dbFail(e1);
    if (src.user_id !== userId) throw new Error("Not your item");
    if (data.slotKind === "wear") {
      const required = WEAR_KIND_BY_INDEX[data.slotIndex];
      if (!required) throw new Error("Bad wear slot");
      if (src.kind !== required) throw new Error(`Slot needs a ${required}`);
    }
    const { data: destRows, error: e2 } = await supabase
      .from("player_items")
      .select("*")
      .eq("user_id", userId)
      .eq("slot_kind", data.slotKind)
      .eq("slot_index", data.slotIndex);
    if (e2) dbFail(e2);
    const dest = (destRows ?? [])[0];

    if (dest && dest.id !== src.id) {
      let backKind = src.slot_kind;
      let backIndex = src.slot_index;
      if (backKind === "wear") {
        const need = WEAR_KIND_BY_INDEX[backIndex];
        if (!need || dest.kind !== need) {
          backKind = "inventory";
          backIndex = await firstFreeInventorySlot(supabase, userId);
        }
      }
      const { error: eA } = await supabase
        .from("player_items")
        .update({ slot_kind: backKind, slot_index: backIndex })
        .eq("id", dest.id);
      if (eA) dbFail(eA);
    }
    const { error: eB } = await supabase
      .from("player_items")
      .update({ slot_kind: data.slotKind, slot_index: data.slotIndex })
      .eq("id", src.id);
    if (eB) dbFail(eB);

    const { data: wearRows } = await supabase
      .from("player_items")
      .select("id,kind,slot_index")
      .eq("user_id", userId)
      .eq("slot_kind", "wear");
    const weapon = (wearRows ?? []).find((r: any) => r.slot_index === 0)?.id ?? null;
    const armor = (wearRows ?? []).find((r: any) => r.slot_index === 1)?.id ?? null;
    await supabase
      .from("players")
      .update({ equipped_weapon: weapon, equipped_armor: armor })
      .eq("user_id", userId);

    const { data: items, error: e3 } = await supabase
      .from("player_items")
      .select("*")
      .eq("user_id", userId);
    if (e3) dbFail(e3);
    return { items: (items ?? []) as DbPlayerItem[] };
  });

const ItemIdInput = z.object({ itemId: z.string().uuid() });

export const discardItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => ItemIdInput.parse(input))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("player_items")
      .delete()
      .eq("id", data.itemId)
      .eq("user_id", userId);
    if (error) dbFail(error);
    return { ok: true };
  });

export const useItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => ItemIdInput.parse(input))
  .handler(async ({ data, context }): Promise<{ player: DbPlayer }> => {
    const { supabase, userId } = context;
    const { data: it, error: e1 } = await supabase
      .from("player_items")
      .select("*")
      .eq("id", data.itemId)
      .maybeSingle();
    if (e1) dbFail(e1);
    if (!it) throw new Error("Item not found (already used?)");
    if (it.user_id !== userId) throw new Error("Not your item");

    if (WEARABLE_KINDS.has(it.kind)) {
      const targetIdx = WEAR_INDEX_BY_KIND[it.kind as WearableKind];
      const { data: destRows } = await supabase
        .from("player_items")
        .select("*")
        .eq("user_id", userId)
        .eq("slot_kind", "wear")
        .eq("slot_index", targetIdx);
      const dest = (destRows ?? [])[0];
      if (dest && dest.id !== it.id) {
        const backIdx =
          it.slot_kind === "inventory" ? it.slot_index : await firstFreeInventorySlot(supabase, userId);
        await supabase
          .from("player_items")
          .update({ slot_kind: "inventory", slot_index: backIdx })
          .eq("id", dest.id);
      }
      await supabase
        .from("player_items")
        .update({ slot_kind: "wear", slot_index: targetIdx })
        .eq("id", it.id);
      const { data: wearRows } = await supabase
        .from("player_items")
        .select("id,slot_index")
        .eq("user_id", userId)
        .eq("slot_kind", "wear");
      const weapon = (wearRows ?? []).find((r: any) => r.slot_index === 0)?.id ?? null;
      const armor = (wearRows ?? []).find((r: any) => r.slot_index === 1)?.id ?? null;
      const { data: player } = await supabase
        .from("players")
        .update({ equipped_weapon: weapon, equipped_armor: armor })
        .eq("user_id", userId)
        .select("*")
        .single();
      return { player: player as DbPlayer };
    }

    const { data: cur, error: e2 } = await supabase
      .from("players")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (e2) dbFail(e2);
    const p = cur as DbPlayer;
    const patch: Record<string, any> = {};
    const amt = it.amount ?? 0;
    switch (it.effect) {
      case "gold": patch.gold = p.gold + amt; break;
      case "xp":   patch.xp = p.xp + amt; break;
      case "max_hp": patch.max_hp = p.max_hp + amt; break;
      case "damage": patch.base_damage = p.base_damage + amt; break;
      case "defense": patch.base_defense = p.base_defense + amt; break;
      case "energy": {
        const lvl = levelFromXp(p.xp);
        const max = maxEnergyFor(lvl);
        patch.energy = Math.min(max, p.energy + amt);
        break;
      }
      default: throw new Error("Item has no effect");
    }
    await supabase.from("player_items").delete().eq("id", it.id);
    const { data: player, error: e3 } = await supabase
      .from("players")
      .update(patch as never)
      .eq("user_id", userId)
      .select("*")
      .single();
    if (e3) dbFail(e3);
    return { player: player as DbPlayer };
  });

const BuySpellInput = z.object({
  defId: z.string().min(1),
  rarity: RarityZ,
});

export const buySpell = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => BuySpellInput.parse(input))
  .handler(async ({ data, context }): Promise<{ player: DbPlayer; item: DbPlayerItem }> => {
    const { supabase, userId, claims } = context;
    const walletAddress = walletFromClaims(claims);
    const def = SPELL_BY_ID[data.defId];
    if (!def) throw new Error("Unknown spell");
    const stats = computeSpellStats(def, data.rarity);
    const { data: cur, error: e1 } = await supabase
      .from("players")
      .select("gold")
      .eq("user_id", userId)
      .single();
    if (e1) dbFail(e1);
    if (cur.gold < stats.price) throw new Error(`Not enough gold (need ${stats.price})`);
    const slot = await firstFreeInventorySlot(supabase, userId);
    const { data: item, error: e2 } = await supabase
      .from("player_items")
      .insert({
        user_id: userId,
        wallet_address: walletAddress,
        def_id: def.id,
        kind: "spell",
        rarity: data.rarity,
        attack: 0,
        defense: 0,
        effect: def.effect,
        amount: stats.amount,
        slot_kind: "inventory",
        slot_index: slot,
      })
      .select("*")
      .single();
    if (e2) dbFail(e2);
    const { data: player, error: e3 } = await supabase
      .from("players")
      .update({ gold: cur.gold - stats.price })
      .eq("user_id", userId)
      .select("*")
      .single();
    if (e3) dbFail(e3);
    return { player: player as DbPlayer, item: item as DbPlayerItem };
  });

function itemSellValue(it: DbPlayerItem): number {
  if (it.kind === "spell") {
    const def = SPELL_BY_ID[it.def_id];
    if (def) return Math.max(1, Math.floor(computeSpellStats(def, it.rarity as Rarity).price * 0.5));
    return 5;
  }
  if (it.kind === "consumable") {
    const def = CONSUMABLE_BY_ID[it.def_id];
    if (def?.effect === "gold") return Math.max(1, def.amount);
    return 3;
  }
  const def = ITEM_BY_ID[it.def_id];
  if (def) return Math.max(1, Math.floor(computeItemStats(def, it.rarity as Rarity).price * 0.5));
  return 1;
}

export const sellItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => ItemIdInput.parse(input))
  .handler(async ({ data, context }): Promise<{ player: DbPlayer; gold: number }> => {
    const { supabase, userId } = context;
    const { data: it, error: e1 } = await supabase
      .from("player_items")
      .select("*")
      .eq("id", data.itemId)
      .single();
    if (e1) dbFail(e1);
    if (it.user_id !== userId) throw new Error("Not your item");
    const gain = itemSellValue(it as DbPlayerItem);
    await supabase.from("player_items").delete().eq("id", it.id);
    const { data: cur } = await supabase
      .from("players")
      .select("gold")
      .eq("user_id", userId)
      .single();
    const { data: player, error: e2 } = await supabase
      .from("players")
      .update({ gold: (cur?.gold ?? 0) + gain })
      .eq("user_id", userId)
      .select("*")
      .single();
    if (e2) dbFail(e2);
    return { player: player as DbPlayer, gold: gain };
  });

export { itemSellValue };

export type BossDrop = {
  items: DbPlayerItem[];
  spellItems: DbPlayerItem[];
  spells: { defId: string; name: string; emoji: string; effect: string; amount: number; rarity: Rarity }[];
  gold: number;
  xp: number;
};

const VALID_BOSS_MAP_IDS = [
  "dungeon",
  "forest-dungeon",
  "desert-dungeon",
  "mountain-dungeon",
  "beach-dungeon",
  "world-spring",
  "world-summer",
  "world-autumn",
  "world-winter",
] as const;

const BossInput = z.object({
  mapId: z.enum(VALID_BOSS_MAP_IDS).default("dungeon"),
});

export const defeatBoss = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => BossInput.parse(input))
  .handler(
    async ({ data, context }): Promise<{ player: DbPlayer; drop: BossDrop }> => {
      const { supabase, userId, claims } = context;
      const walletAddress = walletFromClaims(claims);
      const BOSS_COOLDOWN_MS = 60 * 60 * 1000;
      const mapId = data.mapId;
      const { data: cur, error } = await supabase
        .from("players")
        .select("*")
        .eq("user_id", userId)
        .single();
      if (error) dbFail(error);
      const player = cur as DbPlayer;
      const now = Date.now();
      const byMap = (player.last_boss_at_by_map ?? {}) as Record<string, string>;
      const lastIso = byMap[mapId] ?? null;
      const last = lastIso ? new Date(lastIso).getTime() : 0;
      if (last && now - last < BOSS_COOLDOWN_MS - 2000) {
        throw new Error("Boss already defeated today");
      }
      const level = levelFromXp(player.xp);

      const MAP_LEVEL_BONUS: Record<string, number> = {
        "forest-dungeon": 4,
        "desert-dungeon": 10,
        "mountain-dungeon": 16,
        "beach-dungeon": 22,
        dungeon: 18,
        "world-spring": 12,
        "world-summer": 14,
        "world-autumn": 16,
        "world-winter": 20,
      };
      const bonus = MAP_LEVEL_BONUS[mapId] ?? 0;
      const dropLevel = level + bonus;

      // Drop COUNT scales with map difficulty, but rarity & stats use the
      // player's actual level so loot stays appropriate (not overpowered).
      const itemCount = Math.min(4, 1 + Math.floor(dropLevel / 6));
      const spellCount = Math.min(2, 1 + Math.floor(dropLevel / 10));

      const items: DbPlayerItem[] = [];
      const levelScale = 1 + Math.min(2, level * 0.05);
      for (let i = 0; i < itemCount; i++) {
        const itemDef = pickRandomItem();
        const itemRarity = rollRarity(level);
        const stats = computeItemStats(itemDef, itemRarity);
        const scaledAttack = Math.round(stats.attack * levelScale);
        const scaledDefense = Math.round(stats.defense * levelScale);
        let slot: number;
        try {
          slot = await firstFreeInventorySlot(supabase, userId);
        } catch {
          break;
        }
        const { data: row, error: ie } = await supabase
          .from("player_items")
          .insert({
            user_id: userId,
            wallet_address: walletAddress,
            def_id: itemDef.id,
            kind: itemDef.kind,
            rarity: itemRarity,
            attack: scaledAttack,
            defense: scaledDefense,
            slot_kind: "inventory",
            slot_index: slot,
          })
          .select("*")
          .single();
        if (ie) dbFail(ie);
        items.push(row as DbPlayerItem);
      }

      const spellItems: DbPlayerItem[] = [];
      const spells: BossDrop["spells"] = [];
      for (let i = 0; i < spellCount; i++) {
        const spellDef = pickRandomSpell();
        const spellRarity = rollRarity(level);
        const spellStats = computeSpellStats(spellDef, spellRarity);
        const scaledAmount = Math.max(1, Math.round(spellStats.amount * levelScale));
        let slot: number;
        try {
          slot = await firstFreeInventorySlot(supabase, userId);
        } catch {
          break;
        }
        const { data: row, error: se } = await supabase
          .from("player_items")
          .insert({
            user_id: userId,
            wallet_address: walletAddress,
            def_id: spellDef.id,
            kind: "spell",
            rarity: spellRarity,
            attack: 0,
            defense: 0,
            effect: spellDef.effect,
            amount: scaledAmount,
            slot_kind: "inventory",
            slot_index: slot,
          })
          .select("*")
          .single();
        if (se) dbFail(se);
        spellItems.push(row as DbPlayerItem);
        spells.push({
          defId: spellDef.id,
          name: spellDef.name,
          emoji: spellDef.emoji,
          effect: spellDef.effect,
          amount: scaledAmount,
          rarity: spellRarity,
        });
      }

      // Gold & XP scale with the player's actual level, with a small map-difficulty
      // multiplier so harder dungeons still pay a bit more — but never massively
      // more than what the player's level warrants.
      const mapMult = 1 + Math.min(0.5, bonus * 0.02);
      const goldReward = Math.round((50 + level * 25 + level * level * 3) * mapMult);
      const xpReward = Math.round((40 + level * 15) * mapMult);
      const nextByMap = { ...byMap, [mapId]: new Date(now).toISOString() };
      const patch: Record<string, any> = {
        gold: player.gold + goldReward,
        xp: player.xp + xpReward,
        last_boss_at: new Date(now).toISOString(),
        last_boss_at_by_map: nextByMap,
      };
      const { data: updated, error: e3 } = await supabase
        .from("players")
        .update(patch as never)
        .eq("user_id", userId)
        .select("*")
        .single();
      if (e3) dbFail(e3);
      return {
        player: updated as DbPlayer,
        drop: {
          items,
          spellItems,
          spells,
          gold: goldReward,
          xp: xpReward,
        },
      };
    },
  );

// ---------- Leaderboard (public, no auth) ----------

export type LeaderboardEntry = {
  wallet_address: string;
  name: string;
  job: string;
  avatar: string;
  color: string;
  xp: number;
  gold: number;
};

const LeaderboardInput = z.object({
  offset: z.number().int().min(0).default(0),
  limit: z.number().int().min(1).max(50).default(20),
});

export const getLeaderboard = createServerFn({ method: "POST" })
  .inputValidator((input) => LeaderboardInput.parse(input))
  .handler(async ({ data }): Promise<{ entries: LeaderboardEntry[]; total: number }> => {
    // Use anon Supabase client + SECURITY DEFINER RPCs — no service role needed.
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) throw new Error("Missing Supabase env vars");
    const sb = createClient(url, key);
    const [{ data: rows, error }, { data: total, error: countErr }] = await Promise.all([
      sb.rpc("leaderboard_top", { p_offset: data.offset, p_limit: data.limit }),
      sb.rpc("leaderboard_count"),
    ]);
    if (error) dbFail(error);
    if (countErr) dbFail(countErr);
    return {
      entries: (rows ?? []) as LeaderboardEntry[],
      total: Number(total ?? 0),
    };
  });
