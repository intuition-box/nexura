import { WalletSchema, Wallet } from "@/schemas/wallet.schema";
import { ProjectSchema, Project } from "@/schemas/project.schema";
import { UserSchema, type User } from "@/schemas/user.schema";
import getSupabaseClient from "@/lib/supabaseClient";

const WALLETS_BASE = import.meta.env.VITE_WALLETS_API_URL || "";
const PROJECTS_BASE = import.meta.env.VITE_PROJECTS_API_URL || "";

async function safeFetch(url: string, opts: any) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Remote DB error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function createWallet(payload: Wallet) {
  const parsed = WalletSchema.parse(payload);
  // If a Supabase client is available, use it to upsert the wallets table.
  try {
    const supabase = getSupabaseClient;
    if (supabase) {
      // upsert by address
      const { data, error } = await (supabase as any)
        .from("wallets")
        .upsert(parsed, { onConflict: ["address"] })
        .select();
      if (error) throw error;
      return data;
    }
  } catch (err) {
    // fallback to legacy HTTP endpoint
  }

  if (!WALLETS_BASE) throw new Error("VITE_WALLETS_API_URL not configured");
  return safeFetch(`${WALLETS_BASE.replace(/\/$/,"")}/wallets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed),
    credentials: "include",
  });
}

// Request a server-side challenge message for a specific address.
// The backend may expose GET /challenge?address=... or POST /challenge.
export async function requestChallenge(address: string) {
  if (!WALLETS_BASE) throw new Error("VITE_WALLETS_API_URL not configured");
  const base = WALLETS_BASE.replace(/\/$/, "");
  // try GET first
  try {
    return await safeFetch(`${base}/challenge?address=${encodeURIComponent(address)}`, { method: "GET", credentials: "include" });
  } catch (e) {
    // fallback to POST
    return await safeFetch(`${base}/challenge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
      credentials: "include",
    });
  }
}

// Request a server-issued challenge (nonce/message) for the provided address.
// The server should return JSON like: { message: string }
// (duplicate removed - use the fallback-aware `requestChallenge` above)

export async function listWallets() {
  try {
    const supabase = getSupabaseClient;
    if (supabase) {
      const { data, error } = await (supabase as any).from("wallets").select("*");
      if (error) throw error;
      return data;
    }
  } catch (err) {
    // fall back to HTTP
  }
  if (!WALLETS_BASE) throw new Error("VITE_WALLETS_API_URL not configured");
  return safeFetch(`${WALLETS_BASE.replace(/\/$/,"")}/wallets`, { method: "GET", credentials: "include" });
}

// Create or upsert a user record from a wallet signature verification
export async function createUserFromWallet(payload: User) {
  const parsed = UserSchema.parse(payload);
  try {
    const supabase = getSupabaseClient;
    if (supabase) {
      const { data, error } = await (supabase as any).from("users").upsert(parsed, { onConflict: ["address"] }).select();
      if (error) throw error;
      return data;
    }
  } catch (err) {
    // fall back to HTTP if available
  }
  if (!WALLETS_BASE) throw new Error("VITE_WALLETS_API_URL not configured");
  return safeFetch(`${WALLETS_BASE.replace(/\/$/,"")}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed),
    credentials: "include",
  });
}

export async function createProject(payload: Project) {
  const parsed = ProjectSchema.parse(payload);
  if (!PROJECTS_BASE) throw new Error("VITE_PROJECTS_API_URL not configured");
  return safeFetch(`${PROJECTS_BASE.replace(/\/$/,"")}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed),
    credentials: "include",
  });
}

// Create or upsert a project account linked to a wallet address (project-level login)
export async function createProjectAccount(payload: any) {
  // payload should be at minimum { address, chainId?, metadata?: {} }
  try {
    const supabase = getSupabaseClient;
    if (supabase) {
      const parsed = {
        address: payload.address,
        chainId: payload.chainId ?? null,
        metadata: payload.metadata ?? {},
        created_at: new Date().toISOString(),
      };
      // upsert into a `project_accounts` table keyed by address
      const { data, error } = await (supabase as any)
        .from("project_accounts")
        .upsert(parsed, { onConflict: ["address"] })
        .select();
      if (error) throw error;
      return data;
    }
  } catch (err) {
    // fall through to HTTP fallback
  }

  if (!PROJECTS_BASE) throw new Error("VITE_PROJECTS_API_URL not configured");
  return safeFetch(`${PROJECTS_BASE.replace(/\/$/,"")}/accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
}

export async function createCampaign(projectId: string, campaign: any) {
  if (!PROJECTS_BASE) throw new Error("VITE_PROJECTS_API_URL not configured");
  return safeFetch(`${PROJECTS_BASE.replace(/\/$/,"")}/projects/${projectId}/campaigns`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(campaign),
    credentials: "include",
  });
}

export async function createQuest(projectId: string, quest: any) {
  if (!PROJECTS_BASE) throw new Error("VITE_PROJECTS_API_URL not configured");
  return safeFetch(`${PROJECTS_BASE.replace(/\/$/,"")}/projects/${projectId}/quests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(quest),
    credentials: "include",
  });
}
