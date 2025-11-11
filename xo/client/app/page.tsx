"use client";

import { ConnectButton } from "@mysten/dapp-kit";

export default function Home() {
  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10">
        <ConnectButton />
      </div>
    </div>
  );
}
