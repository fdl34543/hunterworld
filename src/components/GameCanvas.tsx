import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

import treeImg from "@/assets/tree.png";
import forestTreeImg from "@/assets/forest-tree.png";
import houseImg from "@/assets/house.png";
import bankImg from "@/assets/bank.png";
import libraryImg from "@/assets/library.png";
import innImg from "@/assets/inn.png";
import blacksmithImg from "@/assets/blacksmith.png";
import characterImg from "@/assets/character.png";
import { CHARACTER_SPRITES, normalizeCharacterSprite, type CharacterSpriteId } from "@/game/characters";
import fountainImg from "@/assets/fountain.png";
import portalImg from "@/assets/portal.png";
import churchImg from "@/assets/church.png";
import farmImg from "@/assets/farm.png";
import wizardTowerImg from "@/assets/wizard-tower.png";
import dungeonEntranceImg from "@/assets/dungeon-entrance.png";
import realmExchangeImg from "@/assets/realm-exchange.png";
import pvpArenaImg from "@/assets/pvp-arena.png";
import monsterSlimeImg from "@/assets/monster-slime.png";
import monsterSkeletonImg from "@/assets/monster-skeleton.png";
import monsterBatImg from "@/assets/monster-bat.png";
import monsterWolfImg from "@/assets/monster-wolf.png";
import monsterSpiderImg from "@/assets/monster-spider.png";
import monsterTreantImg from "@/assets/monster-treant.png";
import monsterWerewolfImg from "@/assets/monster-werewolf.png";
import hunterLodgeImg from "@/assets/hunter-lodge.png";
import druidGroveImg from "@/assets/druid-grove.png";
import forestDungeonEntranceImg from "@/assets/forest-dungeon-entrance.png";
import marketStallImg from "@/assets/market-stall.png";
import tavernImg from "@/assets/tavern.png";
import cactusImg from "@/assets/cactus.png";
import pyramidImg from "@/assets/pyramid.png";
import oasisImg from "@/assets/oasis.png";
import desertTentImg from "@/assets/desert-tent.png";
import monsterScorpionImg from "@/assets/monster-scorpion.png";
import monsterMummyImg from "@/assets/monster-mummy.png";
import monsterSandwormImg from "@/assets/monster-sandworm.png";
import monsterPharaohImg from "@/assets/monster-pharaoh.png";
import monsterWorldTreeImg from "@/assets/monster-world-tree.png";
import monsterLeviathanImg from "@/assets/monster-leviathan.png";
import monsterHarvestTitanImg from "@/assets/monster-harvest-titan.png";
import monsterFrostDragonImg from "@/assets/monster-frost-dragon.png";
import pineTreeImg from "@/assets/pine-tree.png";
import palmTreeImg from "@/assets/palm-tree.png";
import monsterYetiImg from "@/assets/monster-yeti.png";
import monsterIceWolfImg from "@/assets/monster-ice-wolf.png";
import monsterFrostImpImg from "@/assets/monster-frost-imp.png";
import monsterIceGolemImg from "@/assets/monster-ice-golem.png";
import monsterCrabImg from "@/assets/monster-crab.png";
import monsterPirateImg from "@/assets/monster-pirate.png";
import monsterMerfolkImg from "@/assets/monster-merfolk.png";
import monsterKrakenImg from "@/assets/monster-kraken.png";
import rangerOutpostImg from "@/assets/ranger-outpost.png";
import mountainDungeonEntranceImg from "@/assets/mountain-dungeon-entrance.png";
import beachHutImg from "@/assets/beach-hut.png";
import beachDungeonEntranceImg from "@/assets/beach-dungeon-entrance.png";

import { AVATARS, INVENTORY_SIZE, MAP_SIZE, SPEED, TILE_H, TILE_W } from "@/game/constants";
import { buildMap, colorFromId, isoProject, pickJob } from "@/game/utils";
import { MAPS, getMap, type MapDef } from "@/game/maps";
import { getMusicEngine } from "@/game/music";
import type {
  ChatMessage,
  MonsterInstance,
  Place,
  Portal,
  Profile,
  RemotePlayer,
} from "@/game/types";
import {
  BOSS_SPAWN,
  FOREST_BOSS_SPAWN,
  DESERT_BOSS_SPAWN,
  MOUNTAIN_BOSS_SPAWN,
  BEACH_BOSS_SPAWN,
  MONSTER_DEFS,
  dungeonSpawnsForLevel,
  forestSpawnsForLevel,
  forestDungeonSpawnsForLevel,
  desertSpawnsForLevel,
  desertDungeonSpawnsForLevel,
  mountainSpawnsForLevel,
  mountainDungeonSpawnsForLevel,
  beachSpawnsForLevel,
  beachDungeonSpawnsForLevel,
  monsterScale,
} from "@/game/monsters";
import {
  WORLD_BOSS_SPAWN,
  getCurrentSeason,
  worldBossMapId,
  type SeasonId,
} from "@/game/seasons";

import { EditProfileModal } from "@/components/game/EditProfileModal";
import { PlayerProfileCard } from "@/components/game/PlayerProfileCard";
import { ChatPanel } from "@/components/game/ChatPanel";
import { ZoomControls } from "@/components/game/ZoomControls";
import { SeasonBadge } from "@/components/game/SeasonBadge";
import { PlaceModal } from "@/components/game/PlaceModal";
import { RealmExchangeModal } from "@/components/game/RealmExchangeModal";
import { BlacksmithModal } from "@/components/game/BlacksmithModal";
import { WizardTowerModal } from "@/components/game/WizardTowerModal";
import { TavernModal } from "@/components/game/TavernModal";
import { MarketModal } from "@/components/game/MarketModal";
import { BossDropModal } from "@/components/game/BossDropModal";
import { LeaderboardModal } from "@/components/game/LeaderboardModal";
import { InventoryHotbar } from "@/components/game/InventoryHotbar";
import { InventoryModal } from "@/components/game/InventoryModal";
import { PortalModal } from "@/components/game/PortalModal";
import { StudyModal } from "@/components/game/StudyModal";
import { usePlayer } from "@/hooks/usePlayer";
import type { BossDrop, DbPlayer } from "@/lib/players.functions";
import { WEAR_KIND_BY_INDEX } from "@/game/items";
import {
  damageFor,
  defenseFor,
  levelFromXp,
  maxEnergyFor,
  maxHpFor,
  studyCooldownRemaining,
  beerCooldownRemaining,
  formatDuration,
} from "@/lib/xp";

