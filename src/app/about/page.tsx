"use client";

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto py-10 text-center animate-fadeIn">
      <h1 className="text-2xl font-semibold mb-3 tracking-wide text-accent">About VEIN</h1>
      <p className="text-text-dim max-w-2xl mx-auto leading-relaxed">
        <strong>VEIN</strong> is a synthetic mining protocol — a biomechanical experiment 
        that transforms network participation into living motion. Each user powers an organ-node 
        in a simulated body, syncing to the global heartbeat every minute.
      </p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
        <div className="card p-6">
          <h3 className="font-medium text-accent mb-2">Vision</h3>
          <p className="text-sm text-text-dim leading-relaxed">
            To merge digital infrastructure with organic rhythm — bridging artificial intelligence,
            decentralized systems, and living art.
          </p>
        </div>
        <div className="card p-6">
          <h3 className="font-medium text-accent mb-2">Genesis</h3>
          <p className="text-sm text-text-dim leading-relaxed">
            Born from the ORE lineage, evolved into synthetic flesh. Each node in VEIN is both 
            a token and a heartbeat — producing continuous bioflow.
          </p>
        </div>
      </div>

      <p className="mt-10 text-xs text-text-dim opacity-70">
        “The flesh remembers. The grid adapts.”
      </p>
    </main>
  );
}
