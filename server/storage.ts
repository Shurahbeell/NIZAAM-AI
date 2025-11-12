import { 
  type User, 
  type InsertUser,
  type Doctor,
  type InsertDoctor,
  type DoctorSchedule,
  type InsertDoctorSchedule,
  type Appointment,
  type InsertAppointment,
  users,
  doctors,
  doctorSchedules,
  appointments
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getDoctorsByDepartment(department: string): Promise<Doctor[]>;
  getDoctor(id: string): Promise<Doctor | undefined>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  
  getDoctorSchedules(doctorId: string): Promise<DoctorSchedule[]>;
  createDoctorSchedule(schedule: InsertDoctorSchedule): Promise<DoctorSchedule>;
  
  getAppointmentsByUser(userId: string): Promise<Array<Appointment & { doctor: Doctor }>>;
  getAppointmentsByDoctor(doctorId: string, date: Date): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getDoctorsByDepartment(department: string): Promise<Doctor[]> {
    return await db.select().from(doctors).where(eq(doctors.department, department));
  }

  async getDoctor(id: string): Promise<Doctor | undefined> {
    const result = await db.select().from(doctors).where(eq(doctors.id, id)).limit(1);
    return result[0];
  }

  async createDoctor(doctor: InsertDoctor): Promise<Doctor> {
    const result = await db.insert(doctors).values(doctor).returning();
    return result[0];
  }

  async getDoctorSchedules(doctorId: string): Promise<DoctorSchedule[]> {
    return await db.select().from(doctorSchedules).where(eq(doctorSchedules.doctorId, doctorId));
  }

  async createDoctorSchedule(schedule: InsertDoctorSchedule): Promise<DoctorSchedule> {
    const result = await db.insert(doctorSchedules).values(schedule).returning();
    return result[0];
  }

  async getAppointmentsByUser(userId: string): Promise<Array<Appointment & { doctor: Doctor }>> {
    const result = await db
      .select({
        id: appointments.id,
        userId: appointments.userId,
        doctorId: appointments.doctorId,
        appointmentDate: appointments.appointmentDate,
        appointmentTime: appointments.appointmentTime,
        status: appointments.status,
        notes: appointments.notes,
        doctor: doctors
      })
      .from(appointments)
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .where(eq(appointments.userId, userId));
    
    return result.map((row: any) => ({
      ...row,
      doctor: row.doctor!
    }));
  }

  async getAppointmentsByDoctor(doctorId: string, date: Date): Promise<Appointment[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, doctorId),
          gte(appointments.appointmentDate, startOfDay),
          lte(appointments.appointmentDate, endOfDay)
        )
      );
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const result = await db.insert(appointments).values(appointment).returning();
    return result[0];
  }
}

export const storage = new DbStorage();
