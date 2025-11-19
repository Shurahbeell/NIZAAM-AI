import { eq, desc, and } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  hospitals,
  emergencies,
  womensHealthAwareness,
  screeningReminders,
  agentSessions,
  agentMessages,
  agentEvents,
  cachedResponses,
  agentState,
  knowledgeAlerts,
  protocolSources,
  type User,
  type InsertUser,
  type Hospital,
  type InsertHospital,
  type Emergency,
  type InsertEmergency,
  type WomensHealthAwareness,
  type InsertWomensHealthAwareness,
  type ScreeningReminder,
  type InsertScreeningReminder,
  type AgentSession,
  type InsertAgentSession,
  type AgentMessage,
  type InsertAgentMessage,
  type AgentEvent,
  type InsertAgentEvent,
  type CachedResponse,
  type InsertCachedResponse,
  type AgentState,
  type InsertAgentState,
  type KnowledgeAlert,
  type InsertKnowledgeAlert,
  type ProtocolSource,
  type InsertProtocolSource,
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Hospital methods
  getAllHospitals(): Promise<Hospital[]>;
  getHospitalById(id: string): Promise<Hospital | undefined>;
  createHospital(hospital: InsertHospital): Promise<Hospital>;

  // Emergency methods
  createEmergency(emergency: InsertEmergency): Promise<Emergency>;
  getAllEmergencies(): Promise<Emergency[]>;
  getEmergenciesByHospital(hospitalId: string): Promise<Emergency[]>;
  getEmergenciesByUser(userId: string): Promise<Emergency[]>;
  getEmergencyById(id: string): Promise<Emergency | undefined>;
  updateEmergencyStatus(id: string, status: string, assignedHospitalId?: string): Promise<Emergency | undefined>;

  // Women's Health Awareness methods
  getAllWomensHealthTopics(): Promise<WomensHealthAwareness[]>;
  getWomensHealthTopicById(id: string): Promise<WomensHealthAwareness | undefined>;
  createWomensHealthTopic(topic: InsertWomensHealthAwareness): Promise<WomensHealthAwareness>;

  // Screening Reminder methods
  createScreeningReminder(reminder: InsertScreeningReminder): Promise<ScreeningReminder>;
  getUserScreeningReminders(userId: string): Promise<ScreeningReminder[]>;
  updateScreeningReminder(id: string, updates: Partial<ScreeningReminder>): Promise<ScreeningReminder | undefined>;

  // Agent Session methods
  createAgentSession(session: InsertAgentSession): Promise<AgentSession>;
  getAgentSession(id: string): Promise<AgentSession | undefined>;
  getUserAgentSessions(userId: string): Promise<AgentSession[]>;
  updateAgentSession(id: string, updates: Partial<AgentSession>): Promise<AgentSession | undefined>;

  // Agent Message methods
  createAgentMessage(message: InsertAgentMessage): Promise<AgentMessage>;
  getSessionMessages(sessionId: string): Promise<AgentMessage[]>;

  // Agent Event methods
  createAgentEvent(event: InsertAgentEvent): Promise<AgentEvent>;
  getAllAgentEvents(): Promise<AgentEvent[]>;
  getPendingAgentEvents(): Promise<AgentEvent[]>;
  updateAgentEventStatus(id: string, status: string, processedAt?: Date): Promise<AgentEvent | undefined>;

  // Cached Response methods
  getCachedResponse(keyHash: string): Promise<CachedResponse | undefined>;
  createCachedResponse(response: InsertCachedResponse): Promise<CachedResponse>;
  updateCachedResponseUsage(keyHash: string): Promise<void>;

  // Agent State methods
  getAgentState(sessionId: string): Promise<AgentState | undefined>;
  upsertAgentState(state: InsertAgentState): Promise<AgentState>;

  // Knowledge Alert methods
  createKnowledgeAlert(alert: InsertKnowledgeAlert): Promise<KnowledgeAlert>;
  getAllKnowledgeAlerts(): Promise<KnowledgeAlert[]>;
  getNewKnowledgeAlerts(): Promise<KnowledgeAlert[]>;
  updateKnowledgeAlert(id: string, updates: Partial<KnowledgeAlert>): Promise<KnowledgeAlert | undefined>;

  // Protocol Source methods
  getAllProtocolSources(): Promise<ProtocolSource[]>;
  getProtocolSource(id: string): Promise<ProtocolSource | undefined>;
  createProtocolSource(source: InsertProtocolSource): Promise<ProtocolSource>;
  updateProtocolSource(id: string, updates: Partial<ProtocolSource>): Promise<ProtocolSource | undefined>;
}

