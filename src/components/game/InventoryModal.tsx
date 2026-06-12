import type { DbPlayerItem } from "@/lib/players.functions";
import { InventorySlot } from "./InventorySlot";
import { INVENTORY_SIZE, HOTBAR_SIZE } from "@/game/constants";
import { WEAR_KIND_BY_INDEX } from "@/game/items";

const WEAR_SLOT_META: { label: string; emoji: string }[] = [
  { label: "weapon", emoji: "⚔️" },
  { label: "armor", emoji: "🛡" },
  { label: "head", emoji: "⛑️" },
  { label: "arm", emoji: "🥊" },
  { label: "accessory", emoji: "💍" },
];

export function InventoryModal({
  inventoryBySlot,
  wear,
  dragId,
  onDragStart,
  onDropInventory,
  onDropWear,
  onDragEnd,
  onUseItem,
  onDiscardItem,
  onClose,
}: {
  inventoryBySlot: (DbPlayerItem | null)[];
  wear: (DbPlayerItem | null)[];
  dragId: string | null;
  onDragStart: (itemId: string) => void;
  onDropInventory: (slotIndex: number) => void;
  onDropWear: (wearIndex: number) => void;
  onDragEnd: () => void;
  onUseItem: (itemId: string) => void;
  onDiscardItem: (itemId: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center mmo-overlay"
      onClick={onClose}
    >
      <div className="w-full max-w-3xl mmo-panel rounded-2xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-slate-900">
            🎒 Inventory{" "}
            <span className="ml-2 text-xs font-medium text-slate-500">
              Drag to equip · Right-click to discard
            </span>
          </h2>
          <button
            onClick={onClose}
            className="rounded-md bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-300"
          >
            Close
          </button>
        </div>
        <div className="flex gap-4">
          {/* Wear panel */}
          <div className="flex shrink-0 flex-col items-center gap-3 rounded-xl bg-violet-50 p-3">
            <div className="text-xs font-bold uppercase tracking-wider text-violet-700">
              Worn
            </div>
            <div className="flex flex-col items-center gap-2">
              {WEAR_KIND_BY_INDEX.map((kind, idx) => {
                const it = wear[idx] ?? null;
                const m = WEAR_SLOT_META[idx];
                return (
                  <div key={kind} className="flex flex-col items-center">
                    <div className="text-[10px] font-semibold text-slate-500">
                      {m.emoji} {m.label}
                    </div>
                    <InventorySlot
                      item={it}
                      variant="wear"
                      wearLabel={m.label}
                      dragging={!!it && dragId === it.id}
                      onUse={it ? () => onUseItem(it.id) : undefined}
                      onDiscard={it ? () => onDiscardItem(it.id) : undefined}
                      onDragStart={it ? () => onDragStart(it.id) : undefined}
                      onDrop={() => onDropWear(idx)}
                      onDragEnd={onDragEnd}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          {/* Inventory grid */}
          <div className="flex-1">
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: INVENTORY_SIZE }).map((_, i) => {
                const it = inventoryBySlot[i] ?? null;
                return (
                  <InventorySlot
                    key={i}
                    item={it}
                    variant="grid"
                    hotbarKey={i < HOTBAR_SIZE ? i + 1 : undefined}
                    dragging={!!it && dragId === it.id}
                    onUse={it ? () => onUseItem(it.id) : undefined}
                    onDiscard={it ? () => onDiscardItem(it.id) : undefined}
                    onDragStart={it ? () => onDragStart(it.id) : undefined}
                    onDrop={() => onDropInventory(i)}
                    onDragEnd={onDragEnd}
                  />
                );
              })}
            </div>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-slate-500">
          Drag a weapon/armor to the worn panel to equip · Press 1–6 to quick-use top row · Tab to toggle
        </p>
      </div>
    </div>
  );
}