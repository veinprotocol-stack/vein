// src/app/layout.tsx
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import SolanaWalletProvider from "@/providers/WalletProvider";
import ConnectBtn from "@/components/ConnectBtn";
import VeinBackground from "@/components/VeinBackground";

export const metadata = {
  title: "VEIN",
  description: "Mine every minute.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <body className="body-noise bg-black text-foreground">
        {/* 🔮 Global animated background */}
        <VeinBackground />

        <SolanaWalletProvider>
          {/* Ensure content sits above the fixed background */}
          <div className="relative z-10 max-w-6xl mx-auto px-4 app-root">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-bg/60 backdrop-blur supports-[backdrop-filter]:bg-bg/50">
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-accent" />
                  <span className="font-semibold tracking-wide">VEIN</span>
                </div>

                <nav className="hidden sm:flex items-center gap-6 text-sm text-text-dim">
                  <a href="/mine" className="hover:text-text-base">Mine</a>
                  <a href="/explore" className="hover:text-text-base">Explore</a>
                  <a href="/stake" className="hover:text-text-base">Stake</a>
                  <a href="/about" className="hover:text-text-base">About</a>
                </nav>

                <ConnectBtn className="!bg-panel !border !border-line hover:!border-accent !text-sm !rounded-lg" />
              </div>
              <div className="divider" />
            </header>

            {/* Page */}
            <main className="py-6">{children}</main>
          </div>
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
