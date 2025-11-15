import { Router, type Request, Response } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import {
  insertEmergencySchema,
  insertAgentSessionSchema
} from "@shared/schema";

const router = Router();

// ==================== AGENT ROUTES ====================

// Create new agent session
router.post("/api/agent/sessions", async (req: Request, res: Response) => {
  try {
    const data = insertAgentSessionSchema.parse(req.body);
    const session = await storage.createAgentSession(data);
    res.json(session);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get agent session
router.get("/api/agent/sessions/:id", async (req: Request, res: Response) => {
  try {
    const session = await storage.getAgentSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.json(session);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Send message to agent
router.post("/api/agent/chat", async (req: Request, res: Response) => {
  try {
    const { sessionId, agentName, message, language = "english" } = req.body;
    
    if (!sessionId || !agentName || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Import agentRegistry dynamically to avoid circular dependency
    const { agentRegistry } = await import("./mcp/index");
    
    // Route to appropriate agent
    const response = await agentRegistry.routeMessage(
      agentName,
      sessionId,
      message,
      language
    );
    
    res.json({ response });
  } catch (error: any) {
    console.error("[Routes] Agent chat error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get conversation history
router.get("/api/agent/messages/:sessionId", async (req: Request, res: Response) => {
  try {
    const messages = await storage.getSessionMessages(req.params.sessionId);
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get agent events
router.get("/api/agent/events/:sessionId", async (req: Request, res: Response) => {
  try {
    const events = await storage.getAllAgentEvents();
    // Filter by session if sessionId provided
    const sessionEvents = events.filter(e => 
      e.triggeredBySession === req.params.sessionId
    );
    res.json(sessionEvents);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== EMERGENCY ROUTES ====================

// Get all emergencies
router.get("/api/emergencies", async (_req: Request, res: Response) => {
  const emergencies = await storage.getAllEmergencies();
  res.json(emergencies);
});

// Get emergency by ID
router.get("/api/emergencies/:id", async (req: Request, res: Response) => {
  const emergency = await storage.getEmergencyById(req.params.id);
  if (!emergency) {
    return res.status(404).json({ error: "Emergency not found" });
  }
  res.json(emergency);
});

// Create emergency
router.post("/api/emergencies", async (req: Request, res: Response) => {
  try {
    const data = insertEmergencySchema.parse(req.body);
    const emergency = await storage.createEmergency(data);
    res.json(emergency);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update emergency status
router.patch("/api/emergencies/:id", async (req: Request, res: Response) => {
  try {
    const emergency = await storage.updateEmergencyStatus(
      req.params.id,
      req.body.status
    );
    res.json(emergency);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== WOMEN'S HEALTH ROUTES ====================

// Get all women's health topics
router.get("/api/womens-health", async (_req: Request, res: Response) => {
  const topics = await storage.getAllWomensHealthTopics();
  res.json(topics);
});

// Get women's health topic by ID
router.get("/api/womens-health/:id", async (req: Request, res: Response) => {
  const topic = await storage.getWomensHealthTopicById(req.params.id);
  if (!topic) {
    return res.status(404).json({ error: "Topic not found" });
  }
  res.json(topic);
});

// ==================== SCREENING REMINDER ROUTES ====================

// Get user's screening reminders
router.get("/api/screening-reminders/:userId", async (req: Request, res: Response) => {
  const reminders = await storage.getUserScreeningReminders(req.params.userId);
  res.json(reminders);
});

// Create screening reminder
router.post("/api/screening-reminders", async (req: Request, res: Response) => {
  try {
    const reminder = await storage.createScreeningReminder(req.body);
    res.json(reminder);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update screening reminder
router.patch("/api/screening-reminders/:id", async (req: Request, res: Response) => {
  try {
    const reminder = await storage.updateScreeningReminder(
      req.params.id,
      req.body
    );
    res.json(reminder);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

// Export registerRoutes for server/index.ts
export async function registerRoutes(app: any) {
  app.use(router);
  return createServer(app);
}
