import React from "react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { mainnet, goerli } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { w3mProvider } from "@web3modal/ethereum";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";

const projectId = "fb6bea018dee724957900b253ba9683c"; // WalletConnect v2 project id

const chains = [mainnet, goerli];

// Configure chains with public provider and WalletConnect provider (for QR/connect support)
const { publicClient } = configureChains(chains, [w3mProvider({ projectId }), publicProvider()]);

// Create wagmi config with Injected + WalletConnect connectors
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    new InjectedConnector({ chains }),
    new WalletConnectConnector({
      options: {
        projectId,
      },
      chains,
    }),
  ],
  publicClient,
} as any);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={wagmiConfig as any}>
      {children}
    </WagmiConfig>
  );
}