export class DrizzleStorage implements IStorage {
  // ==================== USER METHODS ====================
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  // ==================== HOSPITAL METHODS ====================
  async getAllHospitals(): Promise<Hospital[]> {
    return await db.select().from(hospitals);
  }

  async getHospitalById(id: string): Promise<Hospital | undefined> {
    const result = await db.select().from(hospitals).where(eq(hospitals.id, id));
    return result[0];
  }

  async createHospital(hospital: InsertHospital): Promise<Hospital> {
    const result = await db.insert(hospitals).values(hospital).returning();
    return result[0];
  }

  // ==================== EMERGENCY METHODS ====================
  async createEmergency(emergency: InsertEmergency): Promise<Emergency> {
    const result = await db.insert(emergencies).values(emergency).returning();
    return result[0];
  }

  async getAllEmergencies(): Promise<Emergency[]> {
    return await db.select().from(emergencies).orderBy(desc(emergencies.createdAt));
  }

  async getEmergenciesByHospital(hospitalId: string): Promise<Emergency[]> {
    return await db
      .select()
      .from(emergencies)
      .where(eq(emergencies.assignedHospitalId, hospitalId))
      .orderBy(desc(emergencies.createdAt));
  }

  async getEmergenciesByUser(userId: string): Promise<Emergency[]> {
    return await db
      .select()
      .from(emergencies)
      .where(eq(emergencies.patientId, userId))
      .orderBy(desc(emergencies.createdAt));
  }

  async getEmergencyById(id: string): Promise<Emergency | undefined> {
    const result = await db.select().from(emergencies).where(eq(emergencies.id, id));
    return result[0];
  }

  async updateEmergencyStatus(
    id: string,
    status: string,
    assignedHospitalId?: string
  ): Promise<Emergency | undefined> {
    const updates: any = { status };
    if (assignedHospitalId) {
      updates.assignedHospitalId = assignedHospitalId;
    }

    const result = await db
      .update(emergencies)
      .set(updates)
      .where(eq(emergencies.id, id))
      .returning();
    return result[0];
  }

  // ==================== WOMEN'S HEALTH METHODS ====================
  async getAllWomensHealthTopics(): Promise<WomensHealthAwareness[]> {
    return await db.select().from(womensHealthAwareness);
  }

  async getWomensHealthTopicById(id: string): Promise<WomensHealthAwareness | undefined> {
    const result = await db.select().from(womensHealthAwareness).where(eq(womensHealthAwareness.id, id));
    return result[0];
  }

  async createWomensHealthTopic(topic: InsertWomensHealthAwareness): Promise<WomensHealthAwareness> {
    const result = await db.insert(womensHealthAwareness).values(topic).returning();
    return result[0];
  }

  // ==================== SCREENING REMINDER METHODS ====================
  async createScreeningReminder(reminder: InsertScreeningReminder): Promise<ScreeningReminder> {
    const result = await db.insert(screeningReminders).values(reminder).returning();
    return result[0];
  }

  async getUserScreeningReminders(userId: string): Promise<ScreeningReminder[]> {
    return await db
      .select()
      .from(screeningReminders)
      .where(eq(screeningReminders.userId, userId))
      .orderBy(desc(screeningReminders.nextDueDate));
  }

  async updateScreeningReminder(
    id: string,
    updates: Partial<ScreeningReminder>
  ): Promise<ScreeningReminder | undefined> {
    const result = await db
      .update(screeningReminders)
      .set(updates)
      .where(eq(screeningReminders.id, id))
      .returning();
    return result[0];
  }

  // ==================== AGENT SESSION METHODS ====================
  async createAgentSession(session: InsertAgentSession): Promise<AgentSession> {
    const result = await db.insert(agentSessions).values(session).returning();
    return result[0];
  }

  async getAgentSession(id: string): Promise<AgentSession | undefined> {
    const result = await db.select().from(agentSessions).where(eq(agentSessions.id, id));
    return result[0];
  }

  async getUserAgentSessions(userId: string): Promise<AgentSession[]> {
    return await db
      .select()
      .from(agentSessions)
      .where(eq(agentSessions.userId, userId))
      .orderBy(desc(agentSessions.startedAt));
  }

  async updateAgentSession(
    id: string,
    updates: Partial<AgentSession>
  ): Promise<AgentSession | undefined> {
    const result = await db
      .update(agentSessions)
      .set(updates)
      .where(eq(agentSessions.id, id))
      .returning();
    return result[0];
  }

  // ==================== AGENT MESSAGE METHODS ====================
  async createAgentMessage(message: InsertAgentMessage): Promise<AgentMessage> {
    const result = await db.insert(agentMessages).values(message).returning();
    return result[0];
  }

