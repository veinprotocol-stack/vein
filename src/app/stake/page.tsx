"use client";

export default function StakePage() {
  return (
    <main className="max-w-5xl mx-auto py-10 text-center animate-fadeIn">
      <h1 className="text-2xl font-semibold mb-3 tracking-wide text-accent">Bio-Staking Protocol</h1>
      <p className="text-text-dim max-w-xl mx-auto leading-relaxed">
        Infuse your essence into the network. By staking your assets, you become part of the living tissue, 
        earning steady flow from the bio-circuit and strengthening the synthetic anatomy of VEIN.
      </p>

      <div className="mt-10 flex flex-col sm:flex-row justify-center gap-6">
        <div className="card p-6 w-full sm:w-1/2">
          <h3 className="text-lg font-medium mb-2">Stake</h3>
          <p className="text-text-dim text-sm mb-4">Inject energy into the system and gain periodic yield.</p>
          <button className="commit-btn w-full">Connect Wallet</button>
        </div>
        <div className="card p-6 w-full sm:w-1/2">
          <h3 className="text-lg font-medium mb-2">Unstake</h3>
          <p className="text-text-dim text-sm mb-4">Withdraw your flow and separate from the biomech grid.</p>
          <button className="commit-btn w-full">Unstake</button>
        </div>
      </div>
    </main>
  );
}
