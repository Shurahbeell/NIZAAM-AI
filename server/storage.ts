import { eq, desc, and, gt, inArray, isNull } from "drizzle-orm";
import { db } from "./db";
import { haversineDistanceMeters, parseCoordinate } from "./utils/geo";
import {
  users,
  hospitals,
  doctors,
  appointments,
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
  frontliners,
  emergencyCases,
  medicalHistory,
  medicines,
  type User,
  type InsertUser,
  type Hospital,
  type InsertHospital,
  type Doctor,
  type InsertDoctor,
  type Appointment,
  type InsertAppointment,
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
  type Frontliner,
  type InsertFrontliner,
  type EmergencyCase,
  type InsertEmergencyCase,
  type MedicalHistory,
  type InsertMedicalHistory,
  type Medicines,
  type InsertMedicines,
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(id: string, profileData: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<void>;
  getUsersByRole(role: string): Promise<User[]>;

  // Hospital methods
  getAllHospitals(): Promise<Hospital[]>;
  getHospitalById(id: string): Promise<Hospital | undefined>;
  createHospital(hospital: InsertHospital): Promise<Hospital>;

  // Doctor methods
  getDoctorsByHospital(hospitalId: string): Promise<Doctor[]>;
  getDoctorById(id: string): Promise<Doctor | undefined>;

  // Appointment methods
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointmentById(id: string): Promise<Appointment | undefined>;
  getUserAppointments(patientId: string): Promise<Appointment[]>;
  getUpcomingAppointments(patientId: string): Promise<Appointment[]>;
  getAllAppointments(): Promise<Appointment[]>;
  updateAppointmentStatus(id: string, status: string): Promise<Appointment | undefined>;

  // Emergency methods
  createEmergency(emergency: InsertEmergency): Promise<Emergency>;
  getAllEmergencies(): Promise<Emergency[]>;
  getEmergenciesByHospital(hospitalId: string): Promise<Emergency[]>;
  getEmergenciesByUser(userId: string): Promise<Emergency[]>;
  getEmergencyById(id: string): Promise<Emergency | undefined>;
  updateEmergencyStatus(id: string, status: string, assignedHospitalId?: string): Promise<Emergency | undefined>;
  acknowledgeEmergency(id: string, hospitalId: string): Promise<Emergency | undefined>;

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

  // Frontliner methods
  createFrontliner(frontliner: InsertFrontliner): Promise<Frontliner>;
  getFrontlinerById(id: string): Promise<Frontliner | undefined>;
  getFrontlinerByUserId(userId: string): Promise<Frontliner | undefined>;
  ensureFrontlinerProfile(userId: string): Promise<Frontliner>;
  updateFrontlinerLocation(id: string, lat: string, lng: string, isAvailable?: boolean): Promise<Frontliner | undefined>;
  findNearestFrontliners(lat: string, lng: string, limit?: number): Promise<Array<Frontliner & { distance: number }>>;
  findNearestHospitals(lat: string, lng: string, limit?: number): Promise<Array<Hospital & { distance: number }>>;

  // Emergency Case methods
  createEmergencyCase(emergencyCase: InsertEmergencyCase): Promise<EmergencyCase>;
  getEmergencyCaseById(id: string): Promise<EmergencyCase | undefined>;
  assignEmergencyCase(id: string, assignedToType: string, assignedToId: string): Promise<EmergencyCase | undefined>;
  updateEmergencyCaseStatus(id: string, status: string, log?: any): Promise<EmergencyCase | undefined>;
  getOpenCasesForFrontliner(frontlinerId: string): Promise<EmergencyCase[]>;
  getIncomingEmergencies(hospitalId: string): Promise<any[]>;
  acknowledgeEmergencyCase(id: string, hospitalId: string): Promise<EmergencyCase | undefined>;
  getAllEmergencyCases(): Promise<EmergencyCase[]>;

  // Medical History methods
  createMedicalHistory(history: InsertMedicalHistory): Promise<MedicalHistory>;
  getUserMedicalHistory(userId: string): Promise<MedicalHistory[]>;
  getMedicalHistoryById(id: string): Promise<MedicalHistory | undefined>;

  // Medicines methods
  createMedicine(medicine: InsertMedicines): Promise<Medicines>;
  getUserMedicines(userId: string): Promise<Medicines[]>;
  getMedicineById(id: string): Promise<Medicines | undefined>;
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

  async updateUserProfile(id: string, profileData: Partial<User>): Promise<User | undefined> {
    // Only update profile fields, not password or role
    const allowedFields = {
      fullName: profileData.fullName,
      phone: profileData.phone,
      cnic: profileData.cnic,
      address: profileData.address,
      age: profileData.age,
      bloodGroup: profileData.bloodGroup,
      emergencyContact: profileData.emergencyContact,
    };
    
    // Remove undefined values
    const updateData = Object.fromEntries(
      Object.entries(allowedFields).filter(([_, v]) => v !== undefined)
    );
    
    if (Object.keys(updateData).length === 0) {
      return this.getUser(id);
    }
    
    const result = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
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

  // ==================== DOCTOR METHODS ====================
  async getDoctorsByHospital(hospitalId: string): Promise<Doctor[]> {
    return await db.select().from(doctors).where(eq(doctors.hospitalId, hospitalId));
  }

  async getDoctorById(id: string): Promise<Doctor | undefined> {
    const result = await db.select().from(doctors).where(eq(doctors.id, id));
    return result[0];
  }

  // ==================== APPOINTMENT METHODS ====================
  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const result = await db.insert(appointments).values(appointment).returning();
    return result[0];
  }

  async getAppointmentById(id: string): Promise<Appointment | undefined> {
    const result = await db.select().from(appointments).where(eq(appointments.id, id));
    return result[0];
  }

  async getUserAppointments(patientId: string): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .where(eq(appointments.patientId, patientId))
      .orderBy(desc(appointments.appointmentDate));
  }

  async getUpcomingAppointments(patientId: string): Promise<Appointment[]> {
    const now = new Date();
    return await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.patientId, patientId),
          gt(appointments.appointmentDate, now)
        )
      )
      .orderBy(appointments.appointmentDate)
      .limit(1);
  }

  async getAllAppointments(): Promise<Appointment[]> {
    return await db.select().from(appointments).orderBy(desc(appointments.appointmentDate));
  }

  async updateAppointmentStatus(id: string, status: string): Promise<Appointment | undefined> {
    const result = await db
      .update(appointments)
      .set({ status })
      .where(eq(appointments.id, id))
      .returning();
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

  async acknowledgeEmergency(id: string, hospitalId: string): Promise<Emergency | undefined> {
    const result = await db
      .update(emergencies)
      .set({ 
        acknowledgedByHospitalId: hospitalId,
        acknowledgedAt: new Date()
      })
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

  // ==================== FRONTLINER METHODS ====================
  async createFrontliner(frontliner: InsertFrontliner): Promise<Frontliner> {
    const result = await db.insert(frontliners).values(frontliner).returning();
    return result[0];
  }

  async getFrontlinerById(id: string): Promise<Frontliner | undefined> {
    const result = await db.select().from(frontliners).where(eq(frontliners.id, id));
    return result[0];
  }

  async getFrontlinerByUserId(userId: string): Promise<Frontliner | undefined> {
    const result = await db.select().from(frontliners).where(eq(frontliners.userId, userId));
    return result[0];
  }

  async ensureFrontlinerProfile(userId: string): Promise<Frontliner> {
    const existing = await this.getFrontlinerByUserId(userId);
    if (existing) {
      return existing;
    }

    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const newProfile: InsertFrontliner = {
      userId: userId,
      organization: "Rescue 1122",
      vehicleType: "Ambulance",
      currentLat: "24.8607",
      currentLng: "67.0011",
      isAvailable: true,
    };

    return await this.createFrontliner(newProfile);
  }

  async updateFrontlinerLocation(
    id: string,
    lat: string,
    lng: string,
    isAvailable?: boolean
  ): Promise<Frontliner | undefined> {
    const updateData: any = {
      currentLat: lat,
      currentLng: lng,
      lastSeenAt: new Date(),
      updatedAt: new Date(),
    };
    if (isAvailable !== undefined) {
      updateData.isAvailable = isAvailable;
    }
    const result = await db
      .update(frontliners)
      .set(updateData)
      .where(eq(frontliners.id, id))
      .returning();
    return result[0];
  }

  async findNearestFrontliners(lat: string, lng: string, limit: number = 10): Promise<Array<Frontliner & { distance: number }>> {
    // Get all available frontliners with valid locations
    const allFrontliners = await db
      .select()
      .from(frontliners)
      .where(eq(frontliners.isAvailable, true));

    // Filter out frontliners without location data
    const frontlinersWithLocation = allFrontliners.filter(
      (f) => f.currentLat && f.currentLng
    );

    // Sort by distance using haversine formula
    const originLat = parseCoordinate(lat);
    const originLng = parseCoordinate(lng);

    const frontlinersWithDistance = frontlinersWithLocation.map((f) => {
      const distance = haversineDistanceMeters(
        originLat,
        originLng,
        parseCoordinate(f.currentLat!),
        parseCoordinate(f.currentLng!)
      );
      return { ...f, distance };
    });

    // Sort by distance and return top N
    frontlinersWithDistance.sort((a, b) => a.distance - b.distance);
    return frontlinersWithDistance.slice(0, limit);
  }

  async findNearestHospitals(lat: string, lng: string, limit: number = 10): Promise<Array<Hospital & { distance: number; estimatedLat?: number; estimatedLng?: number }>> {
    // Get all hospitals (filter by emergency facilities if available)
    const allHospitals = await db
      .select()
      .from(hospitals);

    const originLat = parseCoordinate(lat);
    const originLng = parseCoordinate(lng);

    // PRODUCTION TODO: Geocode hospital addresses or add lat/lng fields to schema
    // For MVP: Use realistic distance estimates based on city geography
    // Karachi coordinates: 24.8607°N, 67.0011°E
    const baseHospitalLat = 24.8607;
    const baseHospitalLng = 67.0011;

    const hospitalsWithDistance = allHospitals.map((h, index) => {
      // Distribute hospitals in a 10km radius around Karachi center
      // This is a placeholder - in production, use actual geocoded coordinates
      const angle = (index * 360) / Math.max(allHospitals.length, 1);
      const radiusKm = 3 + Math.random() * 7; // 3-10km from center
      const estimatedLat = baseHospitalLat + (radiusKm / 111) * Math.cos((angle * Math.PI) / 180);
      const estimatedLng = baseHospitalLng + (radiusKm / (111 * Math.cos((baseHospitalLat * Math.PI) / 180))) * Math.sin((angle * Math.PI) / 180);

      // Calculate distance from incident to estimated hospital location
      const distance = haversineDistanceMeters(originLat, originLng, estimatedLat, estimatedLng);

      return { ...h, distance, estimatedLat, estimatedLng };
    });

    // Sort by distance and return top N
    hospitalsWithDistance.sort((a, b) => a.distance - b.distance);
    return hospitalsWithDistance.slice(0, limit);
  }

  // ==================== EMERGENCY CASE METHODS ====================
  async createEmergencyCase(emergencyCase: InsertEmergencyCase): Promise<EmergencyCase> {
    const result = await db.insert(emergencyCases).values(emergencyCase).returning();
    return result[0];
  }

  async getEmergencyCaseById(id: string): Promise<EmergencyCase | undefined> {
    const result = await db.select().from(emergencyCases).where(eq(emergencyCases.id, id));
    return result[0];
  }

  async assignEmergencyCase(
    id: string,
    assignedToType: string,
    assignedToId: string
  ): Promise<EmergencyCase | undefined> {
    const result = await db
      .update(emergencyCases)
      .set({
        assignedToType,
        assignedToId,
        status: "assigned",
        updatedAt: new Date(),
      })
      .where(eq(emergencyCases.id, id))
      .returning();
    return result[0];
  }

  async updateEmergencyCaseStatus(
    id: string,
    status: string,
    log?: any[]
  ): Promise<EmergencyCase | undefined> {
    const updateData: any = { status, updatedAt: new Date() };
    if (log) {
      // Drizzle handles JSONB serialization automatically
      updateData.log = log;
    }
    const result = await db
      .update(emergencyCases)
      .set(updateData)
      .where(eq(emergencyCases.id, id))
      .returning();
    return result[0];
  }

  async getOpenCasesForFrontliner(frontlinerId: string): Promise<any[]> {
    const { emergencies } = await import("@shared/schema");
    const results = await db
      .select({
        id: emergencyCases.id,
        patientId: emergencyCases.patientId,
        patientName: users.fullName,
        originLat: emergencyCases.originLat,
        originLng: emergencyCases.originLng,
        status: emergencyCases.status,
        priority: emergencyCases.priority,
        createdAt: emergencyCases.createdAt,
        updatedAt: emergencyCases.updatedAt,
        emergencyType: emergencies.emergencyType,
        symptoms: emergencies.symptoms,
        notes: emergencies.notes,
      })
      .from(emergencyCases)
      .leftJoin(users, eq(emergencyCases.patientId, users.id))
      .leftJoin(emergencies, eq(emergencyCases.patientId, emergencies.patientId))
      .where(
        and(
          eq(emergencyCases.assignedToType, "frontliner"),
          eq(emergencyCases.assignedToId, frontlinerId),
          inArray(emergencyCases.status, ["new", "assigned", "ack", "in_progress", "completed"])
        )
      )
      .orderBy(desc(emergencyCases.createdAt));
    return results;
  }

  async getAllEmergencyCases(): Promise<EmergencyCase[]> {
    return await db.select().from(emergencyCases).orderBy(desc(emergencyCases.createdAt));
  }

  async getIncomingEmergencies(hospitalId: string): Promise<any[]> {
    const { emergencies } = await import("@shared/schema");
    const results = await db
      .select({
        id: emergencyCases.id,
        patientId: emergencyCases.patientId,
        patientName: users.fullName,
        originLat: emergencyCases.originLat,
        originLng: emergencyCases.originLng,
        status: emergencyCases.status,
        priority: emergencyCases.priority,
        acknowledgedByHospitalId: emergencyCases.acknowledgedByHospitalId,
        acknowledgedAt: emergencyCases.acknowledgedAt,
        createdAt: emergencyCases.createdAt,
        updatedAt: emergencyCases.updatedAt,
        emergencyType: emergencies.emergencyType,
        symptoms: emergencies.symptoms,
        notes: emergencies.notes,
      })
      .from(emergencyCases)
      .leftJoin(users, eq(emergencyCases.patientId, users.id))
      .leftJoin(emergencies, eq(emergencyCases.patientId, emergencies.patientId))
      .where(
        and(
          eq(emergencyCases.assignedToType, "hospital"),
          eq(emergencyCases.assignedToId, hospitalId),
          inArray(emergencyCases.status, ["assigned", "ack", "in_progress"]),
          isNull(emergencyCases.acknowledgedByHospitalId)
        )
      )
      .orderBy(desc(emergencyCases.createdAt));
    return results;
  }

  async acknowledgeEmergencyCase(id: string, hospitalId: string): Promise<EmergencyCase | undefined> {
    const result = await db
      .update(emergencyCases)
      .set({
        acknowledgedByHospitalId: hospitalId,
        acknowledgedAt: new Date()
      })
      .where(eq(emergencyCases.id, id))
      .returning();
    return result[0];
  }

  // ==================== MEDICAL HISTORY METHODS ====================
  async createMedicalHistory(history: InsertMedicalHistory): Promise<MedicalHistory> {
    const result = await db.insert(medicalHistory).values(history).returning();
    return result[0];
  }

  async getUserMedicalHistory(userId: string): Promise<MedicalHistory[]> {
    return await db.select().from(medicalHistory).where(eq(medicalHistory.userId, userId)).orderBy(desc(medicalHistory.createdAt));
  }

  async getMedicalHistoryById(id: string): Promise<MedicalHistory | undefined> {
    const result = await db.select().from(medicalHistory).where(eq(medicalHistory.id, id));
    return result[0];
  }

  // ==================== MEDICINES METHODS ====================
  async createMedicine(medicine: InsertMedicines): Promise<Medicines> {
    const result = await db.insert(medicines).values(medicine).returning();
    return result[0];
  }

  async getUserMedicines(userId: string): Promise<Medicines[]> {
    return await db.select().from(medicines).where(eq(medicines.userId, userId)).orderBy(desc(medicines.createdAt));
  }

  async getMedicineById(id: string): Promise<Medicines | undefined> {
    const result = await db.select().from(medicines).where(eq(medicines.id, id));
    return result[0];
  }
}

export const storage = new DrizzleStorage();
