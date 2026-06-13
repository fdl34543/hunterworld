import type { Profile } from "@/game/types";
import { xpProgress } from "@/lib/xp";
import { useState } from "react";

export function PlayerProfileCard({
  profile,
  gold,
  xp,
  hp,
  maxHp,
  energy,
  maxEnergy,
  baseDamage,
  baseDefense,
  bonusAttack = 0,
  bonusDefense = 0,
  customAvatarUrl,
  statsOpen,
  onEdit,
  onToggleStats,
}: {
  profile: Profile;
  gold: number;
  xp: number;
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  baseDamage: number;
  baseDefense: number;
  bonusAttack?: number;
  bonusDefense?: number;
  customAvatarUrl?: string | null;
  statsOpen: boolean;
  onEdit: () => void;
  onToggleStats: () => void;
}) {
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const ePct = Math.max(0, Math.min(100, (energy / Math.max(1, maxEnergy)) * 100));
  const xpInfo = xpProgress(xp);
  const totalAtk = baseDamage + bonusAttack;
  const totalDef = baseDefense + bonusDefense;
  return (
    <div className="pointer-events-auto rounded-xl bg-black/60 p-2 text-white shadow-lg backdrop-blur sm:p-3">
      <div className="flex items-center gap-2 sm:gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-xl shadow-inner ring-2 ring-white/20 animate-voxel-idle sm:h-12 sm:w-12 sm:text-2xl"
          style={{ background: profile.color }}
        >
          {customAvatarUrl ? (
            <img src={customAvatarUrl} alt="avatar" className="h-full w-full object-cover" />
          ) : (
            profile.avatar
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-bold sm:text-sm">{profile.name}</div>
          <div className="text-[10px] text-white/70 sm:text-[11px]">
            Lv {xpInfo.level} · {profile.job}
          </div>
        </div>
        <div className="hidden shrink-0 flex-col gap-1 sm:flex">
          <button
            onClick={onEdit}
            className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold hover:bg-white/20 sm:px-2 sm:py-1 sm:text-[11px]"
          >
            Edit
          </button>
          <button
            onClick={onToggleStats}
            className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold hover:bg-white/20 sm:px-2 sm:py-1 sm:text-[11px]"
          >
            {statsOpen ? "Hide" : "Stats"}
          </button>
        </div>
        <button
          onClick={() => setMobileExpanded((v) => !v)}
          className="shrink-0 rounded-md bg-white/10 px-2 py-1 text-[10px] font-semibold hover:bg-white/20 sm:hidden"
        >
          {mobileExpanded ? "Hide" : "Show all"}
        </button>
      </div>
      <div className="mt-2">
        <div className="flex items-center justify-between text-[10px] font-semibold text-white/70">
          <span>❤ HP</span>
          <span className="tabular-nums">
            {Math.ceil(hp)} / {maxHp}
          </span>
        </div>
        <div className="mt-0.5 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-rose-400 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className={`mt-1.5 ${mobileExpanded ? "" : "hidden sm:block"}`}>
        <div className="flex items-center justify-between text-[10px] font-semibold text-white/70">
          <span>⚡ Energy</span>
          <span className="tabular-nums">{energy} / {maxEnergy}</span>
        </div>
        <div className="mt-0.5 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all"
            style={{ width: `${ePct}%` }}
          />
        </div>
      </div>
      <div className={`mt-1.5 ${mobileExpanded ? "" : "hidden sm:block"}`}>
        <div className="flex items-center justify-between text-[10px] font-semibold text-white/70">
          <span>⭐ XP</span>
          <span className="tabular-nums">
            {xpInfo.into} / {xpInfo.span || "max"}
          </span>
        </div>
        <div className="mt-0.5 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-sky-400 to-violet-400 transition-all"
            style={{ width: `${xpInfo.pct}%` }}
          />
        </div>
      </div>
      {mobileExpanded && (
        <div className="mt-2 flex gap-1 sm:hidden">
          <button
            onClick={onEdit}
            className="flex-1 rounded-md bg-white/10 px-2 py-1 text-[10px] font-semibold hover:bg-white/20"
          >
            Edit
          </button>
          <button
            onClick={onToggleStats}
            className="flex-1 rounded-md bg-white/10 px-2 py-1 text-[10px] font-semibold hover:bg-white/20"
          >
            {statsOpen ? "Hide stats" : "Stats"}
          </button>
        </div>
      )}
      {statsOpen && (
        <div className="mt-2 grid grid-cols-3 gap-1 text-center text-[10px] sm:mt-3 sm:gap-2 sm:text-[11px]">
          <div className="rounded-md bg-white/10 py-1">
            <div className="truncate text-amber-300 tabular-nums">💰 {gold}</div>
            <div className="text-white/60">Gold</div>
          </div>
          <div className="rounded-md bg-white/10 py-1">
            <div className="text-sky-300 tabular-nums">⭐ {xpInfo.level}</div>
            <div className="text-white/60">Level</div>
          </div>
          <div className="rounded-md bg-white/10 py-1">
            <div className="text-rose-300 tabular-nums">
              🗡 {totalAtk}
              {bonusAttack > 0 && <span className="ml-0.5 text-[9px] text-rose-200">+{bonusAttack}</span>}
            </div>
            <div className="text-white/60">DMG</div>
          </div>
          <div className="col-span-1 rounded-md bg-white/10 py-1">
            <div className="text-emerald-300 tabular-nums">
              🛡 {totalDef}
              {bonusDefense > 0 && <span className="ml-0.5 text-[9px] text-emerald-200">+{bonusDefense}</span>}
            </div>
            <div className="text-white/60">DEF</div>
          </div>
          <div className="col-span-2 rounded-md bg-white/10 py-1">
            <div className="text-white">{profile.job}</div>
            <div className="text-white/60">Class</div>
          </div>
        </div>
      )}
    </div>
  );
}