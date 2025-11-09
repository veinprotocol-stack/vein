"use client";

import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import ChatBox from "@/components/ChatBox";

/* ---------------- types + data ---------------- */
type Tile = {
  id: number;
  name: string;
  myWeight: number;
  totalWeight: number;
  peers: number;
};

const NODE_NAMES = [
  "Cortex Node",
  "Spinal Cluster",
  "Lymph Relay",
  "Tendon Bridge",
  "Heart Vein",
  "Nerve Gate",
  "Marrow Core",
  "Optic Basin",
  "Pulmonary Vault",
];

// Deterministic placeholders (prevents hydration mismatch)
const blankTiles: Tile[] = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  name: NODE_NAMES[i],
  myWeight: 0,
  totalWeight: 0,
  peers: 0,
}));

// Client-only live seeds
function makeLiveTiles(): Tile[] {
  return Array.from({ length: 9 }, (_, i) => ({
    id: i + 1,
    name: NODE_NAMES[i],
    myWeight: 0,
    totalWeight: +(1 + Math.random() * 1.2).toFixed(4),
    peers: Math.floor(380 + Math.random() * 60),
  }));
}

/* ---------------- page ---------------- */
export default function MinePage() {
  // Chat identity
  const wallet = useWallet();
  const me = useMemo(
    () => (wallet?.publicKey ? wallet.publicKey.toBase58() : "guest"),
    [wallet?.publicKey]
  );

  // Tiles (hydrate to live after mount)
  const [tiles, setTiles] = useState<Tile[]>(blankTiles);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [sync, setSync] = useState<number>(60);

  useEffect(() => {
    setTiles(makeLiveTiles());
    setReady(true);
  }, []);

  // Wobble + heartbeat
  useEffect(() => {
    if (!ready) return;
    const t = setInterval(() => setSync((s) => (s > 0 ? s - 1 : 60)), 1000);
    const p = setInterval(() => {
      setTiles((prev) =>
        prev.map((x) => ({
          ...x,
          totalWeight: +Math.max(0, x.totalWeight + (Math.random() * 0.18 - 0.05)).toFixed(4),
        }))
      );
    }, 900);
    return () => {
      clearInterval(t);
      clearInterval(p);
    };
  }, [ready]);

  function commit() {
    if (selected == null) return;
    const i = selected - 1;
    setTiles((prev) => {
      const copy = [...prev];
      copy[i] = {
        ...copy[i],
        myWeight: copy[i].myWeight + 1,
        totalWeight: +(copy[i].totalWeight + 1).toFixed(4),
      };
      return copy;
    });
  }

  // Biomech stats
  const heartRate = 80;
  const neuralYieldTotal = 12.4258;

  return (
    <main className="mx-auto max-w-[1600px] scale-[1.50] origin-top grid grid-cols-1 xl:grid-cols-[320px_1fr_380px] gap-8 pt-6">
      {/* LEFT: Cognitive Channel */}
      <aside className="hidden xl:block">
        <div className="sticky top-24">
          <div className="card p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-line text-sm text-text-dim">Cognitive Channel</div>
            <div className="px-4 py-3 text-sm text-text-dim">Connect wallet to chat…</div>
            <div className="px-4 pb-4 space-y-4">
              <ChatBox room="global" me={me} />
            </div>
            <div className="px-4 py-2 border-t border-line text-[11px] text-text-dim">status: live (ephemeral)</div>
          </div>
        </div>
      </aside>

      {/* CENTER: 3×3 organ grid */}
      <section className="flex items-start justify-center">
        <div className="w-full max-w-[620px]">
          <div className="grid grid-cols-3 gap-3 bg-[rgba(255,255,255,0.02)] p-4 rounded-2xl border border-[rgba(255,255,255,0.08)]">
            {tiles.map((t) => {
              const isSelected = selected === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelected(t.id)}
                  className={[
                    "relative px-3 pt-2 pb-3 text-left select-none transition-all",
                    "card hover:border-accent/40 tile focus-visible:outline-none",
                    isSelected ? "card-selected" : "",
                  ].join(" ")}
                >
                  {/* content column — pb-6 reserves space for bottom absolute number */}
                  <div className="h-full w-full flex flex-col items-center justify-start pb-6">
                    {/* Name */}
                    <div className="w-full text-center text-[12px] leading-tight font-medium">
                      {t.name}
                    </div>

                    {/* Peers row (no wrap, stays inside bounds) */}
                    <div className="mt-1 inline-flex items-center gap-1 text-[11px] opacity-75 whitespace-nowrap">
                      <span className="font-mono tabular-nums">{t.peers}</span>
                      <svg viewBox="0 0 24 24" className="w-[12px] h-[12px] opacity-70 shrink-0" aria-hidden="true">
                        <path
                          fill="currentColor"
                          d="M12 12a5 5 0 1 0-5-5a5 5 0 0 0 5 5m0 2c-3.33 0-10 1.67-10 5v1h20v-1c0-3.33-6.67-5-10-5"
                        />
                      </svg>
                    </div>

                    {/* Heart pulse */}
                    {t.name === "Heart Vein" && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-red-500/70 animate-pulse" />
                      </div>
                    )}

                    {/* Value (absolute, bottom) */}
                    <div className="tile-num">{t.totalWeight.toFixed(4)}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* RIGHT: Tissue Response + Deploy */}
      <aside className="space-y-4">
        <div className="sticky top-24 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Heart rate (BPM)" value={`${heartRate}`} />
            <StatCard label="Heartbeat sync" value={`${sync.toString().padStart(2, "0")}s`} />
            <StatCard label="Neural yield (total)" value={neuralYieldTotal.toFixed(4)} />
            <StatCard label="Bio-injection (you)" value={"0.0000"} />
          </div>

          <div className="card p-4">
            <h3 className="font-medium mb-3">Tissue Response</h3>
            <InfoRow k="Current node" v={selected ? tiles[selected - 1].name : "—"} />
            <InfoRow k="Your load" v={selected ? tiles[selected - 1].myWeight.toFixed(2) : "0.00"} />
            <InfoRow k="Flow density" v={selected ? tiles[selected - 1].totalWeight.toFixed(2) : "0.00"} />
          </div>

          <div className="card p-4">
            <h3 className="font-medium mb-3">Field Protocols</h3>
            <ul className="space-y-2 text-sm text-text-dim">
              <li>
                Choose an organ-node, then press <span className="text-text-base">Commit</span>.
              </li>
              <li>Sync resets every heartbeat.</li>
              <li>Prototype — wallet & payouts later.</li>
            </ul>
            <button
              onClick={commit}
              disabled={selected == null}
              className="mt-4 w-full h-10 rounded-lg bg-white text-black font-medium transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none"
            >
              Commit
            </button>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <ModeTabs />
              <div className="ml-auto flex items-center gap-2 text-sm">
                <span className="text-text-dim">Blocks</span>
                <button className="h-9 px-3 rounded-lg border border-line bg-panel text-sm hover:border-accent/60 focus-visible:outline-none">
                  +1
                </button>
                <button className="h-9 px-3 rounded-lg border border-line bg-panel text-sm hover:border-accent/60 focus-visible:outline-none">
                  +0.1
                </button>
                <button className="h-9 px-3 rounded-lg border border-line bg-panel text-sm hover:border-accent/60 focus-visible:outline-none">
                  +0.01
                </button>
                <div className="ml-3 font-mono">1.0</div>
              </div>
            </div>

            <div className="mt-4 h-11 rounded-xl bg-line/30 flex items-center justify-center text-text-base">
              Deploy
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-text-dim">
              <span>x0</span>
              <span>0 SOL</span>
            </div>
          </div>
        </div>
      </aside>
    </main>
  );
}

/* ---------------- little UI helpers ---------------- */
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card px-4 py-3 stat-card">
      <div className="label">{label}</div>
      <div className="mt-1 value">{value}</div>
    </div>
  );
}

function InfoRow({ k, v }: { k: string; v: any }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-text-dim">{k}</span>
      <span className="font-mono">{v}</span>
    </div>
  );
}

function ModeTabs() {
  const [mode, setMode] = useState<"Manual" | "Auto">("Manual");
  const base = "h-9 px-4 text-sm rounded-lg border transition focus-visible:outline-none";
  return (
    <div className="flex gap-2">
      <button
        onClick={() => setMode("Manual")}
        className={`${base} ${mode === "Manual" ? "border-accent" : "border-line bg-panel hover:border-accent/60"}`}
      >
        Manual
      </button>
      <button
        onClick={() => setMode("Auto")}
        className={`${base} ${mode === "Auto" ? "border-accent" : "border-line bg-panel hover:border-accent/60"}`}
      >
        Auto
      </button>
    </div>
  );
}
