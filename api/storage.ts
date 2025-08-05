import { type User, type InsertUser, type PblSession, type InsertPblSession, users, pblSessions } from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getPblSession(userId: string): Promise<PblSession | undefined>;
  createPblSession(session: InsertPblSession): Promise<PblSession>;
  updatePblSession(id: string, updates: Partial<PblSession>): Promise<PblSession>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private pblSessions: Map<string, PblSession>;

  constructor() {
    this.users = new Map();
    this.pblSessions = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getPblSession(userId: string): Promise<PblSession | undefined> {
    return Array.from(this.pblSessions.values()).find(
      (session) => session.userId === userId,
    );
  }

  async createPblSession(insertSession: InsertPblSession): Promise<PblSession> {
    const id = randomUUID();
    const now = new Date();
    const session: PblSession = {
      id,
      userId: insertSession.userId || null,
      currentStep: insertSession.currentStep || 0,
      responses: insertSession.responses || [],
      createdAt: now,
      updatedAt: now,
    };
    this.pblSessions.set(id, session);
    return session;
  }

  async updatePblSession(id: string, updates: Partial<PblSession>): Promise<PblSession> {
    const session = this.pblSessions.get(id);
    if (!session) {
      throw new Error("Session not found");
    }
    
    const updatedSession: PblSession = {
      ...session,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.pblSessions.set(id, updatedSession);
    return updatedSession;
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  private db;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    const sql = neon(process.env.DATABASE_URL);
    this.db = drizzle(sql);
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getPblSession(userId: string): Promise<PblSession | undefined> {
    const result = await this.db.select().from(pblSessions).where(eq(pblSessions.userId, userId)).limit(1);
    return result[0];
  }

  async createPblSession(insertSession: InsertPblSession): Promise<PblSession> {
    const result = await this.db.insert(pblSessions).values(insertSession).returning();
    return result[0];
  }

  async updatePblSession(id: string, updates: Partial<PblSession>): Promise<PblSession> {
    const result = await this.db.update(pblSessions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(pblSessions.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error("Session not found");
    }
    
    return result[0];
  }
}

// Use database storage in production, memory storage for development
export const storage = process.env.NODE_ENV === 'development' ? new MemStorage() : new DatabaseStorage();
