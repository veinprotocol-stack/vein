"use client";

const organClusters = [
  { name: "Cortex Lattice", pressure: "0.4287", status: "Stable" },
  { name: "Spinal Array", pressure: "0.3912", status: "Rising" },
  { name: "Lymph Channel", pressure: "0.3051", status: "Cooling" },
  { name: "Heart Vein Ring", pressure: "0.5129", status: "Surging" },
  { name: "Nerve Gate Mesh", pressure: "0.4633", status: "Tense" },
];

const eventStream = [
  { label: "Heartbeat", text: "New round resolved — winning node: Nerve Gate." },
  { label: "Injection", text: "User flow routed into central treasury (3.20 SOL)." },
  { label: "Surge", text: "Reward pressure crossed local threshold in Heart Vein." },
  { label: "Drift", text: "Baseline lattice weight increased across outer tissue." },
];

export default function ExplorePage() {
  return (
    <main className="max-w-6xl mx-auto py-14 animate-fadeIn">
      {/* Header */}
      <header className="text-center mb-10">
        <h1 className="text-2xl font-semibold mb-3 tracking-wide text-accent">
          Network Observatory
        </h1>
        <p className="text-text-dim max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
          Watch the synthetic body from above. The observatory surfaces organ-clusters,
          lattice pressure, and recent events so you can feel how VEIN is breathing
          in real time.
        </p>
      </header>

      {/* Top stat strip */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <StatCard
          label="Organ nodes online"
          value="9"
          sub="Simulated organs participating in the current body."
        />
        <StatCard
          label="Active clusters"
          value="3"
          sub="Regions with elevated flow density."
        />
        <StatCard
          label="Surge index"
          value="0.87"
          sub="Synthetic pressure relative to baseline yield."
        />
        <StatCard
          label="24h synthetic volume"
          value="18.42 SOL"
          sub="Cumulative flow routed through the organism."
        />
      </section>

      {/* Middle: lattice map + cluster table */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 mb-10">
        {/* Lattice map mock */}
        <div className="card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-medium text-text-base">Lattice Heatmap</h2>
              <p className="text-[11px] text-text-dim mt-1">
                Stylized view of the 3×3 organ grid. Brighter cells = higher synthetic pressure.
              </p>
            </div>
            <span className="px-2 py-1 rounded-full border border-line text-[10px] uppercase tracking-wide text-text-dim">
              Spectral View • Mock
            </span>
          </div>

          {/* 3×3 pseudo-map */}
          <div className="mt-4 grid grid-cols-3 gap-3 flex-1">
            {[
              "Cortex Node",
              "Spinal Cluster",
              "Lymph Relay",
              "Tendon Bridge",
              "Heart Vein",
              "Nerve Gate",
              "Marrow Core",
              "Optic Basin",
              "Pulmonary Vault",
            ].map((name, i) => (
              <div
                key={name}
                className={[
                  "relative rounded-xl border border-[rgba(255,255,255,0.06)]",
                  "bg-gradient-to-br from-[rgba(255,255,255,0.02)] to-[rgba(255,255,255,0.00)]",
                  i === 4
                    ? "shadow-[0_0_25px_rgba(255,255,255,0.12)] border-accent/70"
                    : "opacity-80",
                ].join(" ")}
              >
                <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.09),transparent_55%)] opacity-60 pointer-events-none" />
                <div className="relative h-full w-full flex flex-col items-center justify-center py-4">
                  <span className="text-[11px] text-text-dim mb-1">{name}</span>
                  <span className="text-xs font-mono">
                    {(0.22 + Math.random() * 0.3).toFixed(4)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-[11px] text-text-dim">
            Live version will pull directly from the mining surface, reflecting organ-node
            weights and recent commits.
          </p>
        </div>

        {/* Cluster pressures */}
        <div className="card p-5 flex flex-col">
          <h2 className="text-sm font-medium text-text-base mb-1">
            Cluster Pressure Table
          </h2>
          <p className="text-[11px] text-text-dim mb-4">
            Synthetic readout of composite regions. Values represent aggregated flow
            density across grouped nodes.
          </p>

          <div className="space-y-2 text-left">
            {organClusters.map((c) => (
              <div
                key={c.name}
                className="flex items-center justify-between py-2 px-2 rounded-lg bg-black/30 border border-line/50"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-medium">{c.name}</span>
                  <span className="text-[11px] text-text-dim">{c.status}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-1.5 rounded-full bg-black/60 overflow-hidden">
                    <div
                      className="h-full bg-accent/70"
                      style={{
                        width: `${40 + Math.random() * 55}%`,
                      }}
                    />
                  </div>
                  <span className="font-mono text-xs">{c.pressure}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-[11px] text-text-dim">
            Future: hook this table to on-chain stats or off-chain indexers for true
            cluster health metrics.
          </p>
        </div>
      </section>

      {/* Bottom: events + anatomy layers */}
      <section className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-6">
        {/* Event stream */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-text-base">Event Stream</h2>
            <span className="text-[10px] px-2 py-1 rounded-full bg-black/40 text-text-dim border border-line/60">
              Live log • Coming soon
            </span>
          </div>

          <div className="space-y-2 text-left">
            {eventStream.map((e, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 py-2 border-b border-line/40 last:border-0"
              >
                <span className="mt-0.5 text-[10px] px-2 py-0.5 rounded-full bg-black/50 text-text-dim border border-line/60">
                  {e.label}
                </span>
                <p className="text-xs text-text-dim leading-relaxed">{e.text}</p>
              </div>
            ))}
          </div>

          <p className="mt-4 text-[11px] text-text-dim">
            On launch, this feed will trail transactions, commits, and notable
            state changes across the organism.
          </p>
        </div>

        {/* Anatomy layers */}
        <div className="card p-5 flex flex-col">
          <h2 className="text-sm font-medium text-text-base mb-2">
            Anatomy Layers
          </h2>
          <p className="text-[11px] text-text-dim mb-4">
            Planned multi-layer explorer for viewing different slices of VEIN’s
            synthetic anatomy.
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs text-left">
            <LayerTag title="Bone" desc="Structural graph — base node topology." />
            <LayerTag title="Myo" desc="Pressure and yield distribution." />
            <LayerTag title="Nerve" desc="Signal routing & event propagation." />
            <LayerTag title="Pulse" desc="Heartbeat timing and surge windows." />
          </div>

          <p className="mt-5 text-[11px] text-text-dim">
            These layers will eventually sync with the mining surface, letting
            you trace how every commit reshapes the body.
          </p>
        </div>
      </section>

      <p className="mt-10 text-center text-[11px] text-text-dim opacity-60">
        “You mine a number. The body feels it.”
      </p>
    </main>
  );
}

/* ——— Little helpers ——— */

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="card px-4 py-3 text-left">
      <div className="text-[11px] text-text-dim mb-1 uppercase tracking-wide">
        {label}
      </div>
      <div className="text-sm font-mono">{value}</div>
      {sub && (
        <p className="mt-1 text-[11px] text-text-dim leading-snug opacity-80">
          {sub}
        </p>
      )}
    </div>
  );
}

function LayerTag({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-lg border border-line/60 bg-black/30 px-3 py-3">
      <div className="text-[11px] font-medium mb-1">{title}</div>
      <p className="text-[11px] text-text-dim leading-snug">{desc}</p>
    </div>
  );
}
