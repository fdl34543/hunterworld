import type { Profile } from "@/game/types";
import { xpProgress } from "@/lib/xp";

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
  const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const ePct = Math.max(0, Math.min(100, (energy / Math.max(1, maxEnergy)) * 100));
  const xpInfo = xpProgress(xp);
  const totalAtk = baseDamage + bonusAttack;
  const totalDef = baseDefense + bonusDefense;
  return (
    <div className="pointer-events-auto rounded-xl bg-black/60 p-3 text-white shadow-lg backdrop-blur">
      <div className="flex items-center gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full text-2xl shadow-inner ring-2 ring-white/20 animate-voxel-idle"
          style={{ background: profile.color }}
        >
          {customAvatarUrl ? (
            <img src={customAvatarUrl} alt="avatar" className="h-full w-full object-cover" />
          ) : (
            profile.avatar
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold">{profile.name}</div>
          <div className="text-[11px] text-white/70">
            Lv {xpInfo.level} · {profile.job}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <button
            onClick={onEdit}
            className="rounded-md bg-white/10 px-2 py-1 text-[11px] font-semibold hover:bg-white/20"
          >
            Edit
          </button>
          <button
            onClick={onToggleStats}
            className="rounded-md bg-white/10 px-2 py-1 text-[11px] font-semibold hover:bg-white/20"
          >
            {statsOpen ? "Hide" : "Stats"}
          </button>
        </div>
      </div>
      <div className="mt-2">
        <div className="flex items-center justify-between text-[10px] font-semibold text-white/70">
          <span>❤ HP</span>
          <span>
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
      <div className="mt-1.5">
        <div className="flex items-center justify-between text-[10px] font-semibold text-white/70">
          <span>⚡ Energy</span>
          <span>{energy} / {maxEnergy}</span>
        </div>
        <div className="mt-0.5 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all"
            style={{ width: `${ePct}%` }}
          />
        </div>
      </div>
      <div className="mt-1.5">
        <div className="flex items-center justify-between text-[10px] font-semibold text-white/70">
          <span>⭐ XP</span>
          <span>
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
      {statsOpen && (
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
          <div className="rounded-md bg-white/10 py-1">
            <div className="text-amber-300">💰 {gold}</div>
            <div className="text-white/60">Gold</div>
          </div>
          <div className="rounded-md bg-white/10 py-1">
            <div className="text-sky-300">⭐ {xpInfo.level}</div>
            <div className="text-white/60">Level</div>
          </div>
          <div className="rounded-md bg-white/10 py-1">
            <div className="text-rose-300">
              🗡 {totalAtk}
              {bonusAttack > 0 && <span className="ml-1 text-[9px] text-rose-200">+{bonusAttack}</span>}
            </div>
            <div className="text-white/60">DMG</div>
          </div>
          <div className="rounded-md bg-white/10 py-1">
            <div className="text-emerald-300">
              🛡 {totalDef}
              {bonusDefense > 0 && <span className="ml-1 text-[9px] text-emerald-200">+{bonusDefense}</span>}
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