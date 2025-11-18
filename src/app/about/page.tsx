"use client";

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto py-10 text-center animate-fadeIn">
      <h1 className="text-2xl font-semibold mb-3 tracking-wide text-accent">
        About VEIN
      </h1>

      <p className="text-text-dim max-w-2xl mx-auto leading-relaxed">
        <strong>VEIN</strong> is a synthetic mining protocol — a biomechanical
        experiment that converts network participation into living motion.
        Users interact with a 3×3 organ grid, powering a simulated body that
        syncs to a global heartbeat every 60 seconds. Flow, pressure, and
        injected SOL are translated into a living circulatory model.
      </p>

      {/* --- How it Works --- */}
      <section className="mt-14 text-left space-y-6">
        <h2 className="text-lg font-medium text-accent text-center">
          How VEIN Works
        </h2>

        <div className="card p-6">
          <h3 className="font-medium text-accent mb-2">Organ Grid</h3>
          <p className="text-sm text-text-dim leading-relaxed">
            VEIN’s core interface is a 3×3 map of organ-nodes — Cortex, Spinal
            Cluster, Lymph Relay, Heart Vein, Nerve Gate, and more. Each node
            carries:
          </p>
          <ul className="mt-2 text-sm text-text-dim space-y-1 list-disc pl-5">
            <li><strong>Peers</strong> — active users on that node</li>
            <li><strong>Your Load</strong> — your commits in the current cycle</li>
            <li><strong>Flow Density</strong> — total pressure on the node</li>
          </ul>
          <p className="mt-2 text-sm text-text-dim">
            Selecting and committing to a node applies “synthetic pressure,” influencing
            which organ wins the upcoming heartbeat.
          </p>
        </div>

        <div className="card p-6">
          <h3 className="font-medium text-accent mb-2">Heartbeat & Resolution</h3>
          <p className="text-sm text-text-dim leading-relaxed">
            Every 60 seconds, VEIN resolves a heartbeat. The node with the highest
            flow density becomes the <strong>winning organ</strong>. During this reveal:
          </p>
          <ul className="mt-2 text-sm text-text-dim space-y-1 list-disc pl-5">
            <li>All values drop to zero briefly</li>
            <li>The winning organ is highlighted</li>
            <li>The system ramps new values upward, simulating a fresh pulse</li>
          </ul>
          <p className="mt-2 text-sm text-text-dim">
            This continuous loop creates a living, rhythmic circulation.
          </p>
        </div>

        <div className="card p-6">
          <h3 className="font-medium text-accent mb-2">Neural Yield & Surge</h3>
          <p className="text-sm text-text-dim leading-relaxed">
            Neural Yield represents the organism’s total health — the sum of:
          </p>
          <ul className="mt-2 text-sm text-text-dim space-y-1 list-disc pl-5">
            <li>Network seed (baseline flow)</li>
            <li>Organ pressure from all nodes</li>
            <li>Your personal bio-injections (SOL routed into the system)</li>
          </ul>
          <p className="mt-2 text-sm text-text-dim">
            From this, VEIN derives <strong>Surge</strong>: 10% of Neural Yield,
            expressed as a network pressure index. Both Neural Yield and Surge
            reset at the end of each heartbeat and regrow as the organism “breathes”
            into the next cycle.
          </p>
        </div>

        <div className="card p-6">
          <h3 className="font-medium text-accent mb-2">Bio-Injection (SOL Flow)</h3>
          <p className="text-sm text-text-dim leading-relaxed">
            Deploying SOL sends real funds into the VEIN treasury. Each injection:
          </p>
          <ul className="mt-2 text-sm text-text-dim space-y-1 list-disc pl-5">
            <li>Increases your personal <strong>Bio-Injection</strong></li>
            <li>Feeds new “blood” into the organism</li>
            <li>Boosts Neural Yield and Surge</li>
          </ul>
          <p className="mt-2 text-sm text-text-dim">
            In VEIN, commits determine the <em>direction</em> of your influence,
            while deployments fuel the <em>circulation</em> itself.
          </p>
        </div>
      </section>

      {/* --- Vision & Genesis --- */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
        <div className="card p-6">
          <h3 className="font-medium text-accent mb-2">Vision</h3>
          <p className="text-sm text-text-dim leading-relaxed">
            To merge digital infrastructure with organic rhythm — blending
            artificial intelligence, decentralized systems, and living art into
            a single biomechanical flow.
          </p>
        </div>
        <div className="card p-6">
          <h3 className="font-medium text-accent mb-2">Genesis</h3>
          <p className="text-sm text-text-dim leading-relaxed">
            Born from the ORE lineage, evolved into synthetic flesh. Each
            node in VEIN acts as both a token and a heartbeat — producing
            continuous bioflow and adaptive network motion.
          </p>
        </div>
      </div>

      <p className="mt-12 text-xs text-text-dim opacity-70 text-center">
        “The flesh remembers. The grid adapts.”
      </p>
    </main>
  );
}
