import React, { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";

type Entry = {
  wallet: string;
  xp: number;
};

export default function Leaderboard() {
  const [list, setList] = useState<Entry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("/api/leaderboard")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: Entry[]) => {
        if (!mounted) return;
        data.sort((a, b) => b.xp - a.xp);
        setList(data);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || "Failed to load leaderboard");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className="p-6">Loading leaderboard…</div>;
  if (error) return <div className="p-6">Error loading leaderboard: {error}</div>;
  // If no data, render nothing per request (frontend-only until DB connected)
  if (!list || list.length === 0) return null;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background overflow-auto p-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Leaderboard</h1>
          <ol className="space-y-2">
            {list.map((e, idx) => (
              <li key={e.wallet} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <div className="w-8 text-sm font-bold">#{idx + 1}</div>
                  <div className="font-mono text-sm">{e.wallet}</div>
                </div>
                <div className="text-sm font-medium">{e.xp} xp</div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </AuthGuard>
  );
}
