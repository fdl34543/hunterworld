import type { DbPlayerItem } from "@/lib/players.functions";
import { InventorySlot } from "./InventorySlot";
import { HOTBAR_SIZE } from "@/game/constants";

export function InventoryHotbar({
  inventoryBySlot,
  dragId,
  onDragStart,
  onDrop,
  onDragEnd,
  onUseSlot,
  onOpenInventory,
}: {
  inventoryBySlot: (DbPlayerItem | null)[];
  dragId: string | null;
  onDragStart: (itemId: string) => void;
  onDrop: (slotIndex: number) => void;
  onDragEnd: () => void;
  onUseSlot: (slotIndex: number) => void;
  onOpenInventory: () => void;
}) {
  return (
    <div className="pointer-events-auto absolute bottom-4 left-4 flex gap-2 rounded-xl bg-black/60 p-2 shadow-lg backdrop-blur sm:left-1/2 sm:-translate-x-1/2">
      <div className="hidden gap-2 sm:flex">
      {Array.from({ length: HOTBAR_SIZE }).map((_, i) => {
        const item = inventoryBySlot[i] ?? null;
        return (
          <InventorySlot
            key={i}
            item={item}
            variant="hotbar"
            hotbarKey={i + 1}
            dragging={!!item && dragId === item.id}
            onUse={() => onUseSlot(i)}
            onDragStart={item ? () => onDragStart(item.id) : undefined}
            onDrop={() => onDrop(i)}
            onDragEnd={onDragEnd}
          />
        );
      })}
      </div>
      <button
        onClick={onOpenInventory}
        title="Inventory (Tab)"
        className="flex h-14 w-14 flex-col items-center justify-center rounded-lg bg-white/10 text-2xl ring-1 ring-white/20 hover:bg-white/20"
      >
        🎒
        <span className="text-[9px] font-bold text-white/70 hidden sm:inline">TAB</span>
      </button>
    </div>
  );
}