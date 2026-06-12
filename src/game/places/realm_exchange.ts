import type { Place } from "../types";

export const realmExchange: Place = {
  id: "realm-exchange",
  name: "Hunter Exchange",
  job: "Trader",
  emoji: "🪙",
  x: 25,
  y: 20,
  sprite: "realm-exchange",
  description: "Buy, stake, and claim $Hunt rewards.",
  action: "Open Exchange",
  perform: ({ toast }) => {
    // Actual UI is rendered by GameCanvas via RealmExchangeModal.
    toast("Welcome to the Hunter Exchange");
  },
};