export function GameCanvas({
  player,
  spectator = false,
  onExitSpectator,
}: {
  player: DbPlayer;
  spectator?: boolean;
  onExitSpectator?: () => void;
}) {
  const isSpectator = spectator;
  const playerName = player.name;
  const {
    update,
    syncHp,
    spendEnergy,
    study,
    reward,
    inventory,
    buyItem,
    placeItem,
    discardItem,
    useItem,
    buySpell,
    sellItem,
    defeatBoss,
    fountain,
    farm,
    beer,
  } = usePlayer();
  const level = levelFromXp(player.xp);
  const gold = player.gold;
  const energy = player.energy;
  const maxEnergy = maxEnergyFor(level);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playerCount, setPlayerCount] = useState(1);
  const [ready, setReady] = useState(false);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [chatFocused, setChatFocused] = useState(false);
  const [nearby, setNearby] = useState<Place | null>(null);
  const [openPlace, setOpenPlace] = useState<Place | null>(null);
  const [nearbyPortal, setNearbyPortal] = useState<Portal | null>(null);
  const [portalOpen, setPortalOpen] = useState(false);
  const [studyOpen, setStudyOpen] = useState(false);
  const [realmOpen, setRealmOpen] = useState(false);
  const [blacksmithOpen, setBlacksmithOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);
  const [tavernOpen, setTavernOpen] = useState(false);
  const [drunk, setDrunk] = useState<{ key: number; durationMs: number; intensity: 1 | 2 | 3 } | null>(null);
  const [bossDrop, setBossDrop] = useState<BossDrop | null>(null);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [fearActive, setFearActive] = useState(false);
  const fearActiveRef = useRef(false);
  const [currentMapId, setCurrentMapId] = useState<string>("town");
  const currentMap = useMemo<MapDef>(() => getMap(currentMapId), [currentMapId]);
  const currentMapRef = useRef<MapDef>(currentMap);
  useEffect(() => {
    currentMapRef.current = currentMap;
  }, [currentMap]);
  const [musicMuted, setMusicMuted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("realmstride.musicMuted") === "1";
  });
  const musicStartedRef = useRef(false);
  // Start the music engine on the first user interaction (browsers block
  // autoplay until then) and tear it down when the canvas unmounts.
  useEffect(() => {
    const engine = getMusicEngine();
    engine.setMuted(musicMuted);
    const tryStart = () => {
      if (musicStartedRef.current) return;
      musicStartedRef.current = true;
      engine.start();
      engine.setMap(currentMapRef.current.id);
    };
    const events: Array<keyof WindowEventMap> = ["pointerdown", "keydown", "touchstart"];
    events.forEach((e) => window.addEventListener(e, tryStart, { once: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, tryStart));
      engine.stop();
      musicStartedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Switch tracks when the player moves between maps.
  useEffect(() => {
    getMusicEngine().setMap(currentMapId);
  }, [currentMapId]);
  // Apply mute toggle and persist preference.
  useEffect(() => {
    getMusicEngine().setMuted(musicMuted);
    try {
      window.localStorage.setItem("realmstride.musicMuted", musicMuted ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [musicMuted]);
  const MAX_HP = player.max_hp ?? maxHpFor(level);
  const [hp, setHp] = useState(player.hp ?? MAX_HP);
  const hpRef = useRef(hp);
  useEffect(() => {
    hpRef.current = hp;
  }, [hp]);
  const maxHpRef = useRef(MAX_HP);
  useEffect(() => {
    maxHpRef.current = MAX_HP;
  }, [MAX_HP]);

  // Persist HP to the server (debounced) so it survives reloads.
  const lastSavedHpRef = useRef(player.hp ?? MAX_HP);
  const updateRef = useRef(update);
  const syncHpRef = useRef(syncHp);
  useEffect(() => {
    updateRef.current = update;
    syncHpRef.current = syncHp;
  }, [update, syncHp]);
  useEffect(() => {
    const rounded = Math.round(hp);
    if (rounded === lastSavedHpRef.current) return;
    if (isSpectator) return;
    const t = setTimeout(() => {
      lastSavedHpRef.current = rounded;
      syncHpRef.current.mutate(rounded);
    }, 1500);
    return () => clearTimeout(t);
  }, [hp, isSpectator]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const meRef = useRef<{ id: string; color: string } | null>(null);
  const zoomRef = useRef(1);
  const [zoomDisplay, setZoomDisplay] = useState(1);
  const panRef = useRef({ x: 0, y: 0 });
  const clickTargetRef = useRef<{ x: number; y: number } | null>(null);
  const monstersRef = useRef<MonsterInstance[]>([]);
  const levelRef = useRef(level);
  const bossLastAtRef = useRef<Record<string, string>>(
    (player.last_boss_at_by_map ?? {}) as Record<string, string>,
  );
  const bossSeenRef = useRef(false); // dedupe defeatBoss server call
  useEffect(() => {
    levelRef.current = level;
  }, [level]);
  useEffect(() => {
    bossLastAtRef.current = (player.last_boss_at_by_map ?? {}) as Record<string, string>;
  }, [player.last_boss_at_by_map]);

  // Use the player's wallet-derived id so presence + identity are stable.
  // Falls back to user_id / db id for accounts without a wallet linked.
  const myId = player.wallet_address ?? player.user_id ?? player.id;
  const [profile, setProfile] = useState<Profile>({
    name: player.name,
    job: player.job,
    color: player.color,
    avatar: player.avatar,
    character_sprite: normalizeCharacterSprite(player.character_sprite),
  });
  // Keep profile in sync with server-side player when it changes elsewhere.
  useEffect(() => {
    setProfile({
      name: player.name,
      job: player.job,
      color: player.color,
      avatar: player.avatar,
      character_sprite: normalizeCharacterSprite(player.character_sprite),
    });
  }, [player.name, player.job, player.color, player.avatar, player.character_sprite]);
  const profileRef = useRef(profile);
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);
  // Custom avatar image (data URL). Loaded into an HTMLImageElement so the
  // canvas render loop can draw it without re-creating Image objects.
  const customAvatarRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!player.custom_avatar_url) {
      customAvatarRef.current = null;
      return;
    }
    const img = new Image();
    img.onload = () => {
      customAvatarRef.current = img;
    };
    img.src = player.custom_avatar_url;
  }, [player.custom_avatar_url]);
  const [editOpen, setEditOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 640 : true,
  );
  const [chatMinimized, setChatMinimized] = useState(false);
  const [invOpen, setInvOpen] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; ts: number } | null>(null);
  const showToast = (text: string) => setToast({ text, ts: Date.now() });
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const award = (event: string, scale?: number) => {
    if (isSpectator) return;
    reward.mutate({ event, scale });
  };
  // Stable ref so the canvas render-loop effect (which only runs once) can
  // call the latest mutations without re-subscribing.
  const awardRef = useRef(award);
  useEffect(() => {
    awardRef.current = award;
  });

  // Inventory + worn lookup → effective attack/defense bonuses
  const items = inventory.data ?? [];
  const inventoryBySlot = useMemo(() => {
    const arr: (typeof items[number] | null)[] = Array(INVENTORY_SIZE).fill(null);
    for (const it of items) {
      if (it.slot_kind === "inventory" && it.slot_index >= 0 && it.slot_index < INVENTORY_SIZE) {
        arr[it.slot_index] = it;
      }
    }
    return arr;
  }, [items]);
  const wear = useMemo(() => {
    const arr: (typeof items[number] | null)[] = Array(WEAR_KIND_BY_INDEX.length).fill(null);
    for (const it of items) {
      if (it.slot_kind === "wear" && it.slot_index >= 0 && it.slot_index < arr.length) {
        arr[it.slot_index] = it;
      }
    }
    return arr;
  }, [items]);
  let bonusAttack = 0;
  let bonusDefense = 0;
  let hpRegenPerSec = 0;
  for (const it of wear) {
    if (!it) continue;
    bonusAttack += it.attack ?? 0;
    bonusDefense += it.defense ?? 0;
    if (it.effect === "damage") bonusAttack += it.amount ?? 0;
    else if (it.effect === "defense") bonusDefense += it.amount ?? 0;
    else if (it.effect === "hp_regen") hpRegenPerSec += it.amount ?? 0;
  }
  const effectiveAttack = damageFor(level, player.base_damage) + bonusAttack;
  const effectiveDefense = defenseFor(level, player.base_defense) + bonusDefense;
  const hpRegenRef = useRef(hpRegenPerSec);
  useEffect(() => {
    hpRegenRef.current = hpRegenPerSec;
  }, [hpRegenPerSec]);
  const attackRef = useRef(effectiveAttack);
  useEffect(() => {
    attackRef.current = effectiveAttack;
  }, [effectiveAttack]);
  const defenseRef = useRef(effectiveDefense);
  useEffect(() => {
    defenseRef.current = effectiveDefense;
  }, [effectiveDefense]);
  const defeatBossRef = useRef(defeatBoss);
  useEffect(() => {
    defeatBossRef.current = defeatBoss;
  });

  const useItemById = async (itemId: string) => {
    try {
      await useItem.mutateAsync(itemId);
    } catch (e: any) {
      showToast(e?.message ?? "Use failed");
    }
  };
  const useInventorySlot = (idx: number) => {
    const it = inventoryBySlot[idx];
    if (it) useItemById(it.id);
  };
  const discardItemById = async (itemId: string) => {
    try {
      await discardItem.mutateAsync(itemId);
    } catch (e: any) {
      showToast(e?.message ?? "Discard failed");
    }
  };
  const placeAt = async (
    itemId: string,
    slotKind: "inventory" | "wear",
    slotIndex: number,
  ) => {
    try {
      await placeItem.mutateAsync({ itemId, slotKind, slotIndex });
    } catch (e: any) {
      showToast(e?.message ?? "Move failed");
    }
  };

  // re-broadcast identity when profile changes
  useEffect(() => {
    const ch = channelRef.current;
    if (!ch) return;
    if (isSpectator) {
      ch.track({ id: myId, name: "spectator", color: "#888" });
      return;
    }
    ch.track({
      id: myId,
      name: profile.name,
      color: profile.color,
      character_sprite: profile.character_sprite,
    });
  }, [profile, myId, isSpectator]);

  // Refs the render loop reads
  const chatFocusedRef = useRef(false);
  const openPlaceRef = useRef<Place | null>(null);
  const portalOpenRef = useRef(false);
  useEffect(() => {
    chatFocusedRef.current = chatFocused;
  }, [chatFocused]);
  useEffect(() => {
    openPlaceRef.current = openPlace;
  }, [openPlace]);
  useEffect(() => {
    portalOpenRef.current = portalOpen;
  }, [portalOpen]);
  const modalOpenRef = useRef(false);
  useEffect(() => {
    modalOpenRef.current = blacksmithOpen || wizardOpen || marketOpen || !!bossDrop || realmOpen || studyOpen;
  }, [blacksmithOpen, wizardOpen, marketOpen, bossDrop, realmOpen, studyOpen]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const assets: Record<string, HTMLImageElement> = {};
    const sources: Record<string, string> = {
      tree: treeImg,
      "forest-tree": forestTreeImg,
      "pine-tree": pineTreeImg,
      "palm-tree": palmTreeImg,
      house: houseImg,
      bank: bankImg,
      library: libraryImg,
      inn: innImg,
      blacksmith: blacksmithImg,
      character: characterImg,
      ...Object.fromEntries(CHARACTER_SPRITES.map((c) => [`character-${c.id}`, c.src])),
      fountain: fountainImg,
      portal: portalImg,
      church: churchImg,
      farm: farmImg,
      "wizard-tower": wizardTowerImg,
      "dungeon-entrance": dungeonEntranceImg,
      "realm-exchange": realmExchangeImg,
      "pvp-arena": pvpArenaImg,
      "monster-slime": monsterSlimeImg,
      "monster-skeleton": monsterSkeletonImg,
      "monster-bat": monsterBatImg,
      "monster-wolf": monsterWolfImg,
      "monster-spider": monsterSpiderImg,
      "monster-treant": monsterTreantImg,
      "monster-werewolf": monsterWerewolfImg,
      "hunter-lodge": hunterLodgeImg,
      "druid-grove": druidGroveImg,
      "forest-dungeon-entrance": forestDungeonEntranceImg,
      market: marketStallImg,
      tavern: tavernImg,
      cactus: cactusImg,
      pyramid: pyramidImg,
      oasis: oasisImg,
      "desert-tent": desertTentImg,
      "monster-scorpion": monsterScorpionImg,
      "monster-mummy": monsterMummyImg,
      "monster-sandworm": monsterSandwormImg,
      "monster-pharaoh": monsterPharaohImg,
      "monster-world-tree": monsterWorldTreeImg,
      "monster-leviathan": monsterLeviathanImg,
      "monster-harvest-titan": monsterHarvestTitanImg,
      "monster-frost-dragon": monsterFrostDragonImg,
      "monster-yeti": monsterYetiImg,
      "monster-ice-wolf": monsterIceWolfImg,
      "monster-frost-imp": monsterFrostImpImg,
      "monster-ice-golem": monsterIceGolemImg,
      "monster-crab": monsterCrabImg,
      "monster-pirate": monsterPirateImg,
      "monster-merfolk": monsterMerfolkImg,
      "monster-kraken": monsterKrakenImg,
      "ranger-outpost": rangerOutpostImg,
      "mountain-dungeon-entrance": mountainDungeonEntranceImg,
      "beach-hut": beachHutImg,
      "beach-dungeon-entrance": beachDungeonEntranceImg,
    };
    let loadedCount = 0;
    const total = Object.keys(sources).length;
    let cancelled = false;

    Object.entries(sources).forEach(([key, src]) => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === total && !cancelled) setReady(true);
      };
      img.src = src;
      assets[key] = img;
    });

    let map = buildMap({
      seed: currentMapRef.current.seed,
      treeDensity: currentMapRef.current.treeDensity,
      treeType:
        currentMapRef.current.id === "forest"
          ? "forest-tree"
          : currentMapRef.current.id === "desert"
            ? "cactus"
            : currentMapRef.current.id === "mountain"
              ? "pine-tree"
              : currentMapRef.current.id === "beach"
                ? "palm-tree"
                : "tree",
      occupied: [
        ...currentMapRef.current.places.map((p) => ({ x: p.x, y: p.y, r: 2 })),
        ...currentMapRef.current.portals.map((p) => ({ x: p.x, y: p.y, r: 2 })),
      ],
    });
    let lastBuiltMapId = currentMapRef.current.id;

    const spawnMonstersForMap = (mapId: string) => {
      let spawns: ReturnType<typeof dungeonSpawnsForLevel>;
      let bossSpawn: typeof BOSS_SPAWN | null = null;
      let bossDefId = "boss";
      if (mapId === "dungeon") {
        spawns = dungeonSpawnsForLevel(levelRef.current);
        bossSpawn = BOSS_SPAWN;
        bossDefId = "boss";
      } else if (mapId === "forest") {
        spawns = forestSpawnsForLevel(levelRef.current);
        // Seasonal world boss spawns in Whispering Forest.
        const { season } = getCurrentSeason();
        bossSpawn = WORLD_BOSS_SPAWN;
        bossDefId = season.bossDefId;
      } else if (mapId === "forest-dungeon") {
        spawns = forestDungeonSpawnsForLevel(levelRef.current);
        bossSpawn = FOREST_BOSS_SPAWN;
        bossDefId = "werewolf_boss";
      } else if (mapId === "desert") {
        spawns = desertSpawnsForLevel(levelRef.current);
      } else if (mapId === "desert-dungeon") {
        spawns = desertDungeonSpawnsForLevel(levelRef.current);
        bossSpawn = DESERT_BOSS_SPAWN;
        bossDefId = "pharaoh_boss";
      } else if (mapId === "mountain") {
        spawns = mountainSpawnsForLevel(levelRef.current);
      } else if (mapId === "mountain-dungeon") {
        spawns = mountainDungeonSpawnsForLevel(levelRef.current);
        bossSpawn = MOUNTAIN_BOSS_SPAWN;
        bossDefId = "ice_golem_boss";
      } else if (mapId === "beach") {
        spawns = beachSpawnsForLevel(levelRef.current);
      } else if (mapId === "beach-dungeon") {
        spawns = beachDungeonSpawnsForLevel(levelRef.current);
        bossSpawn = BEACH_BOSS_SPAWN;
        bossDefId = "kraken_boss";
      } else if (mapId === "town") {
        // No regular monsters in town.
        spawns = [];
      } else {
        monstersRef.current = [];
        return;
      }
      const lvl = levelRef.current;
      const scale = monsterScale(lvl);
      const list: MonsterInstance[] = spawns.map((s, i) => {
        const def = MONSTER_DEFS[s.defId];
        const hp = Math.round((def?.hp ?? 10) * scale);
        return {
          id: `${mapId}-${i}-${s.defId}`,
          defId: s.defId,
          x: s.x,
          y: s.y,
          hp,
          maxHp: hp,
          scale,
          lastAttack: 0,
          hitFlash: 0,
        };
      });
      // Spawn boss if cooldown allows (shared cooldown across both dungeons).
      if (bossSpawn) {
        // World boss uses a per-season cooldown key so each season's boss is
        // independently defeatable; other dungeons stick with their map id.
        const isWorldBoss = mapId === "forest";
        const seasonInfo = isWorldBoss ? getCurrentSeason() : null;
        const cooldownKey = isWorldBoss
          ? worldBossMapId(seasonInfo!.season.id as SeasonId)
          : mapId;
        const lastIso = bossLastAtRef.current[cooldownKey];
        const lastBoss = lastIso ? new Date(lastIso).getTime() : 0;
        const BOSS_COOLDOWN_MS = 60 * 60 * 1000;
        let canSpawn = false;
        if (isWorldBoss) {
          // Seasonal world boss: once defeated during the current season window,
          // it stays down until that season comes around again.
          const seasonStart = Date.now() - seasonInfo!.elapsedMs;
          canSpawn = !lastBoss || lastBoss < seasonStart;
        } else {
          canSpawn = !lastBoss || Date.now() - lastBoss >= BOSS_COOLDOWN_MS;
        }
        if (canSpawn) {
          const bossDef = MONSTER_DEFS[bossDefId];
          const bossHp = Math.round(bossDef.hp * scale);
          list.push({
            id: `${mapId}-boss`,
            defId: bossDefId,
            x: bossSpawn.x,
            y: bossSpawn.y,
            hp: bossHp,
            maxHp: bossHp,
            scale,
            lastAttack: 0,
            hitFlash: 0,
            isBoss: true,
          });
        }
      }
      monstersRef.current = list;
    };
    spawnMonstersForMap(currentMapRef.current.id);

    // Spawn near the right portal of the starting map.
    const startPortal =
      currentMapRef.current.portals.find((p) => p.id === "right") ??
      currentMapRef.current.portals[0];
    const me = {
      id: myId,
      get name() {
        return profileRef.current.name;
      },
      get color() {
        return profileRef.current.color;
      },
      get level() {
        return levelRef.current;
      },
      get character_sprite() {
        return profileRef.current.character_sprite;
      },
      x: isSpectator ? MAP_SIZE / 2 : startPortal ? startPortal.x - 2 : MAP_SIZE / 2,
      y: isSpectator ? MAP_SIZE / 2 : startPortal ? startPortal.y : MAP_SIZE / 2,
    };
    meRef.current = { id: myId, color: profileRef.current.color };
    const remotes = new Map<string, RemotePlayer>();

    const keys = new Set<string>();
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      keys.add(e.key.toLowerCase());
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      keys.delete(e.key.toLowerCase());
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    };
    resize();
    window.addEventListener("resize", resize);

    const channel: RealtimeChannel = supabase.channel("voxel-town", {
      config: { presence: { key: myId }, broadcast: { self: false } },
    });
    channelRef.current = channel;

    /**
     * Cross-reference an incoming broadcast `id` with the channel's presence
     * state so the public 'voxel-town' channel can't be used to inject fake
     * players or impersonate someone who isn't connected. Spoofing a real
     * present user is still possible (broadcast is unauthenticated by
     * design), but at least drops the "anyone can publish anything" floor.
     */
    const idIsPresent = (id: string): boolean => {
      if (id === myId) return false;
      // Spectators are present but should never be treated as players for
      // broadcast / drawing purposes.
      if (id.startsWith("spectator-")) return false;
      const state = channel.presenceState<{ id: string }>();
      for (const arr of Object.values(state)) {
        if (arr.some((e) => e.id === id)) return true;
      }
      return false;
    };

    channel.on("broadcast", { event: "move" }, ({ payload }) => {
      const p = payload as RemotePlayer;
      if (!p || typeof p.id !== "string" || !idIsPresent(p.id)) return;
      if (typeof p.x !== "number" || typeof p.y !== "number") return;
      const prev = remotes.get(p.id);
      const moving = !prev || Math.hypot(prev.x - p.x, prev.y - p.y) > 0.005;
      const next: any = {
        id: p.id,
        name: typeof p.name === "string" ? p.name.slice(0, 32) : "?",
        color: typeof p.color === "string" ? p.color.slice(0, 16) : "#888",
        x: p.x,
        y: p.y,
        level: typeof p.level === "number" ? p.level : prev?.level,
        lastMoveAt: moving ? performance.now() : prev?.lastMoveAt ?? 0,
        character_sprite:
          typeof (p as any).character_sprite === "string"
            ? (p as any).character_sprite
            : prev?.character_sprite,
      };
      remotes.set(p.id, next);
    });

    channel.on("broadcast", { event: "chat" }, ({ payload }) => {
      const raw = payload as Partial<ChatMessage> | null;
      if (!raw || typeof raw.id !== "string" || !idIsPresent(raw.id)) return;
      if (typeof raw.text !== "string" || typeof raw.name !== "string") return;
      const msg: ChatMessage = {
        id: raw.id,
        name: raw.name.slice(0, 32),
        color: typeof raw.color === "string" ? raw.color.slice(0, 16) : "#888",
        text: raw.text.replace(/[\u0000-\u001f]/g, "").slice(0, 140),
        ts: Date.now(),
      };
      setChat((prev) => [...prev.slice(-49), msg]);
    });

    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState<{ id: string; name: string; color: string }>();
      const ids = new Set<string>();
      let realPlayers = 0;
      Object.values(state).forEach((arr) => {
        arr.forEach((entry) => {
          ids.add(entry.id);
          const isSpec = entry.id.startsWith("spectator-");
          if (!isSpec) realPlayers += 1;
          if (!isSpec && entry.id !== myId && !remotes.has(entry.id)) {
            remotes.set(entry.id, {
              id: entry.id,
              name: entry.name,
              color: entry.color,
              x: MAP_SIZE / 2,
              y: MAP_SIZE / 2,
            });
          }
        });
      });
      for (const id of remotes.keys()) if (!ids.has(id)) remotes.delete(id);
      setPlayerCount(realPlayers || (isSpectator ? 0 : 1));
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        if (isSpectator) {
          await channel.track({ id: myId, name: "spectator", color: "#888" });
        } else {
          await channel.track({
            id: myId,
            name: profileRef.current.name,
            color: profileRef.current.color,
            level: levelRef.current,
            character_sprite: profileRef.current.character_sprite,
          });
        }
      }
    });

    let lastBroadcast = 0;
    const broadcastMove = (now: number) => {
      if (isSpectator) return;
      if (now - lastBroadcast < 80) return;
      lastBroadcast = now;
      channel.send({
        type: "broadcast",
        event: "move",
        payload: {
          id: me.id,
          name: me.name,
          color: me.color,
          x: me.x,
          y: me.y,
          level: me.level,
          character_sprite: me.character_sprite,
        },
      });
    };

    let raf = 0;
    let lastTime = performance.now();
    let lastPos = { x: me.x, y: me.y };
    let lastNearbyId: string | null = null;
    let lastNearbyPortalId: string | null = null;
    let meMovingUntil = 0;

    // Sandstorm particles (lazy-initialised when entering the desert).
    const sandParticles: Array<{ x: number; y: number; vx: number; vy: number; r: number; a: number }> = [];
    const ensureSandParticles = (w: number, h: number) => {
      const target = 220;
      while (sandParticles.length < target) {
        sandParticles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: 280 + Math.random() * 260,
          vy: 30 + Math.random() * 40,
          r: 1 + Math.random() * 2.5,
          a: 0.25 + Math.random() * 0.45,
        });
      }
    };

    // Seasonal particles (petals / snow / leaves). Lazy-initialised; re-seeded
    // when the season changes so the look matches the active world boss.
    type SeasonParticle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      a: number;
      rot: number;
      vrot: number;
    };
    const seasonParticles: SeasonParticle[] = [];
    let seasonParticleSeed = "";
    const ensureSeasonParticles = (w: number, h: number, seasonId: string) => {
      const targetCount = seasonId === "summer" ? 0 : 140;
      if (seasonParticleSeed !== seasonId) {
        seasonParticles.length = 0;
        seasonParticleSeed = seasonId;
      }
      while (seasonParticles.length < targetCount) {
        seasonParticles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (seasonId === "winter" ? -20 : 40) + (Math.random() - 0.5) * 60,
          vy: 50 + Math.random() * 90,
          r: 2 + Math.random() * 4,
          a: 0.5 + Math.random() * 0.4,
          rot: Math.random() * Math.PI * 2,
          vrot: (Math.random() - 0.5) * 2,
        });
      }
      if (seasonParticles.length > targetCount) {
        seasonParticles.length = targetCount;
      }
    };

    let lastSeasonId: string | null = null;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = Math.exp(-e.deltaY * 0.0015);
      zoomRef.current = Math.max(0.5, Math.min(2.5, zoomRef.current * factor));
      setZoomDisplay(zoomRef.current);
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });

    let dragging = false;
    let lastMx = 0;
    let lastMy = 0;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragStartTime = 0;
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      dragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragStartTime = performance.now();
      lastMx = e.clientX;
      lastMy = e.clientY;
      canvas.style.cursor = "grabbing";
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastMx;
      const dy = e.clientY - lastMy;
      lastMx = e.clientX;
      lastMy = e.clientY;
      const z = zoomRef.current;
      panRef.current.x += dx / z;
      panRef.current.y += dy / z;
    };
    const onMouseUp = (e: MouseEvent) => {
      dragging = false;
      canvas.style.cursor = "grab";
      const ddx = e.clientX - dragStartX;
      const ddy = e.clientY - dragStartY;
      const dt = performance.now() - dragStartTime;
      if (Math.hypot(ddx, ddy) < 8 && dt < 350) {
        const z = zoomRef.current;
        const dpr = window.devicePixelRatio;
        const cw = canvas.width / dpr;
        const ch = canvas.height / dpr;
        const { sx: psx, sy: psy } = isoProject(me.x, me.y);
        const ox = cw / (2 * z) - psx + panRef.current.x;
        const oy = ch / (2 * z) - psy + panRef.current.y;
        const wx = e.clientX / z;
        const wy = e.clientY / z;
        const tsx = wx - ox;
        const tsy = wy - oy;
        // Monster click takes priority over tile movement.
        let hitMonster: MonsterInstance | null = null;
        let bestD = Infinity;
        for (const m of monstersRef.current) {
          const { sx: mx, sy: my } = isoProject(m.x, m.y);
          const d = Math.hypot(mx - tsx, my - 18 - tsy);
          if (d < 26 && d < bestD) {
            bestD = d;
            hitMonster = m;
          }
        }
        if (hitMonster) {
          const def = MONSTER_DEFS[hitMonster.defId];
          if (isSpectator) {
            // Spectators can't attack — just centre the camera there.
            clickTargetRef.current = { x: Math.round(hitMonster.x), y: Math.round(hitMonster.y) };
            return;
          }
          const distToMe = Math.hypot(hitMonster.x - me.x, hitMonster.y - me.y);
          if (distToMe > 2.2) {
            // walk closer first
            clickTargetRef.current = { x: Math.round(hitMonster.x), y: Math.round(hitMonster.y) };
          } else {
            hitMonster.hp -= attackRef.current * 2;
            hitMonster.hitFlash = performance.now() + 180;
            if (hitMonster.hp <= 0) {
              monstersRef.current = monstersRef.current.filter((m) => m !== hitMonster);
              if (hitMonster.isBoss) {
                if (!bossSeenRef.current) {
                  bossSeenRef.current = true;
                  const curMapId = currentMapRef.current.id;
                  const bossMapId =
                    curMapId === "town"
                      ? worldBossMapId(getCurrentSeason().season.id as SeasonId)
                      : curMapId;
                  defeatBossRef.current
                    .mutateAsync({ mapId: bossMapId })
                    .then((res) => {
                      setBossDrop(res.drop);
                      bossLastAtRef.current = (res.player.last_boss_at_by_map ?? {}) as Record<string, string>;
                    })
                    .catch((e) => {
                      bossSeenRef.current = false;
                      showToast(e?.message ?? "Boss reward failed");
                    });
                }
              } else {
                const base = def?.reward ?? 0;
                const goldReward = Math.round(base * (hitMonster.scale ?? 1));
                if (def?.id) {
                  awardRef.current(`monster:${def.id}`, hitMonster.scale ?? 1);
                }
                showToast(`Slew ${def?.name ?? "monster"} (+${goldReward} gold)`);
              }
            }
          }
          return;
        }
        const tx = tsx / TILE_W + tsy / TILE_H;
        const ty = tsy / TILE_H - tsx / TILE_W;
        const tileX = Math.round(tx);
        const tileY = Math.round(ty);
        if (tileX >= 0 && tileX < MAP_SIZE && tileY >= 0 && tileY < MAP_SIZE) {
          // Snap player to nearest tile center first so click-to-move starts
          // from a stable position — keeps the camera from drifting mid-step.
          me.x = Math.round(me.x);
          me.y = Math.round(me.y);
          // Re-center camera on player before moving (clear any user drag pan).
          panRef.current.x = 0;
          panRef.current.y = 0;
          clickTargetRef.current = { x: tileX, y: tileY };
        }
      }
    };
    canvas.style.cursor = "grab";
    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Touch support: drag-to-pan + tap-to-click on mobile.
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      dragging = true;
      dragStartX = t.clientX;
      dragStartY = t.clientY;
      dragStartTime = performance.now();
      lastMx = t.clientX;
      lastMy = t.clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!dragging || e.touches.length !== 1) return;
      const t = e.touches[0];
      const dx = t.clientX - lastMx;
      const dy = t.clientY - lastMy;
      lastMx = t.clientX;
      lastMy = t.clientY;
      const z = zoomRef.current;
      panRef.current.x += dx / z;
      panRef.current.y += dy / z;
      e.preventDefault();
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!dragging) return;
      dragging = false;
      const t = e.changedTouches[0];
      if (!t) return;
      onMouseUp({ clientX: t.clientX, clientY: t.clientY, button: 0 } as MouseEvent);
    };
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);
    canvas.addEventListener("touchcancel", onTouchEnd);

    const drawTile = (
      type: "grass" | "dirt",
      x: number,
      y: number,
      ox: number,
      oy: number,
    ) => {
      const theme = currentMapRef.current.theme;
      const { sx, sy } = isoProject(x, y);
      const cx = sx + ox;
      const cy = sy + oy;
      ctx.beginPath();
      ctx.moveTo(cx, cy - TILE_H / 2);
      ctx.lineTo(cx + TILE_W / 2, cy);
      ctx.lineTo(cx, cy + TILE_H / 2);
      ctx.lineTo(cx - TILE_W / 2, cy);
      ctx.closePath();
      const pair = type === "grass" ? theme.grass : theme.dirt;
      ctx.fillStyle = (x + y) % 2 === 0 ? pair[0] : pair[1];
      ctx.fill();
      ctx.strokeStyle = type === "grass" ? "rgba(40,90,30,0.25)" : "rgba(120,80,40,0.25)";
      ctx.lineWidth = 1;
      ctx.stroke();
      const depth = 6;
      const edge = type === "grass" ? theme.grassEdge : theme.dirtEdge;
      ctx.beginPath();
      ctx.moveTo(cx - TILE_W / 2, cy);
      ctx.lineTo(cx, cy + TILE_H / 2);
      ctx.lineTo(cx, cy + TILE_H / 2 + depth);
      ctx.lineTo(cx - TILE_W / 2, cy + depth);
      ctx.closePath();
      ctx.fillStyle = edge[0];
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx, cy + TILE_H / 2);
      ctx.lineTo(cx + TILE_W / 2, cy);
      ctx.lineTo(cx + TILE_W / 2, cy + depth);
      ctx.lineTo(cx, cy + TILE_H / 2 + depth);
      ctx.closePath();
      ctx.fillStyle = edge[1];
      ctx.fill();
    };

    const drawPortal = (portal: Portal, ox: number, oy: number, now: number) => {
      const { sx, sy } = isoProject(portal.x, portal.y);
      const cx = sx + ox;
      const cy = sy + oy;
      const t = now / 600;
      const pulse = 1 + Math.sin(t * Math.PI * 2) * 0.12;
      // Soft aura that still pulses behind the artwork.
      const grad = ctx.createRadialGradient(cx, cy - 22, 4, cx, cy - 22, 60 * pulse);
      grad.addColorStop(0, "rgba(220,160,255,0.9)");
      grad.addColorStop(0.5, "rgba(150,90,255,0.45)");
      grad.addColorStop(1, "rgba(60,20,160,0)");
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(cx, cy - 22, 60 * pulse, 70 * pulse, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      const img = assets.portal;
      if (img?.complete) {
        const w = TILE_W * 2;
        const h = w * (img.height / img.width);
        ctx.drawImage(img, cx - w / 2, cy - h + TILE_H / 2, w, h);
      }
      // Label
      ctx.font = "bold 12px system-ui, sans-serif";
      ctx.textAlign = "center";
      const label = "🌀 Portal";
      const w = ctx.measureText(label).width + 12;
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      const bx = cx - w / 2;
      const by = cy - 86;
      ctx.beginPath();
      ctx.roundRect?.(bx, by, w, 18, 6);
      if (!ctx.roundRect) ctx.rect(bx, by, w, 18);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.fillText(label, cx, by + 13);
    };

    const drawProp = (
      type: string,
      x: number,
      y: number,
      ox: number,
      oy: number,
      label?: string,
      emoji?: string,
    ) => {
      const img = assets[type];
      if (!img || !img.complete) return;
      const { sx, sy } = isoProject(x, y);
      const baseW =
        type === "tree" ||
        type === "fountain" ||
        type === "cactus" ||
        type === "pine-tree" ||
        type === "palm-tree" ||
        type === "forest-tree"
          ? TILE_W * 1.6
          : type === "wizard-tower" || type === "pyramid"
            ? TILE_W * 2.2
            : type === "market"
              ? TILE_W * 1.8
            : type === "oasis"
              ? TILE_W * 2.0
            : TILE_W * 2.4;
      const h = baseW * (img.height / img.width);
      const yOffset = type === "market" ? TILE_H * 0.35 : TILE_H / 2;
      ctx.drawImage(img, sx + ox - baseW / 2, sy + oy - h + yOffset, baseW, h);
      if (label) {
        ctx.font = "bold 12px system-ui, sans-serif";
        ctx.textAlign = "center";
        const textY = sy + oy - h + TILE_H / 2 - 6;
        const text = (emoji ? emoji + " " : "") + label;
        const w = ctx.measureText(text).width + 12;
        ctx.fillStyle = "rgba(0,0,0,0.65)";
        ctx.beginPath();
        const r = 6;
        const bx = sx + ox - w / 2;
        const by = textY - 14;
        ctx.roundRect?.(bx, by, w, 18, r);
        if (!ctx.roundRect) ctx.rect(bx, by, w, 18);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.fillText(text, sx + ox, textY);
      }
    };

    const drawPlayer = (
      p: { name: string; color: string; x: number; y: number; level?: number; character_sprite?: string },
      ox: number,
      oy: number,
      moving: boolean = false,
      now: number = 0,
    ) => {
      const spriteId = normalizeCharacterSprite(p.character_sprite);
      const img = assets[`character-${spriteId}`] ?? assets.character;
      const { sx, sy } = isoProject(p.x, p.y);
      const t = now / 1000;
      // Idle breathing bob — gentle, no horizontal tilt.
      const bob = moving ? Math.sin(t * 12) * 3 : Math.sin(t * 2.4) * 2;
      const tilt = moving ? Math.sin(t * 12) * 0.08 : 0;
      // The in-game character always uses the default character sprite.
      // Custom uploaded images only change the profile avatar, not the player sprite.
      const isMeDraw = false;
      const usedImg = img;
      // Compute where the character's *feet* land on screen. The character
      // sprite has transparent padding below the feet (~33% of its height),
      // so we offset the shadow up from the image bottom by that amount.
      const drawY = sy + oy + 8 + bob;
      const feetPad = usedImg && !isMeDraw
        ? 0.33 * (48 * (usedImg.height / usedImg.width))
        : 0;
      const feetY = drawY - feetPad;
      const shadowScale = moving
        ? 1 + Math.sin(t * 12) * 0.08
        : 1 + Math.sin(t * 2.4) * 0.06;
      ctx.fillStyle = "rgba(0,0,0,0.28)";
      ctx.beginPath();
      ctx.ellipse(sx + ox, feetY, 14 * shadowScale, 5 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();
      if (usedImg && usedImg.complete) {
        const w = 48;
        const h = isMeDraw ? w : w * (usedImg.height / usedImg.width);
        ctx.save();
        ctx.translate(sx + ox, drawY);
        ctx.rotate(tilt);
        if (isMeDraw) {
          // Clip the custom avatar to a circle so user uploads look like an avatar.
          ctx.beginPath();
          ctx.arc(0, -h / 2, w / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
        }
        ctx.drawImage(usedImg, -w / 2, -h, w, h);
        ctx.restore();
      }
      ctx.font = "bold 13px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(0,0,0,0.7)";
      const label = `Lv ${p.level ?? 1} - ${p.name}`;
      ctx.strokeText(label, sx + ox, sy + oy - 56 + bob);
      ctx.fillStyle = p.color;
      ctx.fillText(label, sx + ox, sy + oy - 56 + bob);
    };

    const drawMonster = (m: MonsterInstance, ox: number, oy: number, now: number) => {
      const def = MONSTER_DEFS[m.defId];
      if (!def) return;
      const img = assets[def.sprite];
      const { sx, sy } = isoProject(m.x, m.y);
      // soft shadow
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(sx + ox, sy + oy + 6, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      if (img?.complete) {
        const w = m.isBoss ? 80 : 44;
        const h = w * (img.height / img.width);
        const flash = now < m.hitFlash;
        ctx.save();
        if (flash) {
          ctx.shadowColor = "rgba(255,80,80,0.95)";
          ctx.shadowBlur = 14;
        }
        if (m.isBoss) {
          ctx.shadowColor = "rgba(255,200,80,0.85)";
          ctx.shadowBlur = 22;
        }
        ctx.drawImage(img, sx + ox - w / 2, sy + oy - h + TILE_H / 2, w, h);
        ctx.restore();
      }
      // HP bar
      const barW = 36;
      const maxHp = m.maxHp ?? def.hp;
      const pct = Math.max(0, m.hp / maxHp);
      const by = sy + oy - 50;
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(sx + ox - barW / 2, by, barW, 5);
      ctx.fillStyle = pct > 0.5 ? "#4ade80" : pct > 0.2 ? "#fbbf24" : "#ef4444";
      ctx.fillRect(sx + ox - barW / 2, by, barW * pct, 5);
      // name label
      ctx.font = "bold 11px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(0,0,0,0.7)";
      ctx.strokeText(`${def.emoji} ${def.name}`, sx + ox, by - 3);
      ctx.fillStyle = "#fff";
      ctx.fillText(`${def.emoji} ${def.name}`, sx + ox, by - 3);
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      let dx = 0;
      let dy = 0;
      const canMove =
        !chatFocusedRef.current &&
        !openPlaceRef.current &&
        !portalOpenRef.current &&
        !modalOpenRef.current;
      if (canMove && (keys.has("w") || keys.has("arrowup"))) {
        dx -= 1;
        dy -= 1;
      }
      if (canMove && (keys.has("s") || keys.has("arrowdown"))) {
        dx += 1;
        dy += 1;
      }
      if (canMove && (keys.has("a") || keys.has("arrowleft"))) {
        dx -= 1;
        dy += 1;
      }
      if (canMove && (keys.has("d") || keys.has("arrowright"))) {
        dx += 1;
        dy -= 1;
      }
      const len = Math.hypot(dx, dy);
      if (len > 0) {
        dx /= len;
        dy /= len;
        me.x = Math.max(0, Math.min(MAP_SIZE - 1, me.x + dx * SPEED * dt));
        me.y = Math.max(0, Math.min(MAP_SIZE - 1, me.y + dy * SPEED * dt));
        clickTargetRef.current = null;
      } else if (clickTargetRef.current && canMove) {
        const target = clickTargetRef.current;
        const tdx = target.x - me.x;
        const tdy = target.y - me.y;
        const tlen = Math.hypot(tdx, tdy);
        if (tlen > 0.1) {
          const ndx = tdx / tlen;
          const ndy = tdy / tlen;
          me.x = Math.max(0, Math.min(MAP_SIZE - 1, me.x + ndx * SPEED * dt));
          me.y = Math.max(0, Math.min(MAP_SIZE - 1, me.y + ndy * SPEED * dt));
        } else {
          me.x = target.x;
          me.y = target.y;
          clickTargetRef.current = null;
        }
      }

      if (Math.hypot(me.x - lastPos.x, me.y - lastPos.y) > 0.02) {
        broadcastMove(now);
        lastPos = { x: me.x, y: me.y };
        meMovingUntil = now + 200;
      }

      // Rebuild map when player travels to a different one.
      if (currentMapRef.current.id !== lastBuiltMapId) {
        const m = currentMapRef.current;
        map = buildMap({
          seed: m.seed,
          treeDensity: m.treeDensity,
          treeType:
            m.id === "forest"
              ? "forest-tree"
              : m.id === "desert"
                ? "cactus"
                : m.id === "mountain"
                  ? "pine-tree"
                  : m.id === "beach"
                    ? "palm-tree"
                    : "tree",
          occupied: [
            ...m.places.map((p) => ({ x: p.x, y: p.y, r: 2 })),
            ...m.portals.map((p) => ({ x: p.x, y: p.y, r: 2 })),
          ],
        });
        // Enter the new map next to its left portal (since you stepped out of the right portal).
        const entry = m.portals.find((p) => p.id === "left") ?? m.portals[0];
        if (isSpectator) {
          me.x = MAP_SIZE / 2;
          me.y = MAP_SIZE / 2;
        } else if (entry) {
          me.x = entry.x + 2;
          me.y = entry.y;
        }
        spawnMonstersForMap(m.id);
        setHp(maxHpRef.current);
        hpRef.current = maxHpRef.current;
        panRef.current.x = 0;
        panRef.current.y = 0;
        clickTargetRef.current = null;
        lastBuiltMapId = m.id;
        bossSeenRef.current = false;
      }

      // Monster AI: chase the player when in range, then attack on cooldown.
      if (!isSpectator && monstersRef.current.length > 0 && hpRef.current > 0) {
        let totalDamage = 0;
        for (const mon of monstersRef.current) {
          const def = MONSTER_DEFS[mon.defId];
          if (!def) continue;
          const ddx = me.x - mon.x;
          const ddy = me.y - mon.y;
          const distM = Math.hypot(ddx, ddy);
          if (distM < def.aggroRange) {
            if (distM > def.attackRange) {
              const step = (def.speed * dt) / Math.max(distM, 0.001);
              mon.x += ddx * step;
              mon.y += ddy * step;
            } else if (now - mon.lastAttack > def.attackCooldown) {
              mon.lastAttack = now;
              const raw = def.damage * (mon.scale ?? 1);
              totalDamage += Math.max(1, raw - defenseRef.current * 0.4);
            }
          }
        }
        if (totalDamage > 0) {
          const next = Math.max(0, hpRef.current - totalDamage);
          hpRef.current = next;
          setHp(next);
          if (next === 0) {
            showToast("You were defeated! Respawning…");
            // teleport home to town and refill.
            currentMapRef.current = getMap("town");
            setCurrentMapId("town");
            hpRef.current = maxHpRef.current;
            setHp(maxHpRef.current);
          }
        }
      }

      // HP regen from worn gear.
      if (!isSpectator && hpRegenRef.current > 0 && hpRef.current > 0 && hpRef.current < maxHpRef.current) {
        const gain = hpRegenRef.current * dt;
        const next = Math.min(maxHpRef.current, hpRef.current + gain);
        if (next - hpRef.current > 0.01) {
          hpRef.current = next;
          setHp(Math.round(next));
        }
      }

      let near: Place | null = null;
      let bestD = 1.8;
      for (const p of currentMapRef.current.places) {
        const d = Math.hypot(p.x - me.x, p.y - me.y);
        if (d < bestD) {
          bestD = d;
          near = p;
        }
      }
      const nearId = near?.id ?? null;
      if (nearId !== lastNearbyId) {
        lastNearbyId = nearId;
        setNearby(near);
      }

      let nearPortal: Portal | null = null;
      let bestPd = 1.8;
      for (const p of currentMapRef.current.portals) {
        const d = Math.hypot(p.x - me.x, p.y - me.y);
        if (d < bestPd) {
          bestPd = d;
          nearPortal = p;
        }
      }
      const nearPortalId = nearPortal?.id ?? null;
      if (nearPortalId !== lastNearbyPortalId) {
        lastNearbyPortalId = nearPortalId;
        setNearbyPortal(nearPortal);
      }

      const dpr = window.devicePixelRatio;
      const zoom = zoomRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const sky = currentMapRef.current.theme.sky;
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height / dpr);
      grad.addColorStop(0, sky[0]);
      grad.addColorStop(1, sky[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      const cw = canvas.width / dpr;
      const ch = canvas.height / dpr;
      ctx.setTransform(dpr * zoom, 0, 0, dpr * zoom, 0, 0);
      const { sx: psx, sy: psy } = isoProject(me.x, me.y);
      const ox = cw / (2 * zoom) - psx + panRef.current.x;
      const oy = ch / (2 * zoom) - psy + panRef.current.y;

      for (let y = 0; y < MAP_SIZE; y++) {
        for (let x = 0; x < MAP_SIZE; x++) {
          drawTile(map.tiles[y][x], x, y, ox, oy);
        }
      }

      if (clickTargetRef.current) {
        const { sx: tsx, sy: tsy } = isoProject(clickTargetRef.current.x, clickTargetRef.current.y);
        const pulse = 1 + Math.sin(now / 200) * 0.15;
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(tsx + ox, tsy + oy, 14 * pulse, 7 * pulse, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.fill();
      }

      type Drawable =
        | { kind: "prop"; type: string; x: number; y: number; label?: string; emoji?: string }
        | { kind: "portal"; portal: Portal }
        | { kind: "monster"; monster: MonsterInstance }
        | { kind: "player"; player: { name: string; color: string; x: number; y: number } };
      const drawables: Drawable[] = [];
      for (const p of map.props) drawables.push({ kind: "prop", ...p });
      for (const p of currentMapRef.current.places)
        drawables.push({ kind: "prop", type: p.sprite, x: p.x, y: p.y, label: p.name, emoji: p.emoji });
      for (const p of currentMapRef.current.portals) drawables.push({ kind: "portal", portal: p });
      for (const m of monstersRef.current) drawables.push({ kind: "monster", monster: m });
      // Dungeons are per-player: only the local player is visible there.
      if (
        currentMapRef.current.id !== "dungeon" &&
        currentMapRef.current.id !== "forest-dungeon" &&
        currentMapRef.current.id !== "desert-dungeon"
      ) {
        for (const r of remotes.values()) drawables.push({ kind: "player", player: r });
      }
      // Spectator camera: don't render a local "me" sprite. WASD/click still
      // moves the camera-anchored `me` object, but it stays invisible.
      if (!isSpectator) drawables.push({ kind: "player", player: me });
      const sortKey = (d: Drawable) =>
        d.kind === "prop"
          ? d.x + d.y
          : d.kind === "portal"
            ? d.portal.x + d.portal.y
            : d.kind === "monster"
              ? d.monster.x + d.monster.y
              : d.player.x + d.player.y;
      drawables.sort((a, b) => sortKey(a) - sortKey(b));
      for (const d of drawables) {
        if (d.kind === "prop") drawProp(d.type, d.x, d.y, ox, oy, d.label, d.emoji);
        else if (d.kind === "portal") drawPortal(d.portal, ox, oy, now);
        else if (d.kind === "monster") drawMonster(d.monster, ox, oy, now);
        else {
          const isMe = d.player === (me as any);
          let moving = false;
          if (isMe) moving = now < meMovingUntil;
          else {
            const r: any = d.player;
            moving = r.lastMoveAt && now - r.lastMoveAt < 200;
          }
          drawPlayer(d.player, ox, oy, moving, now);
        }
      }

      // Night-vision overlay: dark fog of war with a soft circle of sight
      // around the local player. Reset transform to draw in screen space.
      if (currentMapRef.current.nightVision) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const cssW = canvas.width / dpr;
        const cssH = canvas.height / dpr;
        const { sx: mpsx, sy: mpsy } = isoProject(me.x, me.y);
        const screenX = (mpsx + ox) * zoom;
        const screenY = (mpsy + oy - 16) * zoom;
        const radius = Math.max(140, 220 * zoom);
        const fog = ctx.createRadialGradient(
          screenX, screenY, radius * 0.25,
          screenX, screenY, radius,
        );
        const isDungeon = currentMapRef.current.id === "forest-dungeon";
        fog.addColorStop(0, "rgba(0,0,0,0)");
        fog.addColorStop(0.6, isDungeon ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.45)");
        fog.addColorStop(1, isDungeon ? "rgba(0,0,0,0.95)" : "rgba(0,0,0,0.85)");
        ctx.fillStyle = fog;
        ctx.fillRect(0, 0, cssW, cssH);
        // Subtle warm torch glow at the center.
        const glow = ctx.createRadialGradient(
          screenX, screenY, 0,
          screenX, screenY, radius * 0.5,
        );
        glow.addColorStop(0, "rgba(255,190,110,0.18)");
        glow.addColorStop(1, "rgba(255,190,110,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, cssW, cssH);
      }

      // Sandstorm overlay for Golden Desert: warm haze + streaking sand particles.
      if (currentMapRef.current.id === "desert") {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const cssW = canvas.width / dpr;
        const cssH = canvas.height / dpr;
        // Pulsing storm intensity (0.55 - 1.0)
        const intensity = 0.78 + Math.sin(now / 1700) * 0.18;
        // Warm haze tint
        ctx.fillStyle = `rgba(232,170,70,${0.18 * intensity})`;
        ctx.fillRect(0, 0, cssW, cssH);
        // Particles
        ensureSandParticles(cssW, cssH);
        ctx.save();
        for (const p of sandParticles) {
          p.x += p.vx * dt;
          p.y += p.vy * dt + Math.sin((now + p.x) / 220) * 0.6;
          if (p.x > cssW + 20) {
            p.x = -20;
            p.y = Math.random() * cssH;
          }
          if (p.y > cssH + 20) p.y = -20;
          ctx.globalAlpha = p.a * intensity;
          ctx.fillStyle = "#f5d27a";
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, p.r * 2.2, p.r * 0.8, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        // Subtle vignette darkening edges
        const vg = ctx.createRadialGradient(cssW / 2, cssH / 2, Math.min(cssW, cssH) * 0.35, cssW / 2, cssH / 2, Math.max(cssW, cssH) * 0.75);
        vg.addColorStop(0, "rgba(120,70,20,0)");
        vg.addColorStop(1, `rgba(120,70,20,${0.35 * intensity})`);
        ctx.fillStyle = vg;
        ctx.fillRect(0, 0, cssW, cssH);
      }

      // Seasonal world effect overlay (applies on every map so the season is
      // visible everywhere). Cheap fill tint + drifting particles.
      {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const cssW = canvas.width / dpr;
        const cssH = canvas.height / dpr;
        const { season } = getCurrentSeason();
        // Re-spawn world boss when season changes while standing in town.
        if (lastSeasonId !== null && lastSeasonId !== season.id) {
          if (currentMapRef.current.id === "town") {
            bossSeenRef.current = false;
            spawnMonstersForMap("town");
          }
        }
        lastSeasonId = season.id;

        // Color tint per season.
        const tints: Record<string, string> = {
          spring: "rgba(255,180,210,0.10)",
          summer: "rgba(255,170,80,0.10)",
          autumn: "rgba(220,110,40,0.12)",
          winter: "rgba(170,200,255,0.16)",
        };
        ctx.fillStyle = tints[season.id];
        ctx.fillRect(0, 0, cssW, cssH);

        if (season.id === "summer") {
          // Heat haze: subtle horizontal warping bands.
          const bandCount = 6;
          for (let i = 0; i < bandCount; i++) {
            const y = ((now / 60 + i * 80) % (cssH + 80)) - 40;
            const grad = ctx.createLinearGradient(0, y, 0, y + 60);
            grad.addColorStop(0, "rgba(255,220,140,0)");
            grad.addColorStop(0.5, "rgba(255,220,140,0.07)");
            grad.addColorStop(1, "rgba(255,220,140,0)");
            ctx.fillStyle = grad;
            ctx.fillRect(0, y, cssW, 60);
          }
        } else {
          ensureSeasonParticles(cssW, cssH, season.id);
          ctx.save();
          for (const p of seasonParticles) {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.rot += p.vrot * dt;
            if (p.y > cssH + 12) {
              p.y = -12;
              p.x = Math.random() * cssW;
            }
            if (p.x > cssW + 12) p.x = -12;
            if (p.x < -12) p.x = cssW + 12;
            ctx.globalAlpha = p.a;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            if (season.id === "spring") {
              // Cherry-blossom petal: pink rounded shape.
              ctx.fillStyle = "#ffb3d1";
              ctx.beginPath();
              ctx.ellipse(0, 0, p.r * 1.4, p.r * 0.7, 0, 0, Math.PI * 2);
              ctx.fill();
            } else if (season.id === "autumn") {
              // Falling leaf: warm amber diamond.
              ctx.fillStyle = ["#e07a2c", "#c4521b", "#d99a3a"][Math.floor(p.r) % 3];
              ctx.beginPath();
              ctx.moveTo(0, -p.r);
              ctx.lineTo(p.r * 0.9, 0);
              ctx.lineTo(0, p.r);
              ctx.lineTo(-p.r * 0.9, 0);
              ctx.closePath();
              ctx.fill();
            } else {
              // Snowflake: white round.
              ctx.fillStyle = "#ffffff";
              ctx.beginPath();
              ctx.arc(0, 0, p.r * 0.8, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();
          }
          ctx.restore();
        }

        // Winter vignette — slightly cool the edges.
        if (season.id === "winter") {
          const vg2 = ctx.createRadialGradient(
            cssW / 2,
            cssH / 2,
            Math.min(cssW, cssH) * 0.4,
            cssW / 2,
            cssH / 2,
            Math.max(cssW, cssH) * 0.8,
          );
          vg2.addColorStop(0, "rgba(180,210,255,0)");
          vg2.addColorStop(1, "rgba(120,150,210,0.35)");
          ctx.fillStyle = vg2;
          ctx.fillRect(0, 0, cssW, cssH);
        }

        // Fear effect: low-level players (< 5) sense the seasonal world boss
        // nearby. Pulsing red vignette + alert above the inventory bar.
        const SEASONAL_BOSS_IDS = new Set([
          "world_tree_guardian",
          "leviathan",
          "harvest_titan",
          "frost_dragon",
        ]);
        let fearNow = false;
        if (!isSpectator && levelRef.current < 5) {
          for (const mon of monstersRef.current) {
            if (!mon.isBoss) continue;
            if (!SEASONAL_BOSS_IDS.has(mon.defId)) continue;
            const d = Math.hypot(mon.x - me.x, mon.y - me.y);
            if (d < 18) {
              fearNow = true;
              break;
            }
          }
        }
        if (fearNow !== fearActiveRef.current) {
          fearActiveRef.current = fearNow;
          setFearActive(fearNow);
        }
        if (fearNow) {
          const pulse = 0.55 + Math.sin(now / 280) * 0.2;
          const rv = ctx.createRadialGradient(
            cssW / 2,
            cssH / 2,
            Math.min(cssW, cssH) * 0.2,
            cssW / 2,
            cssH / 2,
            Math.max(cssW, cssH) * 0.75,
          );
          rv.addColorStop(0, "rgba(180,0,0,0)");
          rv.addColorStop(0.55, `rgba(220,20,20,${0.18 * pulse})`);
          rv.addColorStop(1, `rgba(160,0,0,${0.7 * pulse})`);
          ctx.fillStyle = rv;
          ctx.fillRect(0, 0, cssW, cssH);
        }
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", resize);
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [myId]);

  // Hotkeys: E interact, Escape close, Tab inventory, 1-6 quick-use, Enter chat
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (isSpectator) {
        if (e.key === "Escape") {
          setOpenPlace(null);
          setPortalOpen(false);
          setInvOpen(false);
        }
        return;
      }
      if (e.key.toLowerCase() === "e" && nearbyPortal && !portalOpen && !openPlace) {
        setPortalOpen(true);
      } else if (e.key.toLowerCase() === "e" && nearby && !openPlace) {
        setOpenPlace(nearby);
      } else if (e.key === "Escape") {
        setOpenPlace(null);
        setPortalOpen(false);
        setInvOpen(false);
      } else if (e.key === "Tab") {
        e.preventDefault();
        setInvOpen((v) => !v);
      } else if (/^[1-6]$/.test(e.key)) {
        useInventorySlot(parseInt(e.key, 10) - 1);
      } else if (e.key === "Enter" && !openPlace) {
        const el = document.getElementById("chat-input") as HTMLInputElement | null;
        setChatMinimized(false);
        el?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nearby, nearbyPortal, openPlace, portalOpen, inventoryBySlot]);

  const sendChat = () => {
    const text = chatInput.trim();
    if (!text || !channelRef.current || !meRef.current) return;
    const msg: ChatMessage = {
      id: meRef.current.id,
      name: playerName,
      color: meRef.current.color,
      text: text.slice(0, 140),
      ts: Date.now(),
    };
    channelRef.current.send({ type: "broadcast", event: "chat", payload: msg });
    setChat((prev) => [...prev.slice(-49), msg]);
    setChatInput("");
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-sky-300">
      <canvas
        ref={canvasRef}
        className={drunk ? `drunk-shake drunk-shake-${drunk.intensity} block h-full w-full touch-none` : "block h-full w-full touch-none"}
        style={drunk ? { animationDuration: `${drunk.durationMs}ms` } : undefined}
        onAnimationEnd={() => setDrunk(null)}
      />

      <ZoomControls
        zoom={zoomDisplay}
        onZoomIn={() => {
          zoomRef.current = Math.min(2.5, zoomRef.current * 1.25);
          setZoomDisplay(zoomRef.current);
        }}
        onZoomOut={() => {
          zoomRef.current = Math.max(0.5, zoomRef.current / 1.25);
          setZoomDisplay(zoomRef.current);
        }}
        onRecenter={() => {
          panRef.current.x = 0;
          panRef.current.y = 0;
        }}
      />

      <div className="hidden sm:block">
        <SeasonBadge />
      </div>

      <button
        type="button"
        onClick={() => setMusicMuted((v) => !v)}
        title={musicMuted ? "Unmute music" : "Mute music"}
        aria-label={musicMuted ? "Unmute music" : "Mute music"}
        className="pointer-events-auto absolute right-4 top-[10.5rem] z-20 flex h-9 w-9 items-center justify-center rounded-xl bg-black/60 text-base text-white shadow-lg backdrop-blur transition hover:bg-black/75"
      >
        {musicMuted ? "🔇" : "🎵"}
      </button>

      <div
        className={`pointer-events-none absolute left-2 top-2 flex flex-col gap-2 sm:left-4 sm:top-4 sm:gap-3 ${
          isSpectator ? "w-[15rem] sm:w-64" : "w-[15rem] sm:w-64"
        }`}
      >
        <div className="flex items-start gap-2">
          <div className={`min-w-0 rounded-xl bg-black/60 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur sm:flex-1 sm:px-4 sm:py-2 sm:text-sm ${isSpectator ? "" : "flex-1"}`}>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-400" />
            <span className="truncate">{playerCount} player{playerCount === 1 ? "" : "s"} online</span>
          </div>
          {isSpectator ? (
            <div className="mt-1 text-[10px] font-normal text-white/70 sm:text-xs">
              👁️ <span className="font-semibold text-white">Spectator</span>
              <span className="hidden sm:inline"> · WASD / Click tile · Drag to pan</span>
            </div>
          ) : (
            <div className="mt-1 truncate text-[10px] font-normal text-white/70 sm:text-xs">
              You: <span className="font-semibold text-white">{profile.name}</span>
              <span className="hidden sm:inline"> · WASD / Click tile · Drag to pan</span>
            </div>
          )}
          </div>
          {isSpectator && (
            <button
              onClick={() => onExitSpectator?.()}
              className="pointer-events-auto shrink-0 rounded-xl bg-orange-500 px-3 py-2 text-xs font-extrabold text-white shadow-lg transition hover:bg-orange-600 sm:hidden"
            >
              ⚔️ Sign in
            </button>
          )}
        </div>

        {/* Compact season badge under the player-online card on mobile */}
        <div className="sm:hidden">
          <SeasonBadge compact />
        </div>

        {!isSpectator && (
          <>
            <PlayerProfileCard
              profile={profile}
              gold={gold}
              xp={player.xp}
              hp={hp}
              maxHp={MAX_HP}
              energy={energy}
              maxEnergy={maxEnergy}
              baseDamage={damageFor(level, player.base_damage)}
              baseDefense={defenseFor(level, player.base_defense)}
              bonusAttack={bonusAttack}
              bonusDefense={bonusDefense}
              customAvatarUrl={player.custom_avatar_url ?? null}
              statsOpen={statsOpen}
              onEdit={() => setEditOpen(true)}
              onToggleStats={() => setStatsOpen((v) => !v)}
            />
            <button
              onClick={() => setLeaderboardOpen(true)}
              className="pointer-events-auto rounded-xl bg-black/60 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur hover:bg-black/70 flex items-center justify-center gap-2 sm:py-2 sm:text-sm"
            >
              <span>🏆</span> Leaderboard
            </button>
          </>
        )}
      </div>

      <ChatPanel
        chat={chat}
        chatInput={chatInput}
        setChatInput={setChatInput}
        minimized={chatMinimized}
        setMinimized={setChatMinimized}
        onFocus={() => setChatFocused(true)}
        onBlur={() => setChatFocused(false)}
        onSend={sendChat}
        readOnly={isSpectator}
      />

      {!isSpectator && <InventoryHotbar
        inventoryBySlot={inventoryBySlot}
        dragId={dragId}
        onDragStart={(id) => setDragId(id)}
        onDrop={(slotIndex) => {
          if (dragId) placeAt(dragId, "inventory", slotIndex);
          setDragId(null);
        }}
        onDragEnd={() => setDragId(null)}
        onUseSlot={useInventorySlot}
        onOpenInventory={() => setInvOpen(true)}
      />}

      {!isSpectator && fearActive && (
        <div className="pointer-events-none absolute bottom-32 left-1/2 z-30 -translate-x-1/2 sm:bottom-36">
          <div className="flex items-center gap-2 rounded-xl border border-red-400/60 bg-red-900/80 px-4 py-2 text-sm font-bold text-red-50 shadow-2xl ring-2 ring-red-500/40 backdrop-blur animate-pulse">
            <span className="text-lg">😱</span>
            <span>You are <span className="text-red-200">trembling with fear</span> — a Seasonal Monster is near! (Level up to 5 to resist)</span>
          </div>
        </div>
      )}

      {toast && (
        <div className="pointer-events-none absolute bottom-24 left-1/2 -translate-x-1/2 rounded-full bg-black/80 px-4 py-2 text-sm font-semibold text-white shadow-lg">
          {toast.text}
        </div>
      )}

      {!isSpectator && invOpen && (
        <InventoryModal
          inventoryBySlot={inventoryBySlot}
          wear={wear}
          dragId={dragId}
          onDragStart={(id) => setDragId(id)}
          onDropInventory={(slotIndex) => {
            if (dragId) placeAt(dragId, "inventory", slotIndex);
            setDragId(null);
          }}
          onDropWear={(wearIndex) => {
            if (dragId) placeAt(dragId, "wear", wearIndex);
            setDragId(null);
          }}
          onDragEnd={() => setDragId(null)}
          onUseItem={useItemById}
          onDiscardItem={discardItemById}
          onClose={() => setInvOpen(false)}
        />
      )}

      {!isSpectator && nearby && !openPlace && (
        <button
          type="button"
          onClick={() => setOpenPlace(nearby)}
          className="pointer-events-auto absolute bottom-24 left-4 z-20 rounded-full bg-black/70 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur transition hover:bg-black/85 active:scale-95 sm:bottom-auto sm:left-1/2 sm:top-6 sm:-translate-x-1/2"
        >
          {nearby.emoji} {nearby.name}
          <span className="hidden sm:inline">
            {" "}— Press{" "}
            <kbd className="rounded bg-white/20 px-1.5 py-0.5 font-mono text-xs">E</kbd> to interact
          </span>
          <span className="ml-2 sm:hidden">— Tap to interact</span>
        </button>
      )}

      {!isSpectator && nearbyPortal && !nearby && !portalOpen && !openPlace && (
        <button
          type="button"
          onClick={() => setPortalOpen(true)}
          className="pointer-events-auto absolute bottom-24 left-4 z-20 rounded-full bg-purple-700/80 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur transition hover:bg-purple-700 active:scale-95 sm:bottom-auto sm:left-1/2 sm:top-6 sm:-translate-x-1/2"
        >
          🌀 Portal
          <span className="hidden sm:inline">
            {" "}— Press{" "}
            <kbd className="rounded bg-white/20 px-1.5 py-0.5 font-mono text-xs">E</kbd> to travel
          </span>
          <span className="ml-2 sm:hidden">— Tap to travel</span>
        </button>
      )}

      {!isSpectator && portalOpen && (
        <PortalModal
          currentMapId={currentMapId}
          level={level}
          onTravel={(id) => {
            setCurrentMapId(id);
            setPortalOpen(false);
          }}
          onClose={() => setPortalOpen(false)}
        />
      )}

      {!isSpectator && openPlace && (
        <PlaceModal
          place={openPlace}
          cooldown={
            openPlace.id === "dungeon-entrance" ||
            openPlace.id === "forest-dungeon-entrance" ||
            openPlace.id === "desert-pyramid-entrance"
              ? (() => {
                  const total = 60 * 60 * 1000;
                  const mapKey =
                    openPlace.id === "forest-dungeon-entrance"
                      ? "forest-dungeon"
                      : openPlace.id === "desert-pyramid-entrance"
                        ? "desert-dungeon"
                        : "dungeon";
                  const byMap = (player.last_boss_at_by_map ?? {}) as Record<string, string>;
                  const lastIso = byMap[mapKey];
                  const last = lastIso ? new Date(lastIso).getTime() : 0;
                  const remaining = last ? Math.max(0, total - (Date.now() - last)) : 0;
                  return { label: "👹 Boss respawn", remainingMs: remaining, totalMs: total, blocking: false };
                })()
              : openPlace.id === "fountain"
                ? (() => {
                    const total = 5 * 60 * 1000;
                    const lastIso = (player as any).last_fountain_at as string | null;
                    const last = lastIso ? new Date(lastIso).getTime() : 0;
                    const remaining = last ? Math.max(0, total - (Date.now() - last)) : 0;
                    return { label: "⛲ Next wish", remainingMs: remaining, totalMs: total };
                  })()
                : openPlace.id === "farm"
                  ? (() => {
                      const total = 5 * 60 * 1000;
                      const lastIso = (player as any).last_farm_at as string | null;
                      const last = lastIso ? new Date(lastIso).getTime() : 0;
                      const remaining = last ? Math.max(0, total - (Date.now() - last)) : 0;
                      return { label: "🌾 Next harvest", remainingMs: remaining, totalMs: total };
                    })()
                  : null
          }
          onAction={async () => {
            const p = openPlace;
            // Special-case: realm exchange opens its own multi-action modal.
            if (p.id === "realm-exchange") {
              setOpenPlace(null);
              setRealmOpen(true);
              return;
            }
            if (p.id === "blacksmith") {
              setOpenPlace(null);
              setBlacksmithOpen(true);
              return;
            }
            if (p.id === "wizard-tower") {
              setOpenPlace(null);
              setWizardOpen(true);
              return;
            }
            if (p.id === "market") {
              setOpenPlace(null);
              setMarketOpen(true);
              return;
            }
            if (p.id === "tavern") {
              setOpenPlace(null);
              setTavernOpen(true);
              return;
            }
            if (p.id === "fountain") {
              try {
                const res = await fountain.mutateAsync();
                showToast(`The fountain grants +${res.reward} gold`);
              } catch (e: any) {
                showToast(e?.message ?? "Fountain on cooldown");
              }
              setOpenPlace(null);
              return;
            }
            if (p.id === "farm") {
              try {
                const res = await farm.mutateAsync();
                showToast(`Harvested crops (+${res.reward} gold)`);
              } catch (e: any) {
                showToast(e?.message ?? "Farm on cooldown");
              }
              setOpenPlace(null);
              return;
            }
            // Gold guard — refuse any place whose action costs more than we have.
            if (p.cost && gold < p.cost) {
              showToast(`Not enough gold (need ${p.cost})`);
              setOpenPlace(null);
              return;
            }
            // Special-case: dungeon entry requires energy.
            if (
              p.transitionTo === "dungeon" ||
              p.transitionTo === "forest-dungeon" ||
              p.transitionTo === "desert-dungeon"
            ) {
              try {
                await spendEnergy.mutateAsync(1);
              } catch (e: any) {
                showToast(e?.message ?? "Not enough energy");
                setOpenPlace(null);
                return;
              }
            }
            p.perform({
              award,
              toast: showToast,
              openStudy: () => setStudyOpen(true),
            });
            if (p.id === "church") {
              setHp(MAX_HP);
              hpRef.current = MAX_HP;
            }
            if (p.id === "druid-grove") {
              setHp(MAX_HP);
              hpRef.current = MAX_HP;
            }
            if (p.transitionTo) {
              setCurrentMapId(p.transitionTo);
            }
            setOpenPlace(null);
          }}
          onClose={() => setOpenPlace(null)}
        />
      )}

      {!isSpectator && blacksmithOpen && (
        <BlacksmithModal
          player={player}
          busy={buyItem.isPending}
          onBuy={async (defId, rarity) => {
            try {
              await buyItem.mutateAsync({ defId, rarity });
              showToast("Item forged → inventory!");
            } catch (e: any) {
              showToast(e?.message ?? "Purchase failed");
            }
          }}
          onClose={() => setBlacksmithOpen(false)}
        />
      )}

      {!isSpectator && wizardOpen && (
        <WizardTowerModal
          player={player}
          busy={buySpell.isPending}
          onBuy={async (defId, rarity) => {
            try {
              await buySpell.mutateAsync({ defId, rarity });
              showToast("Spell learned!");
            } catch (e: any) {
              showToast(e?.message ?? "Spell failed");
            }
          }}
          onClose={() => setWizardOpen(false)}
        />
      )}

      {!isSpectator && tavernOpen && (
        <TavernModal
          gold={gold}
          cooldownRemaining={beerCooldownRemaining(
            player.last_beer_at ? new Date(player.last_beer_at).getTime() : null,
          )}
          onOrder={async (b) => {
            try {
              await beer.mutateAsync(b.id);
              showToast(`Drank ${b.name} (+${b.xp} XP)`);
              setDrunk({ key: Date.now(), durationMs: b.drunkMs, intensity: b.intensity });
              setTavernOpen(false);
            } catch (e: any) {
              showToast(e?.message ?? "Order failed");
            }
          }}
          onClose={() => setTavernOpen(false)}
        />
      )}

      {!isSpectator && marketOpen && (
        <MarketModal
          player={player}
          items={items}
          busy={sellItem.isPending}
          onSell={async (id) => {
            try {
              const res = await sellItem.mutateAsync(id);
              showToast(`Sold (+${res.gold}g)`);
            } catch (e: any) {
              showToast(e?.message ?? "Sell failed");
            }
          }}
          onClose={() => setMarketOpen(false)}
        />
      )}

      {!isSpectator && bossDrop && (
        <BossDropModal
          drop={bossDrop}
          onClose={() => {
            setBossDrop(null);
          }}
        />
      )}

      {!isSpectator && realmOpen && (
        <RealmExchangeModal
          gold={gold}
          onClaim={(r) => {
            // Demo-only claim — no on-chain rewards yet, so no server award.
            showToast(
              `Claimed +${r.gold} gold, +${r.sol} SOL, +${r.usdc} USDC (demo)`,
            );
            setRealmOpen(false);
          }}
          onStakeConfirmed={(amt) => {
            showToast(`Staked ${amt} $Realm (demo)`);
            setRealmOpen(false);
          }}
          onClose={() => setRealmOpen(false)}
        />
      )}

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-sky-300/80 text-lg font-semibold text-slate-800">
          Loading world…
        </div>
      )}

      {!isSpectator && editOpen && (
        <EditProfileModal
          initial={profile}
          customAvatarUrl={player.custom_avatar_url ?? null}
          onClose={() => setEditOpen(false)}
          onSave={(p, customAvatar) => {
            setProfile(p);
            if (meRef.current) meRef.current.color = p.color;
            update.mutate({
              name: p.name,
              job: p.job,
              color: p.color,
              avatar: p.avatar,
              character_sprite: p.character_sprite as CharacterSpriteId,
              ...(customAvatar !== undefined ? { custom_avatar_url: customAvatar } : {}),
            });
            setEditOpen(false);
          }}
        />
      )}

      {!isSpectator && studyOpen && (
        <StudyModal
          lastStudyAt={player.last_study_at ? new Date(player.last_study_at).getTime() : null}
          onComplete={async () => {
            try {
              await study.mutateAsync();
              showToast("Studied tomes (+50 XP)");
            } catch (e: any) {
              showToast(e?.message ?? "Study failed");
            }
            setStudyOpen(false);
          }}
          onClose={() => setStudyOpen(false)}
        />
      )}

      {leaderboardOpen && (
        <LeaderboardModal
          myWallet={myId}
          onClose={() => setLeaderboardOpen(false)}
        />
      )}

      {isSpectator && (
        <>
          {/* Sign-in CTA — top right */}
          <div className="pointer-events-auto absolute right-20 top-4 z-20 hidden flex-col items-end gap-2 sm:flex">
            <button
              onClick={() => onExitSpectator?.()}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-extrabold text-white shadow-lg transition hover:bg-orange-600"
            >
              ⚔️ Sign in to play
            </button>
            <p className="max-w-[200px] rounded-lg bg-black/60 px-3 py-1.5 text-right text-[11px] font-medium text-white/85 shadow-lg backdrop-blur">
              Watching live. Join to earn gold, fight bosses, and level up.
            </p>
          </div>

          {/* Map icon button — bottom-right */}
          <button
            onClick={() => setMapPickerOpen(true)}
            aria-label="Travel to another map"
            className="pointer-events-auto absolute bottom-4 left-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-black/70 text-2xl shadow-lg ring-1 ring-white/15 backdrop-blur transition hover:bg-black/85 sm:h-14 sm:w-14"
          >
            🗺️
          </button>

          {/* Leaderboard button — next to map */}
          <button
            onClick={() => setLeaderboardOpen(true)}
            aria-label="Open leaderboard"
            className="pointer-events-auto absolute bottom-4 left-[4.5rem] z-20 flex h-12 w-12 items-center justify-center rounded-full bg-black/70 text-2xl shadow-lg ring-1 ring-white/15 backdrop-blur transition hover:bg-black/85 sm:bottom-[5rem] sm:left-4 sm:h-14 sm:w-14"
          >
            🏆
          </button>

          {/* Map picker modal */}
          {mapPickerOpen && (
            <div
              className="pointer-events-auto absolute inset-0 z-30 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
              onClick={() => setMapPickerOpen(false)}
            >
              <div
                className="w-full max-w-sm rounded-t-2xl bg-zinc-900/95 p-4 shadow-2xl ring-1 ring-white/10 sm:rounded-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white/80">
                    🗺️ Travel
                  </h3>
                  <button
                    onClick={() => setMapPickerOpen(false)}
                    className="rounded-md px-2 py-1 text-sm text-white/60 hover:bg-white/10 hover:text-white"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
                <ul className="flex flex-col gap-1">
                  {MAPS.filter((m) => !m.hidden).map((m) => {
                    const active = m.id === currentMapId;
                    return (
                      <li key={m.id}>
                        <button
                          onClick={() => {
                            setCurrentMapId(m.id);
                            setMapPickerOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                            active
                              ? "bg-emerald-500 text-white shadow"
                              : "text-white/85 hover:bg-white/10"
                          }`}
                        >
                          <span>{m.name}</span>
                          {active && <span className="text-xs">● Here</span>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}