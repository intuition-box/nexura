/**
 * Reown AppKit initializer.
 *
 * This file dynamically imports `@reown/appkit` and the Wagmi adapter and
 * initializes a singleton modal instance. If the optional packages are not
 * available, functions gracefully noop.
 */

let _modal: any = undefined;

const DEFAULT_PROJECT_ID = "fb6bea018dee724957900b253ba9683c";

export async function initAppKit(projectId?: string) {
  if (typeof window === "undefined") return null;
  if (_modal !== undefined) return _modal;

  try {
    const { createAppKit } = await import("@reown/appkit");
    const { WagmiAdapter } = await import("@reown/appkit-adapter-wagmi");
    const networksModule = await import("@reown/appkit/networks");

    const networks = [] as any[];
    if (networksModule?.mainnet) networks.push(networksModule.mainnet as any);
    if (networksModule?.arbitrum) networks.push(networksModule.arbitrum as any);

  const pid = projectId ?? (window as any).__REOWN_PROJECT_ID ?? DEFAULT_PROJECT_ID;
  const wagmiAdapter = new WagmiAdapter({ projectId: pid, networks });

    const metadata = {
      name: "Nexura",
      description: "Nexura dapp",
      url: typeof window !== "undefined" ? window.location.origin : "https://example.com",
      icons: [],
    } as any;

    _modal = createAppKit({
      adapters: [wagmiAdapter],
      networks: networks as any,
      metadata,
      projectId: pid,
      features: { analytics: true },
    }) as any;

    return _modal;
  } catch (err) {
    // Optional dependency not installed or initialization failed.
    // eslint-disable-next-line no-console
    console.warn("AppKit init failed:", err);
    _modal = null;
    return null;
  }
}

export async function getAppKit() {
  if (_modal !== undefined) return _modal;
  return await initAppKit();
}

export async function openAppKit(projectId?: string) {
  const modal = await initAppKit(projectId);
  if (modal?.open) modal.open();
}

export default { initAppKit, getAppKit, openAppKit };
