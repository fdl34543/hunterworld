import { useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { DbPlayerItem } from "@/lib/players.functions";
import { RARITY_META, type Rarity } from "@/game/rarity";
import { resolveItemMeta } from "@/game/itemMeta";

type Props = {
  item: DbPlayerItem | null;
  variant: "hotbar" | "grid" | "wear";
  hotbarKey?: number;
  wearLabel?: string;
  dragging?: boolean;
  onUse?: () => void;
  onDiscard?: () => void;
  onDragStart?: () => void;
  onDrop?: () => void;
  onDragEnd?: () => void;
};

export function InventorySlot({
  item,
  variant,
  hotbarKey,
  wearLabel,
  dragging,
  onUse,
  onDiscard,
  onDragStart,
  onDrop,
  onDragEnd,
}: Props) {
  const meta = item ? resolveItemMeta(item) : null;
  const [open, setOpen] = useState(false);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasTouch = useRef(false);

  const clearTimers = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = null;
    closeTimer.current = null;
  };
  const scheduleOpen = () => {
    clearTimers();
    openTimer.current = setTimeout(() => setOpen(true), 200);
  };
  const scheduleClose = () => {
    clearTimers();
    closeTimer.current = setTimeout(() => setOpen(false), 350);
  };

  const rarityRing =
    meta && meta.rarity ? RARITY_META[meta.rarity as Rarity].ring : "ring-slate-300";

  const baseClasses =
    variant === "hotbar"
      ? `relative flex h-14 w-14 flex-col items-center justify-center rounded-lg bg-white/10 text-2xl ring-2 ${meta ? rarityRing : "ring-white/20"} transition hover:bg-white/20`
      : variant === "wear"
        ? `relative flex h-16 w-16 flex-col items-center justify-center rounded-lg bg-violet-50 p-1 ring-2 ${meta ? rarityRing : "ring-violet-200"} transition hover:ring-violet-400 ${dragging ? "opacity-40" : ""}`
        : `relative flex aspect-square flex-col items-center justify-center rounded-lg p-1 ring-2 transition ${
            (hotbarKey ?? 0) > 0
              ? `bg-amber-50 ${meta ? rarityRing : "ring-amber-300"}`
              : `bg-slate-100 ${meta ? rarityRing : "ring-slate-200"}`
          } ${dragging ? "opacity-40" : ""}`;

  return (
    <Popover open={open && !!meta} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          draggable={!!item && !!onDragStart}
          onDragStart={onDragStart}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onDrop?.();
          }}
          onDragEnd={onDragEnd}
          onMouseEnter={() => {
            if (wasTouch.current || !meta) return;
            scheduleOpen();
          }}
          onMouseLeave={() => {
            if (!wasTouch.current) scheduleClose();
          }}
          onContextMenu={(e) => {
            if (item && onDiscard) {
              e.preventDefault();
              if (confirm(`Discard ${meta?.name}? This cannot be undone.`)) onDiscard();
            }
          }}
          onTouchStart={() => {
            wasTouch.current = true;
          }}
          onClick={(e) => {
            if (!meta) return;
            if (wasTouch.current) {
              e.preventDefault();
              setOpen((v) => !v);
              return;
            }
            if (variant === "hotbar") onUse?.();
            else setOpen((v) => !v);
          }}
          className={baseClasses}
          aria-label={meta ? meta.name : wearLabel ?? "Empty slot"}
        >
          {variant === "hotbar" ? (
            <>
              <span>{meta ? meta.emoji : ""}</span>
              {hotbarKey ? (
                <span className="absolute right-1 top-0.5 text-[10px] font-bold text-white/70">
                  {hotbarKey}
                </span>
              ) : null}
            </>
          ) : meta ? (
            <>
              <span className="text-2xl">{meta.emoji}</span>
              <span className="mt-0.5 max-w-full truncate text-[9px] font-bold text-slate-700">
                {meta.name}
              </span>
              {hotbarKey ? (
                <span className="absolute right-1 top-0.5 rounded bg-slate-900 px-1 text-[9px] font-bold text-white">
                  {hotbarKey}
                </span>
              ) : null}
            </>
          ) : (
            <span className="text-[10px] text-slate-400">{wearLabel ?? "·"}</span>
          )}
        </button>
      </PopoverTrigger>
      {meta && (
        <PopoverContent
          side="top"
          align="center"
          sideOffset={8}
          className="w-64 p-3"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onMouseEnter={() => clearTimers()}
          onMouseLeave={() => scheduleClose()}
        >
          <div className="flex items-start gap-2">
            <div className="text-2xl leading-none">{meta.emoji}</div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-slate-900">{meta.name}</div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
                {meta.subtitle}
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs leading-snug text-slate-600">{meta.description}</p>
          {meta.stats && (
            <div className="mt-2 text-[11px] font-semibold text-slate-700">{meta.stats}</div>
          )}
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="text-[10px] text-slate-400">
              {hotbarKey ? `Press ${hotbarKey}` : "Right-click to discard"}
            </span>
            <div className="flex items-center gap-2">
              {onDiscard && item && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Discard ${meta.name}?`)) onDiscard();
                    setOpen(false);
                  }}
                  className="rounded-md bg-rose-100 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-200"
                >
                  Discard
                </button>
              )}
              {onUse && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUse();
                    setOpen(false);
                  }}
                  className="rounded-md bg-orange-500 px-2.5 py-1 text-xs font-bold text-white shadow hover:bg-orange-600"
                >
                  {meta.useLabel ?? "Use"}
                </button>
              )}
            </div>
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
}