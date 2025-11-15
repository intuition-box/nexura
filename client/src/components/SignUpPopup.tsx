import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWallet } from "@/hooks/use-wallet";
import { createUserFromWallet, createProjectAccount } from "@/lib/remoteDb";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { KeyRound } from "lucide-react";
import { openAppKit } from "@/lib/appkit";

export default function SignUpPopup({ mode = "user" as "user" | "project", action = "signup" as "signup" | "signin", triggerLabel, }: { mode?: "user" | "project"; action?: "signup" | "signin"; triggerLabel?: string; }) {
  const { connectWallet, address, isConnected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function handleConnectAndCreate() {
    setError(null);
    setLoading(true);
    try {
      // attempt to open the AppKit/Wagmi modal first (if installed)
      try {
        await openAppKit();
      } catch (e) {
        // ignore
      }

      // then attempt the connect flow (use-wallet will handle injected fallback)
      await connectWallet();
      if (!address) {
        throw new Error("No wallet address available after connect");
      }

      // Create a user or project account entry using the remote DB helpers.
      if (mode === "user") {
        await createUserFromWallet({
          address,
          metadata: { createdAt: new Date().toISOString() },
        } as any);
        // auto-close on success
        setOpen(false);
        alert("Account created/updated for user wallet: " + address);
      } else {
        await createProjectAccount({
          address,
          metadata: { createdAt: new Date().toISOString() },
        } as any);
        setOpen(false);
        alert("Project account created/updated for wallet: " + address);
      }
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  const label = triggerLabel ?? (action === "signin" ? (mode === "project" ? "Project Sign In" : "Sign In") : (mode === "project" ? "Project Sign Up" : "Sign Up"));

  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>{label}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{action === "signin" ? (mode === "user" ? "Sign in with wallet" : "Project sign in") : (mode === "user" ? "Sign up with wallet" : "Project Sign up")}</DialogTitle>
          <DialogDescription>
            Connect your wallet to create an account. You can also adjust details after signing up.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4">
          <Card>
            <CardHeader>
              <CardTitle>{mode === "project" ? "Project Wallet" : "User Wallet"}</CardTitle>
              <CardDescription>{mode === "project" ? "Sign in as a project account" : "Sign in as a user"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center gap-4 py-6">
                <p className="text-sm text-muted-foreground">Use your crypto wallet to {action === "signin" ? "sign in" : "sign up"}.</p>
                <Button onClick={handleConnectAndCreate} size="lg" className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5" />
                  {loading ? "Working..." : isConnected ? "Use connected wallet" : "Connect Wallet"}
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="ghost" onClick={() => setOpen(false)}>Exit</Button>
            </CardFooter>
          </Card>
        </div>
        {error && <div className="text-sm text-red-500 mt-2">{error}</div>}
      </DialogContent>
    </Dialog>
  );
}
