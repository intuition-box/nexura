import React, { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "./queryClient";
import { setSessionToken, clearSession, getSessionToken, onSessionChange } from "./session";
import { toast } from "@/hooks/use-toast";

type User = any;

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signUp: (username: string, referrer?: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to restore session by calling /profile (cookies included). This
    // supports cookie-based sessions even when no client-side token exists.
    async function fetchProfile() {
      try {
        const res = await apiRequest("GET", "/profile");
        const json = await res.json();
        setUser(json?.user ?? json);
      } catch (e) {
        // no session or failed to restore
        console.warn("Could not restore session:", e);
        try {
          clearSession();
        } catch (ee) {
          /* ignore */
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();

    // subscribe to session changes and react accordingly
    const unsub = onSessionChange(async (tok) => {
      // On any session change (token set/cleared), attempt to fetch /profile.
      // This supports cookie-based sessions where no client-side token exists.
      try {
        const res = await apiRequest("GET", "/profile");
        if (res.ok) {
          const json = await res.json();
          setUser(json?.user ?? json);
          toast({ title: "Signed in", description: "Session restored" });
          return;
        }
      } catch (e) {
        // fallthrough to clearing user
        console.warn("failed to fetch profile after session change", e);
      }

      // If fetching profile failed or returned non-OK, clear client user state
      setUser(null);
    });

    return () => unsub();
  }, []);

  async function signUp(username: string, referrer?: string) {
    const payload: any = { username };
    if (referrer) payload.referrer = referrer;

    const res = await apiRequest("POST", "/sign-up", payload);
    const json = await res.json();
    const accessToken = json?.accessToken;
    if (accessToken) {
      try {
        setSessionToken(accessToken);
      } catch (e) {
        console.warn("failed to persist token", e);
      }

      // fetch profile
      try {
        const p = await apiRequest("GET", "/profile");
        const pj = await p.json();
        setUser(pj?.user ?? pj);
      } catch (e) {
        console.warn("failed to fetch profile after signup", e);
      }
    } else {
      throw new Error("no accessToken returned from sign-up");
    }
  }

  function signOut() {
    (async () => {
      try {
        // call server to clear httpOnly cookie/session
        await apiRequest("POST", "/auth/logout");
      } catch (e) {
        // ignore server logout errors, proceed to clear client state
        console.warn("server logout failed", e);
      }

      try {
        clearSession();
      } catch (e) {
        /* ignore */
      }
      setUser(null);
    })();
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export default AuthContext;
