import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import bgImage from "@/assets/map-town.jpg";

export const Route = createFileRoute("/how-to-play")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "How to Play — Hunter World" },
      { name: "description", content: "Learn how to play Hunter World: connect your wallet, choose a hero, explore the realm, hunt monsters and earn seasonal rewards." },
      { property: "og:title", content: "How to Play — Hunter World" },
      { property: "og:description", content: "Step-by-step guide to begin your adventure in Hunter World." },
    ],
  }),
  component: HowToPlayPage,
});

const STEPS: { title: string; body: string; icon: string }[] = [
  { icon: "🪙", title: "1. Connect your wallet", body: "Use Phantom, Solflare, or Backpack to sign in. No gas required — just a quick signature to prove ownership." },
  { icon: "🧙", title: "2. Create your hero", body: "Pick from 10+ character classes — Warrior, Mage, Archer, Rogue, Healer and more. Choose a name, color and avatar." },
  { icon: "🗺️", title: "3. Explore the realm", body: "Walk through Hunter World, dungeons, forests, deserts and beaches. Each map has its own monsters, bosses and secrets." },
  { icon: "⚔️", title: "4. Hunt monsters", body: "Engage enemies in real-time isometric combat. Defeat them to collect XP, gold, materials and rare monster cards." },
  { icon: "🎒", title: "5. Manage inventory", body: "Equip weapons and armor, use consumables, and trade items at the market. Better gear unlocks tougher zones." },
  { icon: "🏆", title: "6. Compete & earn", body: "Climb the leaderboard, raid seasonal world bosses, and earn seasonal collectibles that disappear when the season ends." },
];

function HowToPlayPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden mmo-overlay">
      {/* Fixed background */}
      <div className="fixed inset-0">
        <img src={bgImage} alt="" aria-hidden className="fixed inset-0 h-full w-full object-cover" />
        <div className="fixed inset-0 bg-black/75" />
      </div>

      {/* Sticky navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <SiteNav />
      </div>

      {/* Scrollable content */}
      <div className="mmo-scroll relative z-10 h-screen overflow-y-auto pt-14">
        <main className="mx-auto max-w-5xl px-4 py-8 lg:py-12">
          <header className="mb-8 text-center">
            <div className="text-[11px] font-bold uppercase tracking-[0.4em] text-orange-400">
              ⚔ Adventurer's Guide ⚔
            </div>
            <h1 className="mt-2 bg-gradient-to-r from-amber-200 via-orange-400 to-amber-200 bg-clip-text text-4xl font-black tracking-tight text-transparent drop-shadow lg:text-5xl">
              How to Play
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-white/80 lg:text-base">
              Six steps from new arrival to legendary adventurer. Progression in Hunter World is earned through play — not paid.
            </p>
          </header>

          <ol className="grid gap-4 md:grid-cols-2">
            {STEPS.map((s) => (
              <li key={s.title} className="mmo-panel rounded-2xl p-5">
                <div className="mb-2 flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 text-xl shadow ring-2 ring-amber-300/40">
                    {s.icon}
                  </span>
                  <h2 className="text-lg font-extrabold tracking-tight text-slate-900">{s.title}</h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-700">{s.body}</p>
              </li>
            ))}
          </ol>

          <div className="mt-10 text-center">
            <a
              href="/"
              className="inline-block rounded-lg bg-orange-500 px-6 py-3 font-bold text-white shadow-lg transition hover:bg-orange-600"
            >
              Start your adventure →
            </a>
          </div>
        </main>
      </div>
    </div>
  );
}