"use client";
import { useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function ConnectBtn() {
  // Avoid SSR/client mismatch by rendering only after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <WalletMultiButton className="!bg-panel !border !border-line hover:!border-accent !text-sm !rounded-lg" />
  );
}
