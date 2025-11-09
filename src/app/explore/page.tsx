"use client";

export default function ExplorePage() {
  return (
    <main className="max-w-5xl mx-auto py-10 text-center animate-fadeIn">
      <h1 className="text-2xl font-semibold mb-3 tracking-wide text-accent">Explore the Network</h1>
      <p className="text-text-dim max-w-xl mx-auto leading-relaxed">
        The synthetic lattice is alive. Nodes pulse across a biomechanical grid where every user 
        interaction feeds data into the Neural Reservoir. Here you can observe live clusters, 
        recent expansions, and experimental offshoots within VEIN.
      </p>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-medium mb-2">Active Nodes</h3>
          <p className="text-text-dim text-sm">See what’s pulsing across the network.</p>
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-medium mb-2">Element Discovery</h3>
          <p className="text-text-dim text-sm">Find rare synthetic materials emerging from the grid.</p>
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-medium mb-2">Historical Layers</h3>
          <p className="text-text-dim text-sm">Review past expansions, forking points, and decay phases.</p>
        </div>
      </div>
    </main>
  );
}
