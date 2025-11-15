import { 
  type User, 
  type InsertUser,
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
  type InsertProtocolSource
} from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Emergency methods
  createEmergency(emergency: InsertEmergency): Promise<Emergency>;
  getAllEmergencies(): Promise<Emergency[]>;
  getEmergencyById(id: string): Promise<Emergency | undefined>;
  updateEmergencyStatus(id: string, status: string): Promise<Emergency | undefined>;
  
  // Women's Health Awareness methods
  getAllWomensHealthTopics(): Promise<WomensHealthAwareness[]>;
  getWomensHealthTopicById(id: string): Promise<WomensHealthAwareness | undefined>;
  
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
  updateAgentEventStatus(id: string, status: string): Promise<AgentEvent | undefined>;
  
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

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private emergencies: Map<string, Emergency>;
  private womensHealthTopics: Map<string, WomensHealthAwareness>;
  private screeningReminders: Map<string, ScreeningReminder>;
  private agentSessions: Map<string, AgentSession>;
  private agentMessages: Map<string, AgentMessage>;
  private agentEvents: Map<string, AgentEvent>;
  private cachedResponses: Map<string, CachedResponse>;
  private agentStates: Map<string, AgentState>;
  private knowledgeAlerts: Map<string, KnowledgeAlert>;
  private protocolSources: Map<string, ProtocolSource>;

  constructor() {
    this.users = new Map();
    this.emergencies = new Map();
    this.womensHealthTopics = new Map();
    this.screeningReminders = new Map();
    this.agentSessions = new Map();
    this.agentMessages = new Map();
    this.agentEvents = new Map();
    this.cachedResponses = new Map();
    this.agentStates = new Map();
    this.knowledgeAlerts = new Map();
    this.protocolSources = new Map();
    
    // Seed women's health topics
    this.seedWomensHealthTopics();
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
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password,
      role: insertUser.role ?? "patient",
      hospitalId: null
    };
    this.users.set(id, user);
    return user;
  }

  // Emergency methods
  async createEmergency(insertEmergency: InsertEmergency): Promise<Emergency> {
    const id = randomUUID();
    const emergency: Emergency = { 
      id,
      patientId: insertEmergency.patientId ?? null,
      patientName: insertEmergency.patientName,
      patientPhone: insertEmergency.patientPhone,
      location: insertEmergency.location ?? null,
      emergencyType: insertEmergency.emergencyType,
      priority: insertEmergency.priority,
      symptoms: insertEmergency.symptoms,
      status: insertEmergency.status ?? "active",
      assignedHospitalId: insertEmergency.assignedHospitalId ?? null,
      notes: insertEmergency.notes ?? null,
      createdAt: new Date()
    };
    this.emergencies.set(id, emergency);
    return emergency;
  }

  async getAllEmergencies(): Promise<Emergency[]> {
    return Array.from(this.emergencies.values()).sort((a, b) => {
      const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
      if (priorityDiff !== 0) return priorityDiff;
      return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
    });
  }

  async getEmergencyById(id: string): Promise<Emergency | undefined> {
    return this.emergencies.get(id);
  }

  async updateEmergencyStatus(id: string, status: string): Promise<Emergency | undefined> {
    const emergency = this.emergencies.get(id);
    if (!emergency) return undefined;
    
    const updated = { ...emergency, status };
    this.emergencies.set(id, updated);
    return updated;
  }

  // Women's Health Awareness methods
  async getAllWomensHealthTopics(): Promise<WomensHealthAwareness[]> {
    return Array.from(this.womensHealthTopics.values());
  }

  async getWomensHealthTopicById(id: string): Promise<WomensHealthAwareness | undefined> {
    return this.womensHealthTopics.get(id);
  }

  // Screening Reminder methods
  async createScreeningReminder(insertReminder: InsertScreeningReminder): Promise<ScreeningReminder> {
    const id = randomUUID();
    const reminder: ScreeningReminder = {
      id,
      userId: insertReminder.userId,
      topic: insertReminder.topic,
      reminderType: insertReminder.reminderType,
      nextDueDate: insertReminder.nextDueDate,
      frequency: insertReminder.frequency ?? null,
      notificationSent: insertReminder.notificationSent ?? false,
      isEnabled: insertReminder.isEnabled ?? true,
      createdAt: new Date()
    };
    this.screeningReminders.set(id, reminder);
    return reminder;
  }

  async getUserScreeningReminders(userId: string): Promise<ScreeningReminder[]> {
    return Array.from(this.screeningReminders.values())
      .filter(r => r.userId === userId);
  }

  async updateScreeningReminder(id: string, updates: Partial<ScreeningReminder>): Promise<ScreeningReminder | undefined> {
    const reminder = this.screeningReminders.get(id);
    if (!reminder) return undefined;
    
    const updated = { ...reminder, ...updates };
    this.screeningReminders.set(id, updated);
    return updated;
  }

  // Agent Session methods
  async createAgentSession(insertSession: InsertAgentSession): Promise<AgentSession> {
    const id = randomUUID();
    const session: AgentSession = { 
      id, 
      userId: insertSession.userId,
      agent: insertSession.agent,
      status: insertSession.status ?? "active",
      language: insertSession.language ?? "english",
      startedAt: new Date(), 
      endedAt: null 
    };
    this.agentSessions.set(id, session);
    return session;
  }

  async getAgentSession(id: string): Promise<AgentSession | undefined> {
    return this.agentSessions.get(id);
  }

  async getUserAgentSessions(userId: string): Promise<AgentSession[]> {
    return Array.from(this.agentSessions.values()).filter(s => s.userId === userId);
  }

  async updateAgentSession(id: string, updates: Partial<AgentSession>): Promise<AgentSession | undefined> {
    const session = this.agentSessions.get(id);
    if (!session) return undefined;
    const updated = { ...session, ...updates };
    this.agentSessions.set(id, updated);
    return updated;
  }

  // Agent Message methods
  async createAgentMessage(insertMessage: InsertAgentMessage): Promise<AgentMessage> {
    const id = randomUUID();
    const message: AgentMessage = { 
      id,
      sessionId: insertMessage.sessionId,
      senderType: insertMessage.senderType,
      language: insertMessage.language ?? "english",
      content: insertMessage.content,
      reasoningTrace: insertMessage.reasoningTrace ?? null,
      metadata: insertMessage.metadata ?? null,
      createdAt: new Date() 
    };
    this.agentMessages.set(id, message);
    return message;
  }

  async getSessionMessages(sessionId: string): Promise<AgentMessage[]> {
    return Array.from(this.agentMessages.values())
      .filter(m => m.sessionId === sessionId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  // Agent Event methods
  async createAgentEvent(insertEvent: InsertAgentEvent): Promise<AgentEvent> {
    const id = randomUUID();
    const event: AgentEvent = { 
      id,
      type: insertEvent.type,
      payload: insertEvent.payload,
      triggeredByAgent: insertEvent.triggeredByAgent ?? null,
      triggeredBySession: insertEvent.triggeredBySession ?? null,
      status: insertEvent.status ?? "pending",
      createdAt: new Date(), 
      processedAt: null 
    };
    this.agentEvents.set(id, event);
    return event;
  }

  async getAllAgentEvents(): Promise<AgentEvent[]> {
    return Array.from(this.agentEvents.values());
  }

  async getPendingAgentEvents(): Promise<AgentEvent[]> {
    return Array.from(this.agentEvents.values()).filter(e => e.status === "pending");
  }

  async updateAgentEventStatus(id: string, status: string): Promise<AgentEvent | undefined> {
    const event = this.agentEvents.get(id);
    if (!event) return undefined;
    const updated = { ...event, status, processedAt: new Date() };
    this.agentEvents.set(id, updated);
    return updated;
  }

  // Cached Response methods
  async getCachedResponse(keyHash: string): Promise<CachedResponse | undefined> {
    const cached = Array.from(this.cachedResponses.values()).find(c => c.keyHash === keyHash);
    if (cached && cached.expiresAt > new Date()) {
      return cached;
    }
    return undefined;
  }

  async createCachedResponse(insertResponse: InsertCachedResponse): Promise<CachedResponse> {
    const id = randomUUID();
    const response: CachedResponse = { 
      id,
      agent: insertResponse.agent,
      keyHash: insertResponse.keyHash,
      response: insertResponse.response,
      language: insertResponse.language ?? "english",
      expiresAt: insertResponse.expiresAt,
      createdAt: new Date(),
      lastUsedAt: new Date()
    };
    this.cachedResponses.set(id, response);
    return response;
  }

  async updateCachedResponseUsage(keyHash: string): Promise<void> {
    const cached = Array.from(this.cachedResponses.values()).find(c => c.keyHash === keyHash);
    if (cached) {
      cached.lastUsedAt = new Date();
      this.cachedResponses.set(cached.id, cached);
    }
  }

  // Agent State methods
  async getAgentState(sessionId: string): Promise<AgentState | undefined> {
    return Array.from(this.agentStates.values()).find(s => s.sessionId === sessionId);
  }

  async upsertAgentState(insertState: InsertAgentState): Promise<AgentState> {
    const existing = await this.getAgentState(insertState.sessionId);
    if (existing) {
      const updated = { ...existing, state: insertState.state, updatedAt: new Date() };
      this.agentStates.set(existing.id, updated);
      return updated;
    }
    const id = randomUUID();
    const state: AgentState = { id, ...insertState, updatedAt: new Date() };
    this.agentStates.set(id, state);
    return state;
  }

  // Knowledge Alert methods
  async createKnowledgeAlert(insertAlert: InsertKnowledgeAlert): Promise<KnowledgeAlert> {
    const id = randomUUID();
    const alert: KnowledgeAlert = { 
      id,
      alertType: insertAlert.alertType,
      signalDetails: insertAlert.signalDetails,
      severity: insertAlert.severity,
      status: insertAlert.status ?? "new",
      acknowledgedBy: insertAlert.acknowledgedBy ?? null,
      createdAt: new Date(),
      acknowledgedAt: null
    };
    this.knowledgeAlerts.set(id, alert);
    return alert;
  }

  async getAllKnowledgeAlerts(): Promise<KnowledgeAlert[]> {
    return Array.from(this.knowledgeAlerts.values());
  }

  async getNewKnowledgeAlerts(): Promise<KnowledgeAlert[]> {
    return Array.from(this.knowledgeAlerts.values()).filter(a => a.status === "new");
  }

  async updateKnowledgeAlert(id: string, updates: Partial<KnowledgeAlert>): Promise<KnowledgeAlert | undefined> {
    const alert = this.knowledgeAlerts.get(id);
    if (!alert) return undefined;
    const updated = { ...alert, ...updates };
    if (updates.status && updates.status !== "new" && !updated.acknowledgedAt) {
      updated.acknowledgedAt = new Date();
    }
    this.knowledgeAlerts.set(id, updated);
    return updated;
  }

  // Protocol Source methods
  async getAllProtocolSources(): Promise<ProtocolSource[]> {
    return Array.from(this.protocolSources.values());
  }

  async getProtocolSource(id: string): Promise<ProtocolSource | undefined> {
    return this.protocolSources.get(id);
  }

  async createProtocolSource(insertSource: InsertProtocolSource): Promise<ProtocolSource> {
    const id = randomUUID();
    const source: ProtocolSource = { 
      id,
      sourceName: insertSource.sourceName,
      category: insertSource.category,
      url: insertSource.url ?? null,
      content: insertSource.content ?? null,
      checksum: insertSource.checksum ?? null,
      createdAt: new Date(),
      lastSyncedAt: new Date()
    };
    this.protocolSources.set(id, source);
    return source;
  }

  async updateProtocolSource(id: string, updates: Partial<ProtocolSource>): Promise<ProtocolSource | undefined> {
    const source = this.protocolSources.get(id);
    if (!source) return undefined;
    const updated = { ...source, ...updates };
    this.protocolSources.set(id, updated);
    return updated;
  }

  private seedWomensHealthTopics() {
    const topics: Omit<WomensHealthAwareness, "id" | "createdAt">[] = [
      {
        topic: "breast-cancer",
        title: "Breast Cancer Awareness",
        description: "Breast cancer is one of the most common cancers affecting women worldwide. Early detection through regular screening and self-examination can significantly improve treatment outcomes.",
        riskFactors: ["Age (over 50 years)", "Family history of breast cancer", "Personal history of breast conditions", "Early menstruation (before 12) or late menopause", "Never having children or late pregnancy", "Obesity and sedentary lifestyle", "Hormone replacement therapy"],
        preventionTips: ["Perform monthly breast self-examinations", "Get regular mammograms (age 40+)", "Maintain healthy weight through diet and exercise", "Limit alcohol consumption", "Breastfeed if possible", "Avoid prolonged hormone therapy", "Know your family history"],
        resources: ["Pakistan Cancer Society - Breast Cancer Awareness", "Shaukat Khanum Memorial Cancer Hospital", "World Health Organization - Breast Cancer"],
        imageUrl: null
      },
      {
        topic: "cervical-cancer",
        title: "Cervical Cancer Prevention",
        description: "Cervical cancer is preventable through HPV vaccination and regular Pap smear screening. Most cases are caused by Human Papillomavirus (HPV) infection.",
        riskFactors: ["HPV infection", "Multiple sexual partners", "Early sexual activity", "Weakened immune system", "Smoking", "Long-term use of contraceptive pills"],
        preventionTips: ["Get HPV vaccination (ages 9-26)", "Regular Pap smear tests (every 3 years for ages 21-65)", "Practice safe sex", "Quit smoking", "Maintain healthy immune system"],
        resources: ["Pakistan Medical Association - Cervical Cancer Prevention", "WHO HPV Vaccination Program", "Ministry of Health Pakistan"],
        imageUrl: null
      },
      {
        topic: "maternal-health",
        title: "Pregnancy & Maternal Health",
        description: "Proper prenatal care and awareness of warning signs can ensure a healthy pregnancy and safe delivery for both mother and baby.",
        riskFactors: ["Age under 18 or over 35", "Pre-existing conditions (diabetes, hypertension)", "Previous pregnancy complications", "Multiple pregnancies (twins/triplets)", "Obesity or being underweight", "Smoking or substance use"],
        preventionTips: ["Attend all antenatal checkups", "Take prenatal vitamins (folic acid, iron)", "Eat nutritious diet", "Get recommended vaccinations", "Avoid alcohol, smoking, and drugs", "Manage stress and get adequate rest", "Monitor fetal movements"],
        resources: ["Lady Health Workers Program Pakistan", "UNICEF Pakistan - Maternal Health", "Ministry of Health - Mother & Child Care"],
        imageUrl: null
      }
    ];

    topics.forEach(topic => {
      const id = randomUUID();
      this.womensHealthTopics.set(id, {
        ...topic,
        id,
        createdAt: new Date()
      });
    });
  }
}

export const storage = new MemStorage();
