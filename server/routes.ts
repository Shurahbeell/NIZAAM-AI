import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAppointmentSchema } from "@shared/schema";
import { z } from "zod";

function generateTimeSlots(startTime: string, endTime: string, slotDuration: number): string[] {
  const slots: string[] = [];
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  let currentMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  while (currentMinutes < endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const mins = currentMinutes % 60;
    slots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
    currentMinutes += slotDuration;
  }
  
  return slots;
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/doctors", async (req, res) => {
    try {
      const department = req.query.department as string;
      if (!department) {
        return res.status(400).json({ error: "Department is required" });
      }
      
      const doctors = await storage.getDoctorsByDepartment(department);
      res.json(doctors);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      res.status(500).json({ error: "Failed to fetch doctors" });
    }
  });

  app.get("/api/doctors/:doctorId/available-slots", async (req, res) => {
    try {
      const { doctorId } = req.params;
      const dateStr = req.query.date as string;
      
      if (!dateStr) {
        return res.status(400).json({ error: "Date is required" });
      }
      
      const date = new Date(dateStr);
      const dayOfWeek = date.getDay();
      
      const schedules = await storage.getDoctorSchedules(doctorId);
      const daySchedule = schedules.find(s => s.dayOfWeek === dayOfWeek);
      
      if (!daySchedule) {
        return res.json({ availableSlots: [] });
      }
      
      const allSlots = generateTimeSlots(
        daySchedule.startTime,
        daySchedule.endTime,
        daySchedule.slotDuration
      );
      
      const bookedAppointments = await storage.getAppointmentsByDoctor(doctorId, date);
      const bookedTimes = new Set(bookedAppointments.map(apt => apt.appointmentTime));
      
      const availableSlots = allSlots.filter(slot => !bookedTimes.has(slot));
      
      res.json({ availableSlots });
    } catch (error) {
      console.error("Error fetching available slots:", error);
      res.status(500).json({ error: "Failed to fetch available slots" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse({
        ...req.body,
        appointmentDate: new Date(req.body.appointmentDate)
      });
      
      const appointment = await storage.createAppointment(validatedData);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating appointment:", error);
      res.status(500).json({ error: "Failed to create appointment" });
    }
  });

  app.get("/api/appointments", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      const appointments = await storage.getAppointmentsByUser(userId);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
