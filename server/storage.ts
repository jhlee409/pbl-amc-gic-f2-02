import { type User, type InsertUser, type PblSession, type InsertPblSession } from "@shared/schema";
import { randomUUID } from "crypto";

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
      ...insertSession,
      id,
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

export const storage = new MemStorage();
