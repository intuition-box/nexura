import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWallet } from "@/hooks/use-wallet";
import { createProject } from "@/lib/remoteDb";
import { ProjectSchema } from "@/schemas/project.schema";
import SignUpPopup from "@/components/SignUpPopup";

export default function Projects() {
  const { isConnected, connectWallet, address } = useWallet();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = ProjectSchema.parse({
        name: title,
        ownerAddress: address ?? "",
        description,
      });

      createProject(payload)
        .then((res) => {
          setTitle("");
          setDescription("");
          alert("Project created — server response received.");
          console.log("createProject response:", res);
        })
        .catch((err) => {
          console.error(err);
          alert("Failed to create project: " + err.message);
        });
    } catch (err: any) {
      alert("Validation error: " + err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Projects (Developer Console)</h1>

      {!isConnected ? (
        <div className="space-y-4">
          <p className="text-muted-foreground">Connect your wallet to create and manage projects.</p>
          <SignUpPopup mode="project" action="signup" />
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">Connected as <code>{address}</code></p>

          <div className="flex gap-2">
            {/* Allow explicit project sign-in (upsert project account) even when wallet is connected */}
            <SignUpPopup mode="project" action="signin" triggerLabel="Project Sign In" />
          </div>

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
