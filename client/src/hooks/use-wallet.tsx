// Minimal wallet hook. We avoid importing wagmi hooks here so the app doesn't
// fail unless a Wagmi/WagmiConfig is explicitly mounted by the app root.
import { useCallback, useEffect, useState } from "react";
import { createWallet, requestChallenge } from "@/lib/remoteDb";
import { setSessionToken } from "@/lib/session";
import { toast } from "@/hooks/use-toast";
import { openAppKit } from "@/lib/appkit";

type WalletState = {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  chainId?: number | null;
};

const STORAGE_KEY = "nexura:wallet";

export function useWallet() {
  const [state, setState] = useState<WalletState>({ isConnected: false, isConnecting: false, address: null, chainId: null });

  // restore from localStorage if present
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.address) {
          setState({ isConnected: true, isConnecting: false, address: parsed.address, chainId: parsed.chainId ?? null });
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const connectWallet = useCallback(async () => {
    // Try opening AppKit modal first (if available). AppKit handles
    // non-injected wallets (WalletConnect, etc.). We attempt to open it
    // and then wait briefly for an injected provider/account to appear
    // so we can continue with signature verification and remote DB create.
    try {
      await openAppKit();

      // poll for accounts for up to ~8 seconds (check every 500ms)
      const maxAttempts = 16;
      let attempts = 0;
      while (attempts < maxAttempts) {
        const eth = (window as any).ethereum;
        try {
          const accounts: string[] = eth?.request ? await eth.request({ method: "eth_accounts" }) : [];
          if (accounts && accounts.length > 0) {
            // found an account injected by the provider that AppKit connected
            // continue to the normal injected flow below by breaking the loop
            break;
          }
        } catch (e) {
          // ignore and retry
        }
        attempts += 1;
        // small delay
        // eslint-disable-next-line no-await-in-loop
        await new Promise((res) => setTimeout(res, 500));
      }
      // continue — fall through to injected flow attempt
    } catch (err) {
      // openAppKit may noop if AppKit isn't installed — fall back to injected flow.
    }

    const eth = (window as any).ethereum;
    if (!eth || !eth.request) {
      // No injected provider available
      alert("No injected wallet found. Install MetaMask or another Ethereum wallet.");
      return;
    }

    try {
      setState((s) => ({ ...s, isConnecting: true }));

      // request accounts
      const accounts: string[] = await eth.request({ method: "eth_requestAccounts" });
      const address = (accounts && accounts[0]) || null;
      if (!address) throw new Error("No account returned from wallet");

      // get chain id
      const chainHex = await eth.request({ method: "eth_chainId" });
      const chainId = typeof chainHex === "string" ? parseInt(chainHex, 16) : Number(chainHex || 0);

      // Request a server-side challenge message if available (safer nonce)
      let message: string | null = null;
      try {
        const challengeRes: any = await requestChallenge(address);
        if (challengeRes?.message) {
          message = challengeRes.message as string;
        }
      } catch (err) {
        // If server challenge isn't available, fall back to a client-generated nonce
        console.warn("requestChallenge failed, falling back to client nonce:", err);
      }

      if (!message) {
        message = `Nexura Wallet Login\nAddress: ${address}\nNonce: ${Date.now()}`;
      }

      // ask user to sign the message to prove ownership
      let signature: string | null = null;
      try {
        signature = await eth.request({ method: "personal_sign", params: [message, address] });
      } catch (e) {
        // some providers expect reversed params — try again
        try {
          signature = await eth.request({ method: "personal_sign", params: [message, address] });
        } catch (e2) {
          console.warn("Signature request failed", e2);
        }
      }

      // Persist locally
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ address, chainId, signedAt: Date.now(), signedMessage: message, signature }));

      // send to remote DB to create / upsert wallet record (if configured)
      try {
        await createWallet({ address, chainId: chainId ?? 0, provider: "injected", label: "injected", metadata: { signature, signedMessage: message } });
      } catch (err) {
        // non-fatal: log and continue
        console.warn("Failed to create remote wallet record:", err);
      }

      // Attempt server-side verification to obtain an access token (session)
      try {
        const verifyRes = await fetch(`/auth/wallet`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address, signature, message }),
        });
        if (verifyRes.ok) {
          const json = await verifyRes.json().catch(() => ({}));
          // If the server returns an accessToken (back-compat), persist it.
          if (json?.accessToken) {
            setSessionToken(json.accessToken);
          }

          // The server also sets an httpOnly cookie-based session. Notify
          // the app that a session change happened so AuthProvider can
          // immediately fetch /profile without requiring a full page reload.
          try {
            const { emitSessionChange } = await import("@/lib/session");
            emitSessionChange();
          } catch (e) {
            // best-effort: if import/emit fails, ignore
          }

          toast({ title: "Signed in", description: "Session established." });
        }
      } catch (err) {
        console.warn("server verification failed", err);
      }

      setState({ isConnected: true, isConnecting: false, address, chainId });

      // subscribe to account changes
      try {
        eth.on?.("accountsChanged", (accounts: string[]) => {
          if (!accounts || accounts.length === 0) {
            // disconnected
            localStorage.removeItem(STORAGE_KEY);
            setState({ isConnected: false, isConnecting: false, address: null, chainId: null });
          } else {
            setState((s) => ({ ...s, address: accounts[0] }));
          }
        });
        eth.on?.("chainChanged", (hex: string) => {
          const newChain = parseInt(hex, 16);
          setState((s) => ({ ...s, chainId: newChain }));
        });
      } catch (e) {
        // ignore
      }

    } catch (e: any) {
      console.error("connectWallet error", e);
      alert("Failed to connect wallet: " + (e?.message ?? String(e)));
      setState((s) => ({ ...s, isConnecting: false }));
    }
  }, []);

  const disconnect = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    setState({ isConnected: false, isConnecting: false, address: null, chainId: null });
  }, []);

  return {
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    address: state.address,
    chainId: state.chainId,
    connectWallet,
    disconnect,
    connectors: [] as any[],
  } as const;
}
