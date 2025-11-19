"use client";

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto py-10 text-center animate-fadeIn">
      <h1 className="text-2xl font-semibold mb-3 tracking-wide text-accent">
        About VEIN
      </h1>

      <p className="text-text-dim max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
        <strong>VEIN</strong> is a synthetic mining protocol — a biomechanical
        experiment that converts network participation into living motion.
        Operators don’t just stake into a pool; they plug into a 3×3 organ
        grid and route flow through a simulated body that syncs to a global{" "}
        <span className="text-text-base font-medium">heartbeat every 60 seconds</span>.
        Pressure, commits, and injected SOL are translated into a living
        circulatory model that decides where future rewards will crystallize.
      </p>

      {/* --- How it Works --- */}
      <section className="mt-14 text-left space-y-6">
        <h2 className="text-lg font-medium text-accent text-center">
          How VEIN Works
        </h2>

        {/* Organ Grid */}
        <div className="card p-6">
          <h3 className="font-medium text-accent mb-2">Organ Grid</h3>
          <p className="text-sm text-text-dim leading-relaxed">
            VEIN’s core surface is a 3×3 map of organ-nodes — Cortex, Spinal
            Cluster, Lymph Relay, Heart Vein, Nerve Gate, Marrow Core, Optic
            Basin, Pulmonary Vault. Each node is a synthetic organ with:
          </p>
          <ul className="mt-2 text-sm text-text-dim space-y-1 list-disc pl-5">
            <li>
              <strong>Peers</strong> — active operators currently sitting on
              that node.
            </li>
            <li>
              <strong>Your Load</strong> — the pressure shard you’ve committed
              this heartbeat.
            </li>
            <li>
              <strong>Flow Density</strong> — total pressure on the node from
              all wallets.
            </li>
          </ul>
          <p className="mt-2 text-sm text-text-dim">
            Selecting and committing to a node applies{" "}
            <em>synthetic pressure</em>. You are effectively voting on{" "}
            <span className="text-text-base font-medium">
              where the next heartbeat should route attention, flow and
              eventual rewards.
            </span>
          </p>
          <p className="mt-3 text-[11px] text-text-dim">
            <span className="font-semibold text-text-base">For you:</span>{" "}
            choosing a node is both a positioning decision (where you want to
            stand in the organism) and a coordination game with other
            operators.
          </p>
        </div>

        {/* Heartbeat & Resolution */}
        <div className="card p-6">
          <h3 className="font-medium text-accent mb-2">
            Heartbeat &amp; Resolution
          </h3>
          <p className="text-sm text-text-dim leading-relaxed">
            Every ~60 seconds, VEIN resolves a{" "}
            <strong>heartbeat cycle</strong>. During a cycle you can:
          </p>
          <ul className="mt-2 text-sm text-text-dim space-y-1 list-disc pl-5">
            <li>
              Allocate a single <strong>pressure shard (~0.05 weight)</strong>{" "}
              to one organ-node.
            </li>
            <li>
              Watch global Flow Density drift upwards as other operators commit.
            </li>
            <li>
              Observe how the grid “breathes” in response to crowd behavior.
            </li>
          </ul>
          <p className="mt-2 text-sm text-text-dim">
            When the timer hits zero, the node with the highest flow density
            becomes the <strong>winning organ</strong>. For a brief moment:
          </p>
          <ul className="mt-2 text-sm text-text-dim space-y-1 list-disc pl-5">
            <li>All visible values drop to zero (vascular collapse).</li>
            <li>The winning organ is highlighted as the resolution point.</li>
            <li>
              A new round seeds itself and values ramp upward again — a fresh
              pulse.
            </li>
          </ul>
          <p className="mt-3 text-[11px] text-text-dim">
            <span className="font-semibold text-text-base">For you:</span>{" "}
            each heartbeat is a discrete decision window. Show up, commit your
            shard, and you’re part of the “circulatory record” that future
            reward logic will read from.
          </p>
        </div>

        {/* Neural Yield & Surge */}
        <div className="card p-6">
          <h3 className="font-medium text-accent mb-2">
            Neural Yield &amp; Surge
          </h3>
          <p className="text-sm text-text-dim leading-relaxed">
            <strong>Neural Yield</strong> is VEIN’s global health bar — a
            running measure of how “alive” the organism is this epoch. It’s
            calculated from:
          </p>
          <ul className="mt-2 text-sm text-text-dim space-y-1 list-disc pl-5">
            <li>
              <strong>Network Seed</strong> — baseline synthetic flow that
              keeps the body warm.
            </li>
            <li>
              <strong>Organ Pressure</strong> — total flow density across all
              nodes (everyone’s commits).
            </li>
            <li>
              <strong>Bio-Injections</strong> — SOL routed into the treasury
              by deploys.
            </li>
          </ul>
          <p className="mt-2 text-sm text-text-dim">
            From this, VEIN derives <strong>Surge</strong>: roughly{" "}
            <span className="text-text-base font-medium">
              10% of Neural Yield
            </span>{" "}
            exposed as a visible index. Surge hints at how thick the reward
            pressure is getting in the current epoch.
          </p>
          <p className="mt-2 text-sm text-text-dim">
            Both metrics oscillate — they spike as commits and injections
            arrive, then reset visually at the end of a heartbeat as the system
            “exhales” and starts a new breath.
          </p>
          <p className="mt-3 text-[11px] text-text-dim">
            <span className="font-semibold text-text-base">For you:</span>{" "}
            Neural Yield and Surge are your macro dashboard. High values mean
            the organism is in a high-energy state and any future reward logic
            will have more volume to play with.
          </p>
        </div>

        {/* Bio-Injection */}
        <div className="card p-6">
          <h3 className="font-medium text-accent mb-2">
            Bio-Injection (SOL Flow)
          </h3>
          <p className="text-sm text-text-dim leading-relaxed">
            The <strong>Deploy</strong> panel lets you push actual SOL into the
            VEIN treasury. Each deployment:
          </p>
          <ul className="mt-2 text-sm text-text-dim space-y-1 list-disc pl-5">
            <li>
              Increases your personal{" "}
              <strong>Bio-Injection counter</strong> (your total “blood”
              contributed).
            </li>
            <li>
              Feeds new liquidity into the organism, raising Neural Yield and
              Surge.
            </li>
            <li>
              Marks you as a <strong>vascular sponsor</strong> of the system —
              an address that materially keeps the body alive.
            </li>
          </ul>
          <p className="mt-2 text-sm text-text-dim">
            In VEIN, <strong>Commits</strong> decide{" "}
            <em>where</em> pressure is applied; <strong>Deploys</strong> decide{" "}
            <em>how much blood</em> the organism has to work with.
          </p>
          <p className="mt-3 text-[11px] text-text-dim">
            <span className="font-semibold text-text-base">For you:</span>{" "}
            your Bio-Injection history becomes your on-chain signature —
            positioning you for future reward routes, priority lanes, and
            cosmetic status inside the organism.
          </p>
        </div>

        {/* Operator Payoff */}
        <div className="card p-6">
          <h3 className="font-medium text-accent mb-2">
            Why Operators Care (Player Payoff)
          </h3>
          <p className="text-sm text-text-dim leading-relaxed">
            VEIN is not “click button, get number go up.” It’s a{" "}
            <strong>coordination engine</strong> dressed as a body. By showing
            up early as an operator you:
          </p>
          <ul className="mt-2 text-sm text-text-dim space-y-1 list-disc pl-5">
            <li>
              Build an on-chain track record of{" "}
              <strong>where</strong> you routed pressure each heartbeat.
            </li>
            <li>
              Accumulate Bio-Injection and surface as a high-signal address in
              the treasury.
            </li>
            <li>
              Help shape the empirical data that future reward logic, airdrop
              curves, and cosmetic unlocks will be based on.
            </li>
          </ul>
          <p className="mt-2 text-sm text-text-dim">
            The long-term arc: VEIN evolves into a full reward circuit where
            epochs of high Surge and consistent operators are minted into
            tangible yield, governance weight, or cosmetic “organ rights.”
          </p>
        </div>
      </section>

      {/* --- Vision & Genesis --- */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
        <div className="card p-6">
          <h3 className="font-medium text-accent mb-2">Vision</h3>
          <p className="text-sm text-text-dim leading-relaxed">
            To merge digital infrastructure with organic rhythm — blending
            decentralized systems, synthetic biology aesthetics, and game
            theory into a single biomechanical flow. VEIN treats your wallet as
            a cell: small alone, dangerous when synchronized.
          </p>
        </div>
        <div className="card p-6">
          <h3 className="font-medium text-accent mb-2">Genesis</h3>
          <p className="text-sm text-text-dim leading-relaxed">
            Born from the ORE lineage and re-forged into synthetic flesh, VEIN
            keeps the “minimal input, expressive output” spirit but routes it
            through a circulatory metaphor. Each node acts as both a token and
            a heartbeat — producing continuous bioflow and adaptive network
            motion as operators press on the right organs.
          </p>
        </div>
      </div>

      <p className="mt-12 text-xs text-text-dim opacity-70 text-center">
        “The flesh remembers. The grid adapts. The ones who show up each
        heartbeat write the anatomy.”
      </p>
    </main>
  );
}
