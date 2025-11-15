import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { KeyRound } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { openAppKit } from "@/lib/appkit";
import { createUserFromWallet, createProjectAccount } from "@/lib/remoteDb";

export default function WalletAuthCard({ mode = "user", action = "signin" }: { mode?: "user" | "project"; action?: "signin" | "signup" }) {
  const { connectWallet, address, isConnected } = useWallet();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleConnect() {
    setError(null);
    setLoading(true);
    try {
      // Open modal first (AppKit/Wagmi modal if available)
      try {
        await openAppKit();
      } catch (e) {
        // ignore if not available
      }

      await connectWallet();
      if (!address) throw new Error("No wallet address available");

      // Upsert account depending on mode
      if (mode === "user") {
        await createUserFromWallet({ address, metadata: { createdAt: new Date().toISOString() } } as any);
      } else {
        await createProjectAccount({ address, metadata: { createdAt: new Date().toISOString() } } as any);
      }
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{mode === "project" ? "Project Wallet" : "User Wallet"}</CardTitle>
        <CardDescription>{mode === "project" ? "Sign in as a project account" : "Sign in with your wallet"}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="py-6 flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground">Use your crypto wallet to {action === "signin" ? "sign in" : "sign up"}.</p>
          <Button onClick={handleConnect} size="lg" className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            {loading ? "Working..." : isConnected ? "Use connected wallet" : "Connect Wallet"}
          </Button>
          {error && <div className="text-sm text-red-500">{error}</div>}
        </div>
      </CardContent>
      <CardFooter className="justify-end">
      </CardFooter>
    </Card>
  );
}

export { WalletAuthCard };
