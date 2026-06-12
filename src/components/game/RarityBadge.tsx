import { RARITY_META, type Rarity } from "@/game/rarity";

export function RarityBadge({ rarity, className = "" }: { rarity: Rarity; className?: string }) {
  const m = RARITY_META[rarity];
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${m.bg} ${m.border} ${m.text} ${className}`}
    >
      {m.label}
    </span>
  );
}