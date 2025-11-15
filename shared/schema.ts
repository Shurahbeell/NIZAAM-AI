import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("patient"), // "patient" or "hospital"
  hospitalId: varchar("hospital_id"), // null for patients
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

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
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
