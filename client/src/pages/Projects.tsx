import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWallet } from "@/hooks/use-wallet";
import { useAccount } from "wagmi";

export default function Projects() {
  const { isConnected, connectInjected } = useWallet();
  const { address } = useAccount();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API to create a project/campaign
    console.log("Create project", { title, description, createdBy: address });
    setTitle("");
    setDescription("");
    alert("Project created (stub) — check console");
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Projects (Developer Console)</h1>

      {!isConnected ? (
        <div className="space-y-4">
          <p className="text-muted-foreground">Sign in with your wallet to create and manage projects.</p>
          <Button onClick={() => connectInjected()}>Sign in with Wallet</Button>
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">Connected as <code>{address}</code></p>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Project Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>

            <div className="flex items-center gap-2">
              <Button type="submit">Create Project</Button>
              <Button variant="ghost" onClick={() => { setTitle(""); setDescription(""); }}>Reset</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
