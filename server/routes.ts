import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertReferralEventSchema, insertReferralClaimSchema } from "@shared/schema";
import crypto from "crypto";
import { verifyMessage } from "ethers";

// In-memory stores for challenges and sessions. For production use a persistent store.
const challenges = new Map<string, { message: string; expiresAt: number; used?: boolean }>();
const sessions = new Map<string, { address: string; createdAt: number }>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Referral system routes
  app.get("/api/referrals/stats/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const stats = await storage.getReferralStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching referral stats:", error);
      res.status(500).json({ error: "Failed to fetch referral stats" });
    }
  });

  app.post("/api/referrals/event", async (req, res) => {
    try {
      const validatedData = insertReferralEventSchema.parse(req.body);
      const event = await storage.createReferralEvent(validatedData);
      res.json(event);
    } catch (error) {
      console.error("Error creating referral event:", error);
      res.status(400).json({ error: "Invalid referral event data" });
    }
  });

  app.post("/api/referrals/claim/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const stats = await storage.getReferralStats(userId);
      
      if (stats.claimableRewards <= 0) {
        return res.status(400).json({ error: "No rewards available to claim" });
      }

      const claimData = {
        userId,
        amount: Math.round(stats.claimableRewards * 100), // Store as integer (tTRUST * 100)
        referralCount: stats.totalReferrals,
      };

      const validatedData = insertReferralClaimSchema.parse(claimData);
      const claim = await storage.createReferralClaim(validatedData);
      
      // Return updated stats
      const updatedStats = await storage.getReferralStats(userId);
      res.json({ claim, stats: updatedStats });
    } catch (error) {
      console.error("Error claiming referral rewards:", error);
      res.status(500).json({ error: "Failed to claim rewards" });
    }
  });

  // Wallet auth: issue a challenge message for an address
  app.get("/challenge", async (req, res) => {
    try {
      const address = String(req.query.address || "").trim();
      if (!address) return res.status(400).json({ error: "address required" });
      const nonce = crypto.randomBytes(12).toString("hex");
      const message = `Nexura Wallet Login\nAddress: ${address}\nNonce: ${nonce}`;
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
      challenges.set(address.toLowerCase(), { message, expiresAt });
      return res.json({ message });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "failed to create challenge" });
    }
  });

  app.post("/challenge", async (req, res) => {
    try {
      const { address } = req.body || {};
      if (!address) return res.status(400).json({ error: "address required" });
      const addr = String(address).trim().toLowerCase();
      const nonce = crypto.randomBytes(12).toString("hex");
      const message = `Nexura Wallet Login\nAddress: ${addr}\nNonce: ${nonce}`;
      const expiresAt = Date.now() + 5 * 60 * 1000;
      challenges.set(addr, { message, expiresAt });
      return res.json({ message });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "failed to create challenge" });
    }
  });

  // Verify signature and create a simple session token (returned to client)
  app.post("/auth/wallet", async (req, res) => {
    try {
      const { address, signature, message } = req.body || {};
      if (!address || !signature || !message) return res.status(400).json({ error: "address, signature and message required" });
      const stored = challenges.get(String(address).toLowerCase());
      // Allow either stored challenge or provided message (but prefer stored)
      if (stored) {
        if (stored.used) return res.status(400).json({ error: "challenge already used" });
        if (stored.expiresAt < Date.now()) return res.status(400).json({ error: "challenge expired" });
        if (stored.message !== message) return res.status(400).json({ error: "message mismatch" });
      }

      const recovered = verifyMessage(String(message), String(signature));
      if (recovered.toLowerCase() !== String(address).toLowerCase()) {
        return res.status(401).json({ error: "signature verification failed" });
      }

      // mark challenge used
      if (stored) stored.used = true;

      const token = crypto.randomBytes(32).toString("hex");
      sessions.set(token, { address: String(address).toLowerCase(), createdAt: Date.now() });

      // set httpOnly cookie for session (also return token in body for backwards compatibility)
      const cookieName = process.env.SESSION_COOKIE_NAME || "nexura_sid";
      const isProd = process.env.NODE_ENV === "production";
      const cookieOpts: any = {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        secure: isProd,
      };

      res.cookie(cookieName, token, cookieOpts);

      return res.json({ accessToken: token });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "verification failed" });
    }
  });

  // Logout: clear server-side session and instruct client to remove cookie
  app.post("/auth/logout", async (req, res) => {
    try {
      const cookieHeader = String(req.headers.cookie || "");
      const cookieName = process.env.SESSION_COOKIE_NAME || "nexura_sid";

      // simple cookie parse
      const match = cookieHeader.split(/;\s*/).find((c) => c.startsWith(cookieName + "="));
      if (match) {
        const token = match.split('=')[1];
        if (token && sessions.has(token)) sessions.delete(token);
      }

      // clear cookie on client
      res.clearCookie(cookieName, { path: "/" });
      return res.json({ success: true });
    } catch (err) {
      console.error("logout failed", err);
      return res.status(500).json({ error: "logout failed" });
    }
  });

  // Return profile for authenticated session (cookie-based)
  app.get("/profile", async (req, res) => {
    try {
      const cookieHeader = String(req.headers.cookie || "");
      const cookieName = process.env.SESSION_COOKIE_NAME || "nexura_sid";
      const match = cookieHeader.split(/;\s*/).find((c) => c.startsWith(cookieName + "="));
      if (!match) return res.status(401).json({ error: "not authenticated" });
      const token = match.split("=")[1];
      if (!token) return res.status(401).json({ error: "not authenticated" });
      const s = sessions.get(token);
      if (!s) return res.status(401).json({ error: "invalid session" });

      // Try to fetch user by address from storage
      const user = await storage.getUserByAddress(s.address);
      if (!user) {
        // Authenticated but no user record yet; return empty object so client
        // can render defaults client-side.
        return res.json({});
      }

      return res.json(user);
    } catch (err) {
      console.error("profile error", err);
      return res.status(500).json({ error: "failed to fetch profile" });
    }
  });

  const httpServer = createServer(app);

  // Simple leaderboard endpoint (mocked). In a production app this would query storage/db.
  // Leaderboard endpoint: when DB/backend not ready, return 204 No Content so frontend doesn't show demo data
  app.get("/api/leaderboard", async (req, res) => {
    try {
      // TODO: replace with real storage/db query when backend is ready.
      // For now return 204 to indicate no content (frontend will render nothing).
      res.status(204).end();
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  return httpServer;
}
