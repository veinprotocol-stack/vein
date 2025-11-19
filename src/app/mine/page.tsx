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

// how much pressure one wallet can contribute per round
const PRESSURE_UNIT = 0.05;

// VEIN genesis launch time — 1:30 AM IST, Nov 20 2025 = 2025-11-19T20:00:00Z
const LAUNCH_AT = new Date("2025-11-19T20:00:00Z").getTime();

/* ---------------- page ---------------- */
export default function MinePage() {
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

  // which node this wallet has committed pressure to in this round
  const [committedNodeId, setCommittedNodeId] = useState<number | null>(null);

  // Persistent round end timestamp
  const roundEndRef = useRef<number | null>(null);

  // Round animation phase: 0 → 1 controls how much of the numbers you see
  const [phaseFactor, setPhaseFactor] = useState<number>(1);
  const [rampActive, setRampActive] = useState<boolean>(false);

  // Deploy controls
  const unitSol = 1;
  const [blocks, setBlocks] = useState<number>(0);
  const [totalSol, setTotalSol] = useState<number>(0);

  // “Economy” stats
  const [networkSeed] = useState<number>(() =>
    parseFloat((5 + Math.random() * 3).toFixed(4)) // 5–8 SOL seed
  );
  const [myInjected, setMyInjected] = useState<number>(0);

  // derived global yield: seed + sum of all tile weights + your deploys
  const globalWeight = tiles.reduce((sum, t) => sum + t.totalWeight, 0);
  const baseNeuralYield = networkSeed + globalWeight + myInjected;

  const neuralYieldDisplay = parseFloat(
    (baseNeuralYield * phaseFactor).toFixed(4)
  );
  const surgeDisplay = parseFloat((neuralYieldDisplay * 0.1).toFixed(2));

  // ⏱ Launch countdown state
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const beforeLaunch = now < LAUNCH_AT;
  const diff = Math.max(0, LAUNCH_AT - now);
  const secs = Math.floor(diff / 1000);
  const hh = String(Math.floor(secs / 3600)).padStart(2, "0");
  const mm = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  const launchCountdown = `${hh}:${mm}:${ss}`;

  // 🔒 When true, freeze all simulation logic (rounds, drift, commit, deploy)
  const simulationLocked = beforeLaunch;

  // initial mount / react to lock-unlock
  useEffect(() => {
    if (simulationLocked) {
      setTiles(blankTiles);
    } else {
      setTiles(makeLiveTiles());
    }
    setReady(true);
  }, [simulationLocked]);

  /* ---------- ramp animation for new rounds ---------- */

  useEffect(() => {
    if (!rampActive || simulationLocked) return;

    const step = 0.05;
    const interval = 500;

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
  }, [rampActive, simulationLocked]);

  /* ---------- round lifecycle (heartbeat → winner → reset) ---------- */

  const endRound = useCallback(() => {
    if (simulationLocked) return;

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
      if (simulationLocked) return;
      setTiles(makeLiveTiles());
      setSelected(null);
      setWinnerId(null);
      setCommittedNodeId(null); // reset lock for new round
      setPhaseFactor(0);
      setRampActive(true);
    }, 3000);
  }, [simulationLocked]);

  // heartbeat timer that survives refresh via localStorage
  useEffect(() => {
    if (!ready || simulationLocked) return;

    const initRoundEnd = () => {
      const nowTs = Date.now();
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
      if (stored && stored > nowTs && stored - nowTs < 2 * 60_000) {
        endAt = stored;
      } else {
        endAt = nowTs + 60_000; // new 60s round
        try {
          window.localStorage.setItem(ROUND_KEY, String(endAt));
        } catch {
          // ignore
        }
      }

      roundEndRef.current = endAt;
      const remaining = Math.max(0, Math.ceil((endAt - nowTs) / 1000));
      setSync(remaining);
    };

    initRoundEnd();

    const t = setInterval(() => {
      const nowTs = Date.now();
      let endAt = roundEndRef.current;

      if (!endAt) {
        endAt = nowTs + 60_000;
        roundEndRef.current = endAt;
        try {
          window.localStorage.setItem(ROUND_KEY, String(endAt));
        } catch {
          // ignore
        }
      }

      let remaining = Math.max(0, Math.ceil((endAt - nowTs) / 1000));

      if (remaining <= 0) {
        // round over → pick winner + start a fresh 60s round
        endRound();

        const newEnd = nowTs + 60_000;
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
  }, [ready, endRound, simulationLocked]);

  // slower drift: every 7 seconds, only up, tiny increments
  useEffect(() => {
    if (!ready || simulationLocked) return;

    const p = setInterval(() => {
      setTiles((prev) =>
        prev.map((x) => ({
          ...x,
          totalWeight: +(x.totalWeight + Math.random() * 0.005).toFixed(4),
        }))
      );
    }, 7000);

    return () => clearInterval(p);
  }, [ready, simulationLocked]);

  // 🔁 Commit pressure: one-shot 0.05 shard per round
  function commit() {
    // locked pre-launch → ignore
    if (simulationLocked) return;

    // no node selected, round resolving, or already committed this round → ignore
    if (selected == null || winnerId !== null || committedNodeId !== null)
      return;

    setTiles((prev) =>
      prev.map((tile) => {
        if (tile.id !== selected) return tile;

        const myWeight = +(tile.myWeight + PRESSURE_UNIT).toFixed(4);
        const totalWeight = +(tile.totalWeight + PRESSURE_UNIT).toFixed(4);

        return {
          ...tile,
          myWeight,
          totalWeight,
        };
      })
    );

    // lock this wallet's pressure for the rest of the round
    setCommittedNodeId(selected);
  }

  // Adjust blocks (SOL amount) and keep totalSol in sync
  function bumpBlocks(delta: number) {
    if (simulationLocked) return;

    setBlocks((prev) => {
      const raw = prev + delta;
      const clampedBlocks = Math.max(0, parseFloat(raw.toFixed(2)));
      const nextTotal = parseFloat((clampedBlocks * unitSol).toFixed(4));
      setTotalSol(nextTotal);
      return clampedBlocks;
    });
  }

  // Manual SOL input
  function handleTotalInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (simulationLocked) return;

    const v = e.target.value;
    const n = parseFloat(v);
    if (isNaN(n) || n < 0) {
      setTotalSol(0);
      setBlocks(0);
      return;
    }
    const clampedSol = parseFloat(n.toFixed(4));
    setTotalSol(clampedSol);
    setBlocks(parseFloat(clampedSol.toFixed(2)));
  }

  // 🔺 SEND SOL TO TREASURY ON DEPLOY
  async function handleDeploy() {
    try {
      if (simulationLocked) {
        alert("VEIN mining activates at launch.");
        return;
      }
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

      setMyInjected((prev) => parseFloat((prev + totalSol).toFixed(4)));
    } catch (err) {
      console.error("Deploy error:", err);
      alert("Deploy failed or was rejected.");
    }
  }

  const roundRevealing = winnerId !== null;

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${veinBg.src})` }}
    >
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
                          if (roundRevealing || simulationLocked) return;
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
                          simulationLocked ? "cursor-default" : "",
                        ].join(" ")}
                      >
                        {/* rotating outer ring */}
                        <div
                          className="absolute inset-1 rounded-full border border-accent/15 animate-spin pointer-events-none"
                          style={{ animationDuration: "12s" }}
                        />
                        {/* inner glow ring */}
                        <div className="absolute inset-5 rounded-full bg-accent/5 blur-xl pointer-events-none" />

                        {/* inner content */}
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
                    Each round, your wallet gets a{" "}
                      <span className="text-text-base">
                        single pressure shard (~0.05 weight)
                      </span>
                    . Select an organ-node and press{" "}
                    <span className="text-text-base">Commit</span> to inject it.
                  </li>
                  <li>
                    Once committed, your shard is{" "}
                    <span className="text-text-base">locked</span> for that
                    heartbeat. You can’t stack or move it until the next round
                    resolves.
                  </li>
                </ul>
                <button
                  onClick={commit}
                  disabled={
                    simulationLocked ||
                    selected == null ||
                    roundRevealing ||
                    committedNodeId !== null
                  }
                  className="mt-4 w-full h-10 rounded-lg bg-white text-black font-medium transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none"
                >
                  {simulationLocked
                    ? "Activates at launch"
                    : roundRevealing
                    ? "Resolving round…"
                    : committedNodeId !== null
                    ? "Committed"
                    : "Commit"}
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
                      disabled={simulationLocked}
                      className="h-9 px-3 rounded-lg border border-line bg-panel text-sm hover:border-accent/60 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => bumpBlocks(0.1)}
                      disabled={simulationLocked}
                      className="h-9 px-3 rounded-lg border border-line bg-panel text-sm hover:border-accent/60 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +0.1
                    </button>
                    <button
                      onClick={() => bumpBlocks(0.01)}
                      disabled={simulationLocked}
                      className="h-9 px-3 rounded-lg border border-line bg-panel text-sm hover:border-accent/60 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
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
                        disabled={simulationLocked}
                        className="w-28 h-8 rounded-md bg-black/40 border border-line px-2 text-right font-mono text-sm focus-visible:outline-none focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <span className="text-xs text-text-dim">SOL</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleDeploy}
                  disabled={
                    simulationLocked || !wallet.publicKey || totalSol <= 0
                  }
                  className="w-full h-11 rounded-xl bg-line/30 flex items-center justify-center text-text-base border border-line hover:border-accent/60 transition disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none"
                >
                  {simulationLocked
                    ? "Deploy unlocks at launch"
                    : wallet.publicKey
                    ? totalSol > 0
                      ? `Deploy (${totalSol.toFixed(4)} SOL)`
                      : "Deploy"
                    : "Connect wallet to deploy"}
                </button>
              </div>
            </aside>
          </section>

          {/* 🔒 Pre-launch full-screen overlay */}
          {beforeLaunch && (
            <div className="fixed inset-0 z-[999] backdrop-blur-xl bg-black/80 flex items-center justify-center animate-fadeIn">
              <div className="relative p-8 md:p-10 rounded-2xl bg-black/70 border border-white/10 shadow-2xl text-center max-w-md mx-auto">
                {/* subtle inner frame */}
                <div className="absolute inset-0 rounded-2xl border border-accent/30 opacity-40 pointer-events-none" />
                <h2 className="text-2xl md:text-3xl font-semibold mb-3 tracking-wide">
                  VEIN Genesis Booting…
                </h2>
                <p className="text-text-dim text-xs md:text-sm mb-6">
                  The vascular engine is synchronizing for the first heartbeat.
                </p>
                <div className="text-4xl md:text-6xl font-mono tracking-widest text-accent">
                  {launchCountdown}
                </div>
                <p className="mt-4 text-[11px] text-text-dim">
                   Launching when the timer ends
                </p>
              </div>
            </div>
          )}
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
