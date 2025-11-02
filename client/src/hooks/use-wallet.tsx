import { useCallback } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { mainnet, goerli } from "wagmi/chains";
import { useWeb3Modal } from "@web3modal/react";

// Lightweight wrapper around wagmi to keep existing API shape while enabling
// explicit injected connect behavior.
export function useWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isLoading } = useConnect();
  const { disconnect } = useDisconnect();
  // Web3Modal fallback: used if injected connect attempts fail
  const { open } = useWeb3Modal();

  const connectInjected = useCallback(async () => {
    try {
      // Prefer the InjectedConnector instance created in the wagmi config
      // (available via useConnect().connectors). Look it up by id/name so
      // we don't rely on instanceof which can fail across module boundaries.
      const injectedFromConfig = connectors.find((c: any) => {
        const id = (c as any).id ?? "";
        const name = (c as any).name ?? "";
        return id === "injected" || name.toLowerCase().includes("injected") || name.toLowerCase().includes("metamask");
      });

      if (injectedFromConfig) {
        await connect({ connector: injectedFromConfig as any });
        return;
      }

      // If no injected connector instance is available, create one and try.
      try {
        const injected = new InjectedConnector({ chains: [mainnet, goerli] });
        await connect({ connector: injected as any });
        return;
      } catch (e) {
        console.warn("Created InjectedConnector failed, will open Web3Modal", e);
      }

      // Final fallback: open the Web3Modal (WalletConnect / modal) to let
      // the user choose a provider. This uses the web3modal UI with the
      // projectId that's already configured in the app's provider.
      try {
        if (open) open();
      } catch (e) {
        console.warn("Opening Web3Modal failed", e);
      }
    } catch (e) {
      console.error("Injected connect failed", e);
    }
  }, [connect, connectors, open]);

  

  return {
    isConnected,
    address: (address ?? null) as string | null,
    connectInjected,
    disconnect,
    connectors,
    isConnecting: isLoading,
  } as const;
}
