import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import bgImage from "@/assets/map-town.jpg";

export const Route = createFileRoute("/docs")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Docs — Hunter World" },
      { name: "description", content: "Open world MMORPG on Solana. Read the full design: gameplay loop, seasons, rewards, staking and ecosystem token." },
      { property: "og:title", content: "Docs — Hunter World" },
      { property: "og:description", content: "An open world MMORPG on Solana where rewards come from adventure, not speculation." },
    ],
  }),
  component: DocsPage,
});

type Section = { id: string; title: string; body: string[] };

const SECTIONS: Section[] = [
  { id: "overview", title: "Overview", body: [
    "An open world MMORPG where players explore vast regions, hunt monsters, collect rare discoveries, complete collections, compete in seasonal events, and earn rewards from real ecosystem activity.",
    "This is not a game about opening packs. This is not a game about passive staking. This is a game about adventure.",
    "Every monster hunted. Every region explored. Every collection completed. Every battle won. Contributes to a player's progression and reward potential.",
    "The world rewards participation. Not speculation.",
  ]},
  { id: "vision", title: "Vision", body: [
    "Create a living online world where progression comes from gameplay.",
    "Players build their reputation through Exploration, Hunting, Collection, Competition, and Community Contribution.",
    "The most active adventurers receive the greatest opportunities.",
  ]},
  { id: "loop", title: "Core Gameplay Loop", body: [
    "Explore Regions → Discover Monsters → Hunt Rare Creatures → Collect Cards & Materials → Craft Equipment → Complete Collections → Increase Adventure Rank → Stake Ecosystem Tokens → Unlock Reward Multipliers → Earn Seasonal Rewards → Continue Progression.",
  ]},
  { id: "world", title: "Open World", body: [
    "The world consists of multiple connected regions. Each region contains unique monsters, regional bosses, rare resources, hidden treasures and exclusive collections.",
    "Players unlock new areas as they progress. Exploration is a core part of advancement.",
  ]},
  { id: "hunting", title: "Monster Hunting", body: [
    "Monsters roam throughout the world. Each species has rarity, habitat, collection value and seasonal variants.",
    "Defeating monsters can reward resources, equipment materials, monster cards, cosmetics, mounts and seasonal collectibles.",
    "The rarest rewards are earned through discovery and persistence.",
  ]},
  { id: "cards", title: "Monster Cards", body: [
    "Every monster can drop collectible cards. Cards become part of a player's collection and progression.",
    "Examples — Wolf Card: +5% Movement Speed · Goblin Card: +10% Gold Gain · Dragon Card: +5% Boss Damage.",
    "Cards can be collected, traded, displayed, or used for collection completion.",
  ]},
  { id: "collection", title: "Collection System", body: [
    "Every discovery contributes toward Collection Value: Monster, Boss, Region, Mount and Seasonal Collections.",
    "Completing collections rewards Adventure Points, cosmetics, titles, seasonal bonuses and reward multipliers.",
    "Collections become a major source of long-term progression.",
  ]},
  { id: "rarity", title: "Item Rarity", body: [
    "Common · Uncommon · Rare · Epic · Legendary · Mythic · Ancient.",
    "Ancient items represent the rarest discoveries in the game. Only a limited number may exist during a season.",
  ]},
  { id: "rank", title: "Adventure Rank", body: [
    "Adventure Rank represents overall progression. It increases through Exploration, Hunting, Collection Completion, Boss Participation and Seasonal Activities.",
    "Adventure Rank unlocks new regions, bosses, quests and seasonal opportunities.",
  ]},
  { id: "pvp", title: "Arena PvP", body: [
    "Players can compete in ranked PvP. Rewards are based on wins, rankings and seasonal performance.",
    "PvP rewards include titles, cosmetics, seasonal collectibles and reward pool shares.",
    "Skill determines outcomes. Not spending.",
  ]},
  { id: "guild", title: "Guild System", body: [
    "Players can create guilds and compete together through Guild Wars, Territory Events, World Boss Hunts and Seasonal Campaigns.",
    "Guilds contribute toward seasonal rankings.",
  ]},
  { id: "world-bosses", title: "World Bosses", body: [
    "Massive bosses appear throughout the world — Ancient Dragon, Titan Golem, Void Leviathan, Frost King.",
    "Rewards are distributed based on contribution. The more players contribute, the greater their share.",
  ]},
  { id: "seasons", title: "Seasonal World System", body: [
    "The world changes every season. Each season lasts 90 days.",
    "At the end of a season, rankings reset, seasonal rewards are distributed, new monsters appear, new collections become available and new world events begin.",
    "Character progression remains permanent. Only seasonal competition resets.",
  ]},
  { id: "season-themes", title: "Season Themes", body: [
    "Spring — Growth & Discovery: exclusive monsters, resources, collectibles and events.",
    "Summer — Adventure & Exploration: new islands, expeditions and sea creatures.",
    "Autumn — Harvest & Preparation: resource-rich events and collection challenges.",
    "Winter — Survival & Competition: frozen regions, rare bosses and increased PvP activity.",
  ]},
  { id: "seasonal-monsters", title: "Seasonal Monsters & Collections", body: [
    "Certain monsters only appear during specific seasons. When a season ends, those monsters become unavailable and their collectibles become legacy items.",
    "Every season introduces unique collections granting seasonal titles, collection rewards, seasonal bonuses and exclusive cosmetics.",
    "Once a season ends, those rewards become permanently unobtainable.",
  ]},
  { id: "token", title: "Ecosystem Token", body: [
    "The ecosystem token powers premium systems: Staking, Battle Pass, Cosmetic Purchases, Marketplace Transactions, Guild Creation, Tournament Entry and Seasonal Activities.",
    "The token enhances participation. It does not replace gameplay.",
  ]},
  { id: "staking", title: "Staking", body: [
    "Players can stake ecosystem tokens to unlock benefits — Reward Multipliers, Exclusive Cosmetics, Additional Seasonal Activities and Early Event Access.",
    "Staking improves opportunities but does not determine rewards. Active players remain the most rewarded.",
  ]},
  { id: "battle-pass", title: "Battle Pass", body: [
    "Each season introduces a new Battle Pass.",
    "Free Track: resources, gold, cosmetics. Premium Track: exclusive cosmetics, seasonal collectibles, unique mounts and special titles.",
  ]},
  { id: "rewards", title: "Reward Philosophy", body: [
    "Rewards come from participation. Not passive holding. Not speculation.",
    "Players earn rewards through Exploration, Hunting, Collection, Competition and Community Activities.",
    "The most dedicated adventurers receive the largest share.",
  ]},
  { id: "pool", title: "Reward Pool", body: [
    "Rewards come from real ecosystem activity: Marketplace Fees, Tournament Entry Fees, Premium Cosmetics, Battle Pass Revenue, Partnerships and Sponsored Events.",
    "These revenues are collected into a shared Seasonal Reward Pool.",
  ]},
  { id: "distribution", title: "Seasonal Distribution", body: [
    "30% — Adventurers (Exploration & Hunting).",
    "20% — Arena PvP.",
    "15% — Guild Wars.",
    "10% — Collection Achievements.",
    "25% — Community Events.",
    "Players receive rewards based on their contribution within each category.",
  ]},
  { id: "reward-types", title: "Reward Types", body: [
    "Ecosystem Tokens, Exclusive Cards, Cosmetic Items, Seasonal Titles, Achievement Rewards, Seasonal Collectibles and Guild Rewards.",
    "The rarest rewards are earned through gameplay. Not purchased through packs.",
  ]},
  { id: "economy", title: "Fair Economy", body: [
    "The economy is designed around progression — not pay-to-win mechanics.",
    "Buying cosmetics does not increase rewards. Spending money does not increase Adventure Score.",
    "Only gameplay, exploration, collection progress and participation determine a player's reward share.",
  ]},
  { id: "fees", title: "Creator Fee Allocation", body: [
    "80% — Rewards.",
    "20% — Treasury.",
  ]},
  { id: "sustainable", title: "Sustainable By Design", body: [
    "The ecosystem does not rely on endless token emissions.",
    "As more players explore, trade, compete, collect and participate, more value flows into the reward pool.",
    "The world grows. The reward pool grows. And the most dedicated adventurers earn the largest share.",
  ]},
  { id: "endgame", title: "Endgame", body: [
    "The strongest adventurers compete for Seasonal Rankings, World Boss Leaderboards, Guild Championships, Collection Completion, Territory Events and Legendary Discoveries.",
    "The journey never truly ends. There is always another region to explore. Another monster to hunt. Another collection to complete. Another legend to become.",
  ]},
];

function DocsPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden mmo-overlay">
      {/* Fixed background */}
      <div className="fixed inset-0">
        <img src={bgImage} alt="" aria-hidden className="fixed inset-0 h-full w-full object-cover" />
        <div className="fixed inset-0 bg-black/80" />
      </div>

      {/* Sticky navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <SiteNav />
      </div>

      {/* Scrollable content */}
      <div className="mmo-scroll relative z-10 h-screen overflow-y-auto pt-14">
        <main className="mx-auto max-w-6xl px-4 py-8 lg:py-12">
          <header className="mb-8 text-center">
            <div className="text-[11px] font-bold uppercase tracking-[0.4em] text-orange-400">
              ⚔ Whitepaper ⚔
            </div>
            <h1 className="mt-2 bg-gradient-to-r from-amber-200 via-orange-400 to-amber-200 bg-clip-text text-4xl font-black tracking-tight text-transparent drop-shadow lg:text-5xl">
              Open World MMORPG on Solana
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-white/80 lg:text-base">
              The world rewards participation. Not speculation.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
            {/* TOC sidebar */}
            <aside className="hidden lg:block">
              <div className="mmo-panel mmo-scroll rounded-2xl p-4">
                <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Contents
                </div>
                <nav className="flex flex-col gap-1 text-sm">
                  {SECTIONS.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className="rounded px-2 py-1 font-semibold text-slate-700 hover:bg-orange-100 hover:text-orange-700"
                    >
                      {s.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Body */}
            <article className="flex flex-col gap-4">
              {SECTIONS.map((s) => (
                <section
                  key={s.id}
                  id={s.id}
                  className="mmo-panel scroll-mt-24 rounded-2xl p-5 lg:p-6"
                >
                  <h2 className="mb-3 text-xl font-extrabold tracking-tight text-slate-900 lg:text-2xl">
                    {s.title}
                  </h2>
                  <div className="flex flex-col gap-2">
                    {s.body.map((p, i) => (
                      <p key={i} className="text-sm leading-relaxed text-slate-700 lg:text-[15px]">
                        {p}
                      </p>
                    ))}
                  </div>
                </section>
              ))}

              <div className="mt-2 text-center">
                <a
                  href="/"
                  className="inline-block rounded-lg bg-orange-500 px-6 py-3 font-bold text-white shadow-lg transition hover:bg-orange-600"
                >
                  Enter the realm →
                </a>
              </div>
            </article>
          </div>
        </main>
      </div>
    </div>
  );
}