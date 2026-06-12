import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GameAppClient } from "@/components/GameAppClient";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Hunter World — Multiplayer Web Game" },
      { name: "description", content: "Explore an isometric Hunter World with other players in real time, right in your browser." },
      { property: "og:title", content: "Hunter World" },
      { property: "og:description", content: "Real-time multiplayer isometric voxel game in your browser." },
    ],
  }),
  component: Index,
});

function Index() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const fallback = (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-300 to-emerald-400 text-lg font-semibold text-white">
      Loading…
    </div>
  );

  if (!ready) return fallback;

  return <GameAppClient />;
}
