import { users, scores, type User, type InsertUser, type Score, type InsertScore } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";
import { ships, type ShipId } from "@shared/ships";
import { MAX_AUTHORITATIVE_SCORE } from "./run-authority";

export type Progression = {
  gems: number;
  ownedShips: ShipId[];
  equippedShip: ShipId;
};

export class ProgressionError extends Error {}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createScore(score: InsertScore & { userId: number; runId: string }): Promise<{
    score: Score;
    gemsEarned: number;
    totalGems: number;
    duplicate: boolean;
  }>;
  getTopScores(limit?: number): Promise<(Score & { username: string })[]>;
  getProgression(userId: number): Promise<Progression>;
  purchaseShip(userId: number, shipId: ShipId): Promise<Progression>;
  equipShip(userId: number, shipId: ShipId): Promise<Progression>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createScore(score: InsertScore & { userId: number; runId: string }) {
    if (!Number.isInteger(score.score) || score.score < 0 || score.score > MAX_AUTHORITATIVE_SCORE) {
      throw new ProgressionError("Invalid authoritative score");
    }

    return db.transaction(async (tx) => {
      const [existing] = await tx.select().from(scores).where(and(eq(scores.userId, score.userId), eq(scores.runId, score.runId)));
      const [user] = await tx.select().from(users).where(eq(users.id, score.userId));
      if (!user) throw new ProgressionError("Pilot not found");

      if (existing) {
        return { score: existing, gemsEarned: 0, totalGems: user.gems, duplicate: true };
      }

      const [newScore] = await tx.insert(scores).values(score).returning();
      const gemsEarned = Math.floor(score.score / 10);
      const [updatedUser] = await tx.update(users).set({ gems: sql`${users.gems} + ${gemsEarned}` }).where(eq(users.id, score.userId)).returning();

      return { score: newScore, gemsEarned, totalGems: updatedUser.gems, duplicate: false };
    });
  }

  async getTopScores(limit = 10): Promise<(Score & { username: string })[]> {
    const result = await db.select({
      id: scores.id,
      score: scores.score,
      userId: scores.userId,
      runId: scores.runId,
      username: users.username,
    }).from(scores).innerJoin(users, eq(scores.userId, users.id)).orderBy(desc(scores.score)).limit(limit);
    return result;
  }

  async getProgression(userId: number): Promise<Progression> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) throw new ProgressionError("Pilot not found");
    return this.toProgression(user);
  }

  async purchaseShip(userId: number, shipId: ShipId): Promise<Progression> {
    return db.transaction(async (tx) => {
      const [user] = await tx.select().from(users).where(eq(users.id, userId));
      if (!user) throw new ProgressionError("Pilot not found");
      const ownedShips = this.normalizeOwnedShips(user.ownedShips);
      if (ownedShips.includes(shipId)) throw new ProgressionError("Ship already owned");
      const ship = ships[shipId];
      if (user.gems < ship.price) throw new ProgressionError(`You need ${ship.price.toLocaleString()} gems to unlock this ship`);
      const [updatedUser] = await tx.update(users).set({ gems: user.gems - ship.price, ownedShips: [...ownedShips, shipId] }).where(eq(users.id, userId)).returning();
      return this.toProgression(updatedUser);
    });
  }

  async equipShip(userId: number, shipId: ShipId): Promise<Progression> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) throw new ProgressionError("Pilot not found");
    const ownedShips = this.normalizeOwnedShips(user.ownedShips);
    if (!ownedShips.includes(shipId)) throw new ProgressionError("Purchase this ship before equipping it");
    const [updatedUser] = await db.update(users).set({ equippedShip: shipId }).where(eq(users.id, userId)).returning();
    return this.toProgression(updatedUser);
  }

  private normalizeOwnedShips(value: string[] | null): ShipId[] {
    const validShips = (value || []).filter((ship): ship is ShipId => ship in ships);
    return validShips.includes("vanguard") ? validShips : ["vanguard", ...validShips];
  }

  private toProgression(user: User): Progression {
    const ownedShips = this.normalizeOwnedShips(user.ownedShips);
    const equippedShip = ownedShips.includes(user.equippedShip as ShipId) ? (user.equippedShip as ShipId) : "vanguard";
    return { gems: user.gems, ownedShips, equippedShip };
  }
}

export const storage = new DatabaseStorage();
