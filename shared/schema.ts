import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("patient"), // "patient" or "hospital"
  hospitalId: varchar("hospital_id"), // null for patients
  // Profile fields
  fullName: text("full_name"),
  phone: text("phone"),
  cnic: text("cnic"),
  address: text("address"),
  age: integer("age"),
  bloodGroup: text("blood_group"),
  emergencyContact: text("emergency_contact"),
});

export const hospitals = pgTable("hospitals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  type: text("type").notNull(), // "government" or "private"
  facilities: text("facilities").array(), // ["Emergency", "Lab", "Radiology"]
  createdAt: timestamp("created_at").defaultNow(),
});

export const doctors = pgTable("doctors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hospitalId: varchar("hospital_id").notNull(),
  name: text("name").notNull(),
  specialization: text("specialization").notNull(),
  qualification: text("qualification"),
  consultationFee: integer("consultation_fee").notNull(),
  availability: text("availability").notNull(), // JSON string of schedule
  isAvailable: boolean("is_available").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull(),
  hospitalId: varchar("hospital_id").notNull(),
  doctorId: varchar("doctor_id").notNull(),
  appointmentDate: timestamp("appointment_date").notNull(),
  status: text("status").notNull().default("pending"), // "pending", "approved", "completed", "cancelled"
  patientName: text("patient_name").notNull(),
  patientPhone: text("patient_phone").notNull(),
  symptoms: text("symptoms"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const prescriptions = pgTable("prescriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appointmentId: varchar("appointment_id").notNull(),
  patientId: varchar("patient_id").notNull(),
  doctorId: varchar("doctor_id").notNull(),
  hospitalId: varchar("hospital_id").notNull(),
  medications: text("medications").notNull(), // JSON string
  diagnosis: text("diagnosis"),
  instructions: text("instructions"),
  qrCode: text("qr_code"), // QR code data
  isFulfilled: boolean("is_fulfilled").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emergencies = pgTable("emergencies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id"),
  patientName: text("patient_name").notNull(),
  patientPhone: text("patient_phone").notNull(),
  location: text("location"),
  emergencyType: text("emergency_type").notNull(), // "medical", "accident", "trauma", etc.
  priority: text("priority").notNull(), // "critical", "high", "medium", "low"
  symptoms: text("symptoms").notNull(),
  status: text("status").notNull().default("active"), // "active", "responding", "resolved"
  assignedHospitalId: varchar("assigned_hospital_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const womensHealthAwareness = pgTable("womens_health_awareness", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  topic: text("topic").notNull(), // "breast-cancer", "cervical-cancer", "pregnancy", etc.
  title: text("title").notNull(),
  description: text("description").notNull(),
  riskFactors: text("risk_factors").array(),
  preventionTips: text("prevention_tips").array(),
  resources: text("resources").array(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const screeningReminders = pgTable("screening_reminders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  topic: text("topic").notNull(), // "breast-self-exam", "mammogram", "pap-smear", etc.
  reminderType: text("reminder_type").notNull(),
  nextDueDate: timestamp("next_due_date").notNull(),
  frequency: text("frequency"), // "monthly", "yearly", "custom"
  notificationSent: boolean("notification_sent").default(false),
  isEnabled: boolean("is_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Agent System Tables
export const agentSessions = pgTable("agent_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  agent: text("agent").notNull(), // "triage", "eligibility", "facility", "followup", "analytics", "knowledge"
  status: text("status").notNull().default("active"), // "active", "completed", "terminated"
  language: text("language").notNull().default("english"), // "english", "urdu"
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
});

export const agentMessages = pgTable("agent_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  senderType: text("sender_type").notNull(), // "user", "agent", "system"
  language: text("language").notNull().default("english"),
  content: text("content").notNull(),
  reasoningTrace: jsonb("reasoning_trace"), // Store agent's reasoning process
  metadata: jsonb("metadata"), // Additional context (urgency level, confidence scores, etc.)
  createdAt: timestamp("created_at").defaultNow(),
});

export const agentEvents = pgTable("agent_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // "EmergencyCreated", "EligibilityReport", "FacilityRecommended", etc.
  payload: jsonb("payload").notNull(),
  triggeredByAgent: text("triggered_by_agent"), // Which agent triggered this event
  triggeredBySession: varchar("triggered_by_session"),
  status: text("status").notNull().default("pending"), // "pending", "processing", "completed", "failed"
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

export const cachedResponses = pgTable("cached_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agent: text("agent").notNull(),
  keyHash: text("key_hash").notNull().unique(), // Hash of input for cache lookup
  response: jsonb("response").notNull(),
  language: text("language").notNull().default("english"),
  expiresAt: timestamp("expires_at").notNull(),
  lastUsedAt: timestamp("last_used_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const agentState = pgTable("agent_state", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().unique(),
  agent: text("agent").notNull(),
  state: jsonb("state").notNull(), // Current conversation state, context, variables
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const knowledgeAlerts = pgTable("knowledge_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  alertType: text("alert_type").notNull(), // "outbreak", "pattern", "anomaly"
  signalDetails: jsonb("signal_details").notNull(), // What pattern was detected
  severity: text("severity").notNull(), // "low", "medium", "high", "critical"
  status: text("status").notNull().default("new"), // "new", "investigating", "confirmed", "resolved"
  acknowledgedBy: varchar("acknowledged_by"),
  createdAt: timestamp("created_at").defaultNow(),
  acknowledgedAt: timestamp("acknowledged_at"),
});

export const protocolSources = pgTable("protocol_sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sourceName: text("source_name").notNull(), // "WHO", "Pakistan NIH", etc.
  category: text("category").notNull(), // "guidelines", "protocols", "medication", "disease"
  url: text("url"),
  content: text("content"), // Cached protocol content
  checksum: text("checksum"), // For detecting updates
  lastSyncedAt: timestamp("last_synced_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  hospitalId: true,
});

export const insertHospitalSchema = createInsertSchema(hospitals).omit({
  id: true,
  createdAt: true,
});

export const insertDoctorSchema = createInsertSchema(doctors).omit({
  id: true,
  createdAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({
  id: true,
  createdAt: true,
});

export const insertEmergencySchema = createInsertSchema(emergencies).omit({
  id: true,
  createdAt: true,
});

export const insertWomensHealthAwarenessSchema = createInsertSchema(womensHealthAwareness).omit({
  id: true,
  createdAt: true,
});

export const insertScreeningReminderSchema = createInsertSchema(screeningReminders).omit({
  id: true,
  createdAt: true,
});

export const insertAgentSessionSchema = createInsertSchema(agentSessions).omit({
  id: true,
  startedAt: true,
});

export const insertAgentMessageSchema = createInsertSchema(agentMessages).omit({
  id: true,
  createdAt: true,
});

export const insertAgentEventSchema = createInsertSchema(agentEvents).omit({
  id: true,
  createdAt: true,
});

export const insertCachedResponseSchema = createInsertSchema(cachedResponses).omit({
  id: true,
  createdAt: true,
  lastUsedAt: true,
});

export const insertAgentStateSchema = createInsertSchema(agentState).omit({
  id: true,
  updatedAt: true,
});

export const insertKnowledgeAlertSchema = createInsertSchema(knowledgeAlerts).omit({
  id: true,
  createdAt: true,
});

export const insertProtocolSourceSchema = createInsertSchema(protocolSources).omit({
  id: true,
  createdAt: true,
  lastSyncedAt: true,
});

// Frontliners Table (Rescue 1122)
export const frontliners = pgTable("frontliners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  vehicleType: text("vehicle_type"),
  isAvailable: boolean("is_available").default(true),
  currentLat: text("current_lat"),
  currentLng: text("current_lng"),
  lastSeenAt: timestamp("last_seen_at"),
  organization: text("organization"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Emergency Cases Table
export const emergencyCases = pgTable("emergency_cases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  originLat: text("origin_lat").notNull(),
  originLng: text("origin_lng").notNull(),
  assignedToType: text("assigned_to_type"), // 'frontliner' | 'hospital'
  assignedToId: varchar("assigned_to_id"),
  status: text("status").notNull().default("new"), // 'new' | 'assigned' | 'ack' | 'in_progress' | 'completed'
  priority: integer("priority").default(1),
  log: jsonb("log").default(sql`'[]'::jsonb`),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFrontlinerSchema = createInsertSchema(frontliners).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmergencyCaseSchema = createInsertSchema(emergencyCases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertHospital = z.infer<typeof insertHospitalSchema>;
export type Hospital = typeof hospitals.$inferSelect;
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type Doctor = typeof doctors.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;
export type Prescription = typeof prescriptions.$inferSelect;
export type InsertEmergency = z.infer<typeof insertEmergencySchema>;
export type Emergency = typeof emergencies.$inferSelect;
export type InsertWomensHealthAwareness = z.infer<typeof insertWomensHealthAwarenessSchema>;
export type WomensHealthAwareness = typeof womensHealthAwareness.$inferSelect;
export type InsertScreeningReminder = z.infer<typeof insertScreeningReminderSchema>;
export type ScreeningReminder = typeof screeningReminders.$inferSelect;

export type InsertAgentSession = z.infer<typeof insertAgentSessionSchema>;
export type AgentSession = typeof agentSessions.$inferSelect;
export type InsertAgentMessage = z.infer<typeof insertAgentMessageSchema>;
export type AgentMessage = typeof agentMessages.$inferSelect;
export type InsertAgentEvent = z.infer<typeof insertAgentEventSchema>;
export type AgentEvent = typeof agentEvents.$inferSelect;
export type InsertCachedResponse = z.infer<typeof insertCachedResponseSchema>;
export type CachedResponse = typeof cachedResponses.$inferSelect;
export type InsertAgentState = z.infer<typeof insertAgentStateSchema>;
export type AgentState = typeof agentState.$inferSelect;
export type InsertKnowledgeAlert = z.infer<typeof insertKnowledgeAlertSchema>;
export type KnowledgeAlert = typeof knowledgeAlerts.$inferSelect;
export type InsertProtocolSource = z.infer<typeof insertProtocolSourceSchema>;
export type ProtocolSource = typeof protocolSources.$inferSelect;
export type InsertFrontliner = z.infer<typeof insertFrontlinerSchema>;
export type Frontliner = typeof frontliners.$inferSelect;
export type InsertEmergencyCase = z.infer<typeof insertEmergencyCaseSchema>;
export type EmergencyCase = typeof emergencyCases.$inferSelect;
