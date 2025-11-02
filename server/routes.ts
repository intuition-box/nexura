import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertReferralEventSchema, insertReferralClaimSchema } from "@shared/schema";

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
