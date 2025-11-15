import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEmergencySchema, insertScreeningReminderSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Emergency routes
  app.post("/api/emergencies", async (req, res) => {
    try {
      const data = insertEmergencySchema.parse(req.body);
      const emergency = await storage.createEmergency(data);
      res.json(emergency);
    } catch (error) {
      res.status(400).json({ error: "Invalid emergency data" });
    }
  });

  app.get("/api/emergencies", async (req, res) => {
    const emergencies = await storage.getAllEmergencies();
    res.json(emergencies);
  });

  app.get("/api/emergencies/:id", async (req, res) => {
    const emergency = await storage.getEmergencyById(req.params.id);
    if (!emergency) {
      return res.status(404).json({ error: "Emergency not found" });
    }
    res.json(emergency);
  });

  app.patch("/api/emergencies/:id/status", async (req, res) => {
    const { status } = req.body;
    const emergency = await storage.updateEmergencyStatus(req.params.id, status);
    if (!emergency) {
      return res.status(404).json({ error: "Emergency not found" });
    }
    res.json(emergency);
  });

  // Women's Health Awareness routes
  app.get("/api/womens-health/topics", async (req, res) => {
    const topics = await storage.getAllWomensHealthTopics();
    res.json(topics);
  });

  app.get("/api/womens-health/topics/:id", async (req, res) => {
    const topic = await storage.getWomensHealthTopicById(req.params.id);
    if (!topic) {
      return res.status(404).json({ error: "Topic not found" });
    }
    res.json(topic);
  });

  // Screening Reminder routes
  app.post("/api/screening-reminders", async (req, res) => {
    try {
      const data = insertScreeningReminderSchema.parse(req.body);
      const reminder = await storage.createScreeningReminder(data);
      res.json(reminder);
    } catch (error) {
      res.status(400).json({ error: "Invalid reminder data" });
    }
  });

  app.get("/api/screening-reminders/:userId", async (req, res) => {
    const reminders = await storage.getUserScreeningReminders(req.params.userId);
    res.json(reminders);
  });

  app.patch("/api/screening-reminders/:id", async (req, res) => {
    const reminder = await storage.updateScreeningReminder(req.params.id, req.body);
    if (!reminder) {
      return res.status(404).json({ error: "Reminder not found" });
    }
    res.json(reminder);
  });

  const httpServer = createServer(app);

  return httpServer;
}
