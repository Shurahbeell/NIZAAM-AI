import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("patient"), // "patient", "hospital", "frontliner", "admin", "lhw"
  isAdmin: boolean("is_admin").default(false),
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
  latitude: text("latitude").notNull(), // GPS latitude
  longitude: text("longitude").notNull(), // GPS longitude
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
  acknowledgedByHospitalId: varchar("acknowledged_by_hospital_id"), // Hospital ID that acknowledged the notification
  acknowledgedAt: timestamp("acknowledged_at"), // When hospital staff acknowledged the notification
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

// Medical History Table
export const medicalHistory = pgTable("medical_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  condition: text("condition").notNull(), // "diabetes", "hypertension", "asthma", etc.
  diagnosisDate: timestamp("diagnosis_date"),
  status: text("status").notNull().default("active"), // "active", "inactive", "resolved"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Medicines Table
export const medicines = pgTable("medicines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  dosage: text("dosage").notNull(), // "500mg", "2 tablets", etc.
  frequency: text("frequency").notNull(), // "twice daily", "once daily", etc.
  reason: text("reason").notNull(), // "Diabetes management", "Blood pressure control", etc.
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
  sideEffects: text("side_effects"),
  createdAt: timestamp("created_at").defaultNow(),
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
  acknowledgedByHospitalId: varchar("acknowledged_by_hospital_id"), // Hospital ID that acknowledged
  acknowledgedAt: timestamp("acknowledged_at"), // When hospital acknowledged
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

export const insertMedicalHistorySchema = createInsertSchema(medicalHistory).omit({
  id: true,
  createdAt: true,
});

export const insertMedicinesSchema = createInsertSchema(medicines).omit({
  id: true,
  createdAt: true,
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
export type InsertMedicalHistory = z.infer<typeof insertMedicalHistorySchema>;
export type MedicalHistory = typeof medicalHistory.$inferSelect;
export type InsertMedicines = z.infer<typeof insertMedicinesSchema>;
export type Medicines = typeof medicines.$inferSelect;

// LHW (Lady Health Worker) Tables
export const lhwAssignments = pgTable("lhw_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lhwId: varchar("lhw_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  householdId: varchar("household_id").notNull(),
  householdName: text("household_name"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  populationServed: integer("population_served").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const lhwReports = pgTable("lhw_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lhwId: varchar("lhw_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  patientId: varchar("patient_id"),
  visitType: text("visit_type").notNull(), // "maternal", "child", "chronic", "vaccination"
  notes: text("notes"),
  vitals: jsonb("vitals"), // {weight, height, bp, temp, etc}
  nextVisitDate: timestamp("next_visit_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const lhwVaccinations = pgTable("lhw_vaccinations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar("child_id").notNull(),
  lhwId: varchar("lhw_id").references(() => users.id, { onDelete: "cascade" }),
  vaccine: text("vaccine").notNull(), // "BCG", "DPT", "Polio", etc
  dueDate: timestamp("due_date").notNull(),
  status: text("status").notNull().default("pending"), // "pending", "completed", "overdue", "missed"
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const lhwInventory = pgTable("lhw_inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lhwId: varchar("lhw_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  itemType: text("item_type").notNull(), // "vaccine", "medicine", "supplies"
  itemName: text("item_name").notNull(),
  quantity: integer("quantity").notNull().default(0),
  minThreshold: integer("min_threshold").default(10),
  reorderStatus: text("reorder_status").default("in_stock"), // "in_stock", "low", "out_of_stock"
  lastRestockedAt: timestamp("last_restocked_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const lhwEducationSessions = pgTable("lhw_education_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lhwId: varchar("lhw_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  topic: text("topic").notNull(), // "maternal-health", "child-nutrition", "family-planning", etc
  audienceSize: integer("audience_size"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas for LHW
export const insertLhwAssignmentSchema = createInsertSchema(lhwAssignments).omit({
  id: true,
  createdAt: true,
});

export const insertLhwReportSchema = createInsertSchema(lhwReports).omit({
  id: true,
  createdAt: true,
});

export const insertLhwVaccinationSchema = createInsertSchema(lhwVaccinations).omit({
  id: true,
  createdAt: true,
});

export const insertLhwInventorySchema = createInsertSchema(lhwInventory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLhwEducationSessionSchema = createInsertSchema(lhwEducationSessions).omit({
  id: true,
  createdAt: true,
});

// Menstrual Hygiene Tables
export const menstrualHygieneStatus = pgTable("menstrual_hygiene_status", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  householdId: varchar("household_id").notNull(),
  lastCycleDate: timestamp("last_cycle_date"),
  usesSafeProducts: boolean("uses_safe_products").default(false),
  notes: text("notes"),
  lhwId: varchar("lhw_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const menstrualPadRequests = pgTable("menstrual_pad_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  householdId: varchar("household_id").notNull(),
  lhwId: varchar("lhw_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  quantityRequested: integer("quantity_requested").notNull(),
  urgencyLevel: text("urgency_level").notNull().default("medium"), // low, medium, high
  status: text("status").notNull().default("pending"), // pending, approved, delivered
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const menstrualEducationSessions = pgTable("menstrual_education_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  householdId: varchar("household_id").notNull(),
  lhwId: varchar("lhw_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  materialsProvided: text("materials_provided").array(), // ["handout_cycles", "safe_products_demo", etc]
  topicsCovered: text("topics_covered").array(), // ["infections", "cycle_tracking", "hygiene"]
  feedbackForm: jsonb("feedback_form"), // {learned: bool, practiced: bool, shared: bool, etc}
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for Menstrual Hygiene
export const insertMenstrualHygieneStatusSchema = createInsertSchema(menstrualHygieneStatus).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMenstrualPadRequestSchema = createInsertSchema(menstrualPadRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMenstrualEducationSessionSchema = createInsertSchema(menstrualEducationSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports
export type InsertLhwAssignment = z.infer<typeof insertLhwAssignmentSchema>;
export type LhwAssignment = typeof lhwAssignments.$inferSelect;
export type InsertLhwReport = z.infer<typeof insertLhwReportSchema>;
export type LhwReport = typeof lhwReports.$inferSelect;
export type InsertLhwVaccination = z.infer<typeof insertLhwVaccinationSchema>;
export type LhwVaccination = typeof lhwVaccinations.$inferSelect;
export type InsertLhwInventory = z.infer<typeof insertLhwInventorySchema>;
export type LhwInventory = typeof lhwInventory.$inferSelect;
export type InsertLhwEducationSession = z.infer<typeof insertLhwEducationSessionSchema>;
export type LhwEducationSession = typeof lhwEducationSessions.$inferSelect;
export type InsertMenstrualHygieneStatus = z.infer<typeof insertMenstrualHygieneStatusSchema>;
export type MenstrualHygieneStatus = typeof menstrualHygieneStatus.$inferSelect;
export type InsertMenstrualPadRequest = z.infer<typeof insertMenstrualPadRequestSchema>;
export type MenstrualPadRequest = typeof menstrualPadRequests.$inferSelect;
export type InsertMenstrualEducationSession = z.infer<typeof insertMenstrualEducationSessionSchema>;
export type MenstrualEducationSession = typeof menstrualEducationSessions.$inferSelect;

// Donations & Community Health Support Tables
export const donationCauses = pgTable("donation_causes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  iconUrl: text("icon_url"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const donationAccounts = pgTable("donation_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountTitle: text("account_title").notNull(),
  bankName: text("bank_name"),
  accountNumber: text("account_number"),
  iban: text("iban"),
  jazzcashNumber: text("jazzcash_number"),
  easypaisaNumber: text("easypaisa_number"),
  qrMediaUrl: text("qr_media_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const donations = pgTable("donations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"), // nullable for anonymous donors
  causeId: varchar("cause_id").notNull().references(() => donationCauses.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(), // in smallest currency unit (cents/paisa)
  paymentMethod: text("payment_method").notNull(), // bank_transfer, jazzcash, easypaisa, cash, etc
  receiptNumber: text("receipt_number"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const supplyRequests = pgTable("supply_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lhwId: varchar("lhw_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  supplyType: text("supply_type").notNull(), // pad, vaccine, medicine, contraceptive, teaching_material, other
  quantity: integer("quantity").notNull(),
  priorityLevel: text("priority_level").notNull().default("medium"), // low, medium, high
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, declined, fulfilled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const donationAllocations = pgTable("donation_allocations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  donationId: varchar("donation_id").notNull().references(() => donations.id, { onDelete: "cascade" }),
  allocatedToType: text("allocated_to_type").notNull(), // lhw, clinic, seminar, general_fund
  allocatedToId: varchar("allocated_to_id"),
  itemType: text("item_type"),
  quantityOrAmount: integer("quantity_or_amount"),
  verifiedByLhw: boolean("verified_by_lhw").default(false),
  verificationMediaUrl: text("verification_media_url"),
  allocatedAt: timestamp("allocated_at").defaultNow(),
});

export const communityEvents = pgTable("community_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location").notNull(),
  eventDate: timestamp("event_date").notNull(),
  causeId: varchar("cause_id").references(() => donationCauses.id, { onDelete: "set null" }),
  expectedAttendance: integer("expected_attendance"),
  sponsoringDonationId: varchar("sponsoring_donation_id").references(() => donations.id, { onDelete: "set null" }),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const supplies = pgTable("supplies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  unit: text("unit").notNull(),
  quantityAvailable: integer("quantity_available").notNull(),
  regionId: varchar("region_id"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for Donations
export const insertDonationCauseSchema = createInsertSchema(donationCauses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDonationAccountSchema = createInsertSchema(donationAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  createdAt: true,
});

export const insertSupplyRequestSchema = createInsertSchema(supplyRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDonationAllocationSchema = createInsertSchema(donationAllocations).omit({
  id: true,
  allocatedAt: true,
});

export const insertCommunityEventSchema = createInsertSchema(communityEvents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupplySchema = createInsertSchema(supplies).omit({
  id: true,
  updatedAt: true,
});

// Type exports for Donations
export type InsertDonationCause = z.infer<typeof insertDonationCauseSchema>;
export type DonationCause = typeof donationCauses.$inferSelect;
export type InsertDonationAccount = z.infer<typeof insertDonationAccountSchema>;
export type DonationAccount = typeof donationAccounts.$inferSelect;
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donations.$inferSelect;
export type InsertSupplyRequest = z.infer<typeof insertSupplyRequestSchema>;
export type SupplyRequest = typeof supplyRequests.$inferSelect;
export type InsertDonationAllocation = z.infer<typeof insertDonationAllocationSchema>;
export type DonationAllocation = typeof donationAllocations.$inferSelect;
export type InsertCommunityEvent = z.infer<typeof insertCommunityEventSchema>;
export type CommunityEvent = typeof communityEvents.$inferSelect;
export type InsertSupply = z.infer<typeof insertSupplySchema>;
export type Supply = typeof supplies.$inferSelect;
