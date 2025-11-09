"use client";

import * as React from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

/** Minimal wrapper that allows styling via className */
export default function ConnectBtn({ className }: { className?: string }) {
  return <WalletMultiButton className={className} />;
}