  async getSessionMessages(sessionId: string): Promise<AgentMessage[]> {
    return await db
      .select()
      .from(agentMessages)
      .where(eq(agentMessages.sessionId, sessionId))
      .orderBy(agentMessages.createdAt);
  }

  // ==================== AGENT EVENT METHODS ====================
  async createAgentEvent(event: InsertAgentEvent): Promise<AgentEvent> {
    const result = await db.insert(agentEvents).values(event).returning();
    return result[0];
  }

  async getAllAgentEvents(): Promise<AgentEvent[]> {
    return await db.select().from(agentEvents).orderBy(desc(agentEvents.createdAt));
  }

  async getPendingAgentEvents(): Promise<AgentEvent[]> {
    return await db
      .select()
      .from(agentEvents)
      .where(eq(agentEvents.status, "pending"))
      .orderBy(agentEvents.createdAt);
  }

  async updateAgentEventStatus(
    id: string,
    status: string,
    processedAt?: Date
  ): Promise<AgentEvent | undefined> {
    const updates: any = { status };
    if (processedAt) {
      updates.processedAt = processedAt;
    }

    const result = await db
      .update(agentEvents)
      .set(updates)
      .where(eq(agentEvents.id, id))
      .returning();
    return result[0];
  }

  // ==================== CACHED RESPONSE METHODS ====================
  async getCachedResponse(keyHash: string): Promise<CachedResponse | undefined> {
    const result = await db
      .select()
      .from(cachedResponses)
      .where(eq(cachedResponses.keyHash, keyHash));
    return result[0];
  }

  async createCachedResponse(response: InsertCachedResponse): Promise<CachedResponse> {
    const result = await db.insert(cachedResponses).values(response).returning();
    return result[0];
  }

  async updateCachedResponseUsage(keyHash: string): Promise<void> {
    await db
      .update(cachedResponses)
      .set({ lastUsedAt: new Date() })
      .where(eq(cachedResponses.keyHash, keyHash));
  }

  // ==================== AGENT STATE METHODS ====================
  async getAgentState(sessionId: string): Promise<AgentState | undefined> {
    const result = await db
      .select()
      .from(agentState)
      .where(eq(agentState.sessionId, sessionId));
    return result[0];
  }

  async upsertAgentState(state: InsertAgentState): Promise<AgentState> {
    const existing = await this.getAgentState(state.sessionId);

    if (existing) {
      const result = await db
        .update(agentState)
        .set({ ...state, updatedAt: new Date() })
        .where(eq(agentState.sessionId, state.sessionId))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(agentState).values(state).returning();
      return result[0];
    }
  }

  // ==================== KNOWLEDGE ALERT METHODS ====================
  async createKnowledgeAlert(alert: InsertKnowledgeAlert): Promise<KnowledgeAlert> {
    const result = await db.insert(knowledgeAlerts).values(alert).returning();
    return result[0];
  }

  async getAllKnowledgeAlerts(): Promise<KnowledgeAlert[]> {
    return await db.select().from(knowledgeAlerts).orderBy(desc(knowledgeAlerts.createdAt));
  }

  async getNewKnowledgeAlerts(): Promise<KnowledgeAlert[]> {
    return await db
      .select()
      .from(knowledgeAlerts)
      .where(eq(knowledgeAlerts.status, "new"))
      .orderBy(desc(knowledgeAlerts.createdAt));
  }

  async updateKnowledgeAlert(
    id: string,
    updates: Partial<KnowledgeAlert>
  ): Promise<KnowledgeAlert | undefined> {
    const result = await db
      .update(knowledgeAlerts)
      .set(updates)
      .where(eq(knowledgeAlerts.id, id))
      .returning();
    return result[0];
  }

  // ==================== PROTOCOL SOURCE METHODS ====================
  async getAllProtocolSources(): Promise<ProtocolSource[]> {
    return await db.select().from(protocolSources).orderBy(desc(protocolSources.lastSyncedAt));
  }

  async getProtocolSource(id: string): Promise<ProtocolSource | undefined> {
    const result = await db.select().from(protocolSources).where(eq(protocolSources.id, id));
    return result[0];
  }

  async createProtocolSource(source: InsertProtocolSource): Promise<ProtocolSource> {
    const result = await db.insert(protocolSources).values(source).returning();
    return result[0];
  }

  async updateProtocolSource(
    id: string,
    updates: Partial<ProtocolSource>
  ): Promise<ProtocolSource | undefined> {
    const result = await db
      .update(protocolSources)
      .set(updates)
      .where(eq(protocolSources.id, id))
      .returning();
    return result[0];
  }
}

export const storage = new DrizzleStorage();
