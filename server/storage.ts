import { type User, type InsertUser, type ReferralEvent, type InsertReferralEvent, type ReferralClaim, type InsertReferralClaim, type ReferralStats } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByAddress(address: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Referral system methods
  createReferralEvent(event: InsertReferralEvent): Promise<ReferralEvent>;
  getReferralEventsByReferrer(referrerId: string): Promise<ReferralEvent[]>;
  createReferralClaim(claim: InsertReferralClaim): Promise<ReferralClaim>;
  getReferralClaimsByUser(userId: string): Promise<ReferralClaim[]>;
  getReferralStats(userId: string): Promise<ReferralStats>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private referralEvents: Map<string, ReferralEvent>;
  private referralClaims: Map<string, ReferralClaim>;

  constructor() {
    this.users = new Map();
    this.referralEvents = new Map();
    this.referralClaims = new Map();
    
    // Seed test data
    this.seedTestData();
  }

  private seedTestData() {
    // Create mock referral events for user-123
    const userId = "user-123";
    
    // Add 7 referral events to show realistic data
    for (let i = 1; i <= 7; i++) {
      const eventId = randomUUID();
      const event: ReferralEvent = {
        id: eventId,
        referrerUserId: userId,
        referredUserId: `referred-user-${i}`,
        createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)), // Spread over past days
      };
      this.referralEvents.set(eventId, event);
    }

    // Add one claim for the first 3 referrals (1 tTRUST)
    const claimId = randomUUID();
    const claim: ReferralClaim = {
      id: claimId,
      userId: userId,
      amount: 100, // 1 tTRUST = 100 (stored as integer)
      referralCount: 3,
      createdAt: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000)), // 2 days ago
    };
    this.referralClaims.set(claimId, claim);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByAddress(address: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => (user as any).address?.toLowerCase() === address?.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createReferralEvent(insertEvent: InsertReferralEvent): Promise<ReferralEvent> {
    const id = randomUUID();
    const event: ReferralEvent = {
      ...insertEvent,
      id,
      createdAt: new Date(),
    };
    this.referralEvents.set(id, event);
    return event;
  }

  async getReferralEventsByReferrer(referrerId: string): Promise<ReferralEvent[]> {
    return Array.from(this.referralEvents.values()).filter(
      (event) => event.referrerUserId === referrerId,
    );
  }

  async createReferralClaim(insertClaim: InsertReferralClaim): Promise<ReferralClaim> {
    const id = randomUUID();
    const claim: ReferralClaim = {
      ...insertClaim,
      id,
      createdAt: new Date(),
    };
    this.referralClaims.set(id, claim);
    return claim;
  }

  async getReferralClaimsByUser(userId: string): Promise<ReferralClaim[]> {
    return Array.from(this.referralClaims.values()).filter(
      (claim) => claim.userId === userId,
    );
  }

  async getReferralStats(userId: string): Promise<ReferralStats> {
    const referralEvents = await this.getReferralEventsByReferrer(userId);
    const referralClaims = await this.getReferralClaimsByUser(userId);
    
    const totalReferrals = referralEvents.length;
    
    // Calculate total earned from claims (amount is stored as tTRUST * 100)
    const totalEarned = referralClaims.reduce((sum, claim) => sum + claim.amount, 0) / 100;
    
    // Calculate claimable rewards based on milestones
    // 3 referrals = 1 tTRUST (100), 10 referrals = 1.5 tTRUST (150)
    let earnedFromMilestones = 0;
    if (totalReferrals >= 10) {
      earnedFromMilestones = Math.floor(totalReferrals / 10) * 150; // 1.5 tTRUST per 10 referrals
      const remainder = totalReferrals % 10;
      if (remainder >= 3) {
        earnedFromMilestones += Math.floor(remainder / 3) * 100; // 1 tTRUST per 3 referrals
      }
    } else if (totalReferrals >= 3) {
      earnedFromMilestones = Math.floor(totalReferrals / 3) * 100; // 1 tTRUST per 3 referrals
    }
    
    const totalClaimed = referralClaims.reduce((sum, claim) => sum + claim.amount, 0);
    const claimableRewards = Math.max(0, earnedFromMilestones - totalClaimed) / 100;
    
    return {
      totalReferrals,
      totalEarned,
      claimableRewards,
      referralLink: `https://nexura.com/ref/${userId}`,
    };
  }
}

export const storage = new MemStorage();
