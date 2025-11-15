import React from "react";
import { initAppKit } from "./appkit";

// WalletProvider initializes the optional Reown AppKit modal so the modal
// and Wagmi adapter are mounted at the app root. If AppKit isn't available
// the init call no-ops.
export function WalletProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    // initialize AppKit but don't await here to avoid delaying render
    initAppKit().catch((err) => {
      // swallow errors — AppKit is optional
      // eslint-disable-next-line no-console
      console.warn("AppKit init error:", err);
    });
  }, []);

  return <>{children}</>;
}
