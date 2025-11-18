"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import ChatBox from "@/components/ChatBox";
import veinBg from "@/assets/vein-bg.png";

import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

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

// Client-only live seeds – smaller, realistic
function makeLiveTiles(): Tile[] {
  return Array.from({ length: 9 }, (_, i) => ({
    id: i + 1,
    name: NODE_NAMES[i],
    myWeight: 0,
    // around 0.15 – 0.5 like early low TVL
    totalWeight: +(0.15 + Math.random() * 0.35).toFixed(4),
    // 5–12 active peers per node
    peers: Math.floor(5 + Math.random() * 8),
  }));
}

// key for persistent round timing
const ROUND_KEY = "vein_round_end_at_v1";

/* ---------------- page ---------------- */
export default function MinePage() {
  // Chat identity
  const wallet = useWallet();
  const { connection } = useConnection();

  const me = useMemo(
    () => (wallet?.publicKey ? wallet.publicKey.toBase58() : "guest"),
    [wallet?.publicKey]
  );

  // Tiles (hydrate to live after mount)
  const [tiles, setTiles] = useState<Tile[]>(blankTiles);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [sync, setSync] = useState<number>(60);

  const [winnerId, setWinnerId] = useState<number | null>(null);

  // Persistent round end timestamp
  const roundEndRef = useRef<number | null>(null);

  // Round animation phase: 0 → 1 controls how much of the numbers you see
  const [phaseFactor, setPhaseFactor] = useState<number>(1);
  const [rampActive, setRampActive] = useState<boolean>(false);

  // Deploy controls
  const unitSol = 1; // 1 SOL per “+1” click now
  const [blocks, setBlocks] = useState<number>(0); // interpret as SOL amount (for “Multiplier” row)
  const [totalSol, setTotalSol] = useState<number>(0); // actual SOL amount

  // “Economy” stats
  const [networkSeed] = useState<number>(() =>
    parseFloat((5 + Math.random() * 3).toFixed(4)) // 5–8 SOL seed
  );
  const [myInjected, setMyInjected] = useState<number>(0); // this wallet only

  // derived global yield: seed + sum of all tile weights + your deploys
  const globalWeight = tiles.reduce((sum, t) => sum + t.totalWeight, 0);
  const baseNeuralYield = networkSeed + globalWeight + myInjected;

  // Display versions respect the phaseFactor (0 after round, ramps back to 1)
  const neuralYieldDisplay = parseFloat(
    (baseNeuralYield * phaseFactor).toFixed(4)
  );
  const surgeDisplay = parseFloat((neuralYieldDisplay * 0.1).toFixed(2));

  // initial mount
  useEffect(() => {
    setTiles(makeLiveTiles());
    setReady(true);
  }, []);

  /* ---------- ramp animation for new rounds ---------- */

  useEffect(() => {
    if (!rampActive) return;

    const step = 0.05; // +0.05 every tick
    const interval = 500; // 0.5s → ~10s to go 0 → 1

    const id = setInterval(() => {
      setPhaseFactor((prev) => {
        const next = Math.min(1, prev + step);
        if (next >= 1) {
          clearInterval(id);
          return 1;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(id);
  }, [rampActive]);

  /* ---------- round lifecycle (heartbeat → winner → reset) ---------- */

  const endRound = useCallback(() => {
    // pick the highest totalWeight as winner
    setTiles((prev) => {
      if (!prev.length) return prev;
      let winner = prev[0];
      for (let i = 1; i < prev.length; i++) {
        if (prev[i].totalWeight > winner.totalWeight) {
          winner = prev[i];
        }
      }
      setWinnerId(winner.id);
      return prev;
    });

    // Immediately zero out display numbers while winner is highlighted
    setPhaseFactor(0);
    setRampActive(false);

    // after reveal, reseed tiles and ramp numbers back up
    setTimeout(() => {
      setTiles(makeLiveTiles());
      setSelected(null);
      setWinnerId(null);
      setPhaseFactor(0);
      setRampActive(true);
    }, 3000); // 3s reveal
  }, []);

  // heartbeat timer that survives refresh via localStorage
  useEffect(() => {
    if (!ready) return;

    // initialize / restore round end
    const initRoundEnd = () => {
      const now = Date.now();
      let stored: number | null = null;

      try {
        const raw = window.localStorage.getItem(ROUND_KEY);
        if (raw) {
          const parsed = parseInt(raw, 10);
          if (!Number.isNaN(parsed)) stored = parsed;
        }
      } catch {
        // ignore
      }

      let endAt: number;
      // reuse stored if it's in the future but not crazy far
      if (stored && stored > now && stored - now < 2 * 60_000) {
        endAt = stored;
      } else {
        endAt = now + 60_000; // new 60s round
        try {
          window.localStorage.setItem(ROUND_KEY, String(endAt));
        } catch {
          // ignore
        }
      }

      roundEndRef.current = endAt;
      const remaining = Math.max(0, Math.ceil((endAt - now) / 1000));
      setSync(remaining);
    };

    initRoundEnd();

    const t = setInterval(() => {
      const now = Date.now();
      let endAt = roundEndRef.current;

      if (!endAt) {
        endAt = now + 60_000;
        roundEndRef.current = endAt;
        try {
          window.localStorage.setItem(ROUND_KEY, String(endAt));
        } catch {
          // ignore
        }
      }

      let remaining = Math.max(0, Math.ceil((endAt - now) / 1000));

      if (remaining <= 0) {
        // round over → pick winner + start a fresh 60s round
        endRound();

        const newEnd = now + 60_000;
        roundEndRef.current = newEnd;
        remaining = 60;

        try {
          window.localStorage.setItem(ROUND_KEY, String(newEnd));
        } catch {
          // ignore
        }
      }

      setSync(remaining);
    }, 1000);

    return () => clearInterval(t);
  }, [ready, endRound]);

  // slower drift: every 7 seconds, only up, tiny increments
  useEffect(() => {
    if (!ready) return;

    const p = setInterval(() => {
      setTiles((prev) =>
        prev.map((x) => ({
          ...x,
          totalWeight: +(x.totalWeight + Math.random() * 0.005).toFixed(4),
        }))
      );
    }, 7000); // 7s drift

    return () => clearInterval(p);
  }, [ready]);

  function commit() {
    if (selected == null || winnerId !== null) return;
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

  // Adjust blocks (now meaning “SOL amount”) and keep totalSol in sync
  function bumpBlocks(delta: number) {
    setBlocks((prev) => {
      const raw = prev + delta;
      const clampedBlocks = Math.max(0, parseFloat(raw.toFixed(2))); // e.g. 1.00, 1.10, etc.
      const nextTotal = parseFloat((clampedBlocks * unitSol).toFixed(4)); // same value, 4dp
      setTotalSol(nextTotal);
      return clampedBlocks;
    });
  }

  // Manual SOL input
  function handleTotalInput(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    const n = parseFloat(v);
    if (isNaN(n) || n < 0) {
      setTotalSol(0);
      setBlocks(0);
      return;
    }
    const clampedSol = parseFloat(n.toFixed(4)); // keep 4dp for SOL
    setTotalSol(clampedSol);
    // reflect into “blocks” as 2dp
    setBlocks(parseFloat(clampedSol.toFixed(2)));
  }

  // 🔺 SEND SOL TO TREASURY ON DEPLOY
  async function handleDeploy() {
    try {
      if (!wallet.publicKey) {
        alert("Connect wallet to deploy.");
        return;
      }
      if (totalSol <= 0) {
        alert("Choose a non-zero amount before deploying.");
        return;
      }

      const TREASURY = new PublicKey(
        "7kZScsdR6fpzCcjJksX1Ym2E9hrhNy1FEp4TT4b4hvY2"
      );

      const lamports = Math.round(totalSol * LAMPORTS_PER_SOL);

      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: TREASURY,
          lamports,
        })
      );

      tx.feePayer = wallet.publicKey;
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;

      const sig = await wallet.sendTransaction(tx, connection);

      await connection.confirmTransaction(
        { signature: sig, blockhash, lastValidBlockHeight },
        "processed"
      );

      console.log("Deploy tx:", sig);
      alert(`Deploy sent (${totalSol.toFixed(4)} SOL).\nSignature:\n${sig}`);

      // track bio-injection for this wallet
      setMyInjected((prev) => parseFloat((prev + totalSol).toFixed(4)));
      // optional reset:
      // setBlocks(0); setTotalSol(0);
    } catch (err) {
      console.error("Deploy error:", err);
      alert("Deploy failed or was rejected.");
    }
  }

  const roundRevealing = winnerId !== null;

  return (
    // Background wrapper with image
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${veinBg.src})` }}
    >
      {/* Dark overlay so UI is readable */}
      <div className="min-h-screen w-full bg-black/75">
        <main className="w-full px-6 lg:px-10 2xl:px-16 py-12 animate-fadeIn">
          {/* Hero header */}
          <header className="text-center mb-10">
            <p className="text-[11px] uppercase tracking-[0.25em] text-text-dim mb-2">
              Synthetic Mining Console
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-wide mb-3">
              VEIN <span className="text-accent">/ Live Organ Grid</span>
            </h1>
            <p className="max-w-4xl mx-auto text-sm md:text-base text-text-dim leading-relaxed">
              Each round routes flow through a simulated body. Choose an
              organ-node, commit pressure, and watch the{" "}
              <span className="text-text-base">Surge</span> and{" "}
              <span className="text-text-base">Neural Yield</span> evolve with
              every heartbeat.
            </p>
          </header>

          <section className="grid grid-cols-1 xl:grid-cols-[300px_minmax(0,780px)_420px] 2xl:grid-cols-[320px_minmax(0,880px)_440px] gap-10 items-start">
            {/* LEFT: Cognitive Channel */}
            <aside className="order-3 xl:order-1">
              <div className="card p-0 overflow-hidden">
                <div className="px-4 py-3 border-b border-line text-sm text-text-dim">
                  Cognitive Channel
                </div>
                <div className="px-4 py-3 text-sm text-text-dim">
                  Connect wallet to chat with other nodes in the organism.
                </div>
                <div className="px-4 pb-0 space-y-4">
                  <ChatBox room="global" me={me} />
                </div>
                <div className="px-4 py-2 border-t border-line text-[11px] text-text-dim flex justify-between">
                  <span>status: live (ephemeral)</span>
                  <span className="opacity-70">VEIN://neuron-feed</span>
                </div>
              </div>
            </aside>

            {/* CENTER: circular organ grid */}
            <section className="order-1 xl:order-2 flex justify-center">
              <div className="w-full max-w-[760px]">
                <div className="mb-0 flex items-center justify-between text-xs text-text-dim">
                  <span>Organ topology</span>
                  <span className="font-mono">
                    Round sync: {sync.toString().padStart(2, "0")}s
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-7">
                  {tiles.map((t) => {
                    const isSelected = selected === t.id;
                    const isWinner = winnerId === t.id;
                    const displayedWeight = +(
                      t.totalWeight * phaseFactor
                    ).toFixed(4);
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          if (roundRevealing) return;
                          setSelected(t.id);
                        }}
                        className={[
                          "relative flex flex-col items-center justify-center",
                          "aspect-square rounded-full border bg-black/55 shadow-[0_0_25px_rgba(0,0,0,0.85)]",
                          "transition-all duration-300 hover:border-accent/60 hover:-translate-y-1 hover:bg-black/75",
                          "focus-visible:outline-none",
                          isSelected
                            ? "border-accent"
                            : "border-[rgba(255,255,255,0.08)]",
                          roundRevealing && !isWinner
                            ? "opacity-35 grayscale"
                            : "",
                          isWinner
                            ? "border-accent shadow-[0_0_40px_rgba(159,232,112,0.7)]"
                            : "",
                        ].join(" ")}
                      >
                        {/* rotating outer ring */}
                        <div
                          className="absolute inset-1 rounded-full border border-accent/15 animate-spin pointer-events-none"
                          style={{ animationDuration: "12s" }}
                        />
                        {/* inner glow ring */}
                        <div className="absolute inset-5 rounded-full bg-accent/5 blur-xl pointer-events-none" />

                        {/* 🔥 Upgraded inner content */}
                        <div className="relative z-10 flex flex-col items-center justify-center px-4">
                          {/* Name */}
                          <div className="text-sm md:text-base font-semibold text-center leading-tight mb-2">
                            {t.name}
                          </div>

                          {/* Peers row */}
                          <div className="inline-flex items-center gap-1 text-[12px] md:text-sm opacity-85 mb-1.5">
                            <span className="font-mono tabular-nums">
                              {t.peers}
                            </span>
                            <svg
                              viewBox="0 0 24 24"
                              className="w-[14px] h-[14px] opacity-75 shrink-0"
                              aria-hidden="true"
                            >
                              <path
                                fill="currentColor"
                                d="M12 12a5 5 0 1 0-5-5a5 5 0 0 0 5 5m0 2c-3.33 0-10 1.67-10 5v1h20v-1c0-3.33-6.67-5-10-5"
                              />
                            </svg>
                          </div>

                          {/* Heart pulse marker */}
                          {t.name === "Heart Vein" && (
                            <div className="mb-1">
                              <div className="w-3 h-3 rounded-full bg-red-500/80 animate-pulse" />
                            </div>
                          )}

                          {/* Value */}
                          <div className="font-mono text-base md:text-lg mt-1 tracking-tight">
                            {displayedWeight.toFixed(4)}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* RIGHT: Stats + Commit + Deploy */}
            <aside className="order-2 xl:order-3 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  label="Surge"
                  value={surgeDisplay.toFixed(2)}
                  description="Surge index – 10% of Neural Yield routed into the reward pressure gauge."
                />
                <StatCard
                  label="Heartbeat sync"
                  value={`${sync.toString().padStart(2, "0")}s`}
                  description="Time remaining before the next vascular resolution cycle."
                />
                <StatCard
                  label="Neural yield (total)"
                  value={neuralYieldDisplay.toFixed(4)}
                  description="Total active flow: seed + organ pressure + user bio-injections (SOL-equivalent)."
                />
                <StatCard
                  label="Bio-injection (you)"
                  value={myInjected.toFixed(4)}
                  description="Cumulative SOL you’ve injected into the VEIN organism."
                />
              </div>

              {/* Tissue response */}
              <div className="card p-4">
                <h3 className="font-medium mb-3">Tissue Response</h3>
                <p className="mb-3 text-xs text-text-dim">
                  Live readout of the organ-node you’re hovering:{" "}
                  <span className="text-text-base">Your load</span> is your
                  local contribution,{" "}
                  <span className="text-text-base">Flow density</span> is total
                  node pressure.
                </p>
                <InfoRow
                  k="Current node"
                  v={selected ? tiles[selected - 1].name : "—"}
                />
                <InfoRow
                  k="Your load"
                  v={selected ? tiles[selected - 1].myWeight.toFixed(2) : "0.00"}
                />
                <InfoRow
                  k="Flow density"
                  v={
                    selected
                      ? (tiles[selected - 1].totalWeight * phaseFactor).toFixed(
                          2
                        )
                      : "0.00"
                  }
                />
              </div>

              {/* Field Protocols (Commit) */}
              <div className="card p-4">
                <h3 className="font-medium mb-3">Field Protocols</h3>
                <ul className="space-y-2 text-sm text-text-dim">
                  <li>
                    Select an organ-node and press{" "}
                    <span className="text-text-base">Commit</span> to apply
                    synthetic pressure to its vascular weight.
                  </li>
                  <li>
                    Your commit persists until the next heartbeat resolution,
                    when the system reveals the winning node.
                  </li>
                </ul>
                <button
                  onClick={commit}
                  disabled={selected == null || roundRevealing}
                  className="mt-4 w-full h-10 rounded-lg bg-white text-black font-medium transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none"
                >
                  {roundRevealing ? "Resolving round…" : "Commit"}
                </button>
              </div>

              {/* Deploy card */}
              <div className="card p-4 space-y-4">
                <p className="text-xs text-text-dim">
                  Blocks are injection units (
                  <span className="text-text-base">1 Block ≈ 1 SOL</span>).
                  Adjust blocks or type an exact amount, then deploy to route
                  SOL into the central VEIN treasury and increase both Neural
                  Yield and your Bio-Injection.
                </p>

                <div className="flex items-center gap-2 flex-wrap">
                  <ModeTabs />
                  <div className="ml-auto flex items-center gap-2 text-sm">
                    <span className="text-text-dim">Blocks</span>
                    <button
                      onClick={() => bumpBlocks(1)}
                      className="h-9 px-3 rounded-lg border border-line bg-panel text-sm hover:border-accent/60 focus-visible:outline-none"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => bumpBlocks(0.1)}
                      className="h-9 px-3 rounded-lg border border-line bg-panel text-sm hover:border-accent/60 focus-visible:outline-none"
                    >
                      +0.1
                    </button>
                    <button
                      onClick={() => bumpBlocks(0.01)}
                      className="h-9 px-3 rounded-lg border border-line bg-panel text-sm hover:border-accent/60 focus-visible:outline-none"
                    >
                      +0.01
                    </button>
                  </div>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-text-dim">Multiplier</span>
                    <span className="font-mono">x{blocks.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-text-dim">Total</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        step={0.0001}
                        value={totalSol}
                        onChange={handleTotalInput}
                        className="w-28 h-8 rounded-md bg-black/40 border border-line px-2 text-right font-mono text-sm focus-visible:outline-none focus:border-accent"
                      />
                      <span className="text-xs text-text-dim">SOL</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleDeploy}
                  disabled={!wallet.publicKey || totalSol <= 0}
                  className="w-full h-11 rounded-xl bg-line/30 flex items-center justify-center text-text-base border border-line hover:border-accent/60 transition disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none"
                >
                  {wallet.publicKey
                    ? totalSol > 0
                      ? `Deploy (${totalSol.toFixed(4)} SOL)`
                      : "Deploy"
                    : "Connect wallet to deploy"}
                </button>
              </div>
            </aside>
          </section>
        </main>
      </div>
    </div>
  );
}

/* ---------------- little UI helpers ---------------- */
function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description?: string;
}) {
  return (
    <div className="card px-4 py-3 stat-card">
      <div className="label">{label}</div>
      <div className="mt-1 value">{value}</div>
      {description && (
        <p className="mt-1 text-[11px] leading-snug text-text-dim">
          {description}
        </p>
      )}
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
  const base =
    "h-9 px-4 text-sm rounded-lg border transition focus-visible:outline-none";
  return (
    <div className="flex gap-2">
      <button
        onClick={() => setMode("Manual")}
        className={`${base} ${
          mode === "Manual"
            ? "border-accent"
            : "border-line bg-panel hover:border-accent/60"
        }`}
      >
        Manual
      </button>
      <button
        onClick={() => setMode("Auto")}
        className={`${base} ${
          mode === "Auto"
            ? "border-accent"
            : "border-line bg-panel hover:border-accent/60"
        }`}
      >
        Auto
      </button>
    </div>
  );
}
