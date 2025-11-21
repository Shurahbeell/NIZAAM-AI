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

// ==================== MCP FACILITY SEARCH ====================

// Search facilities using AI agent
router.post("/api/mcp/facility/search", async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, language = "english" } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: "Missing latitude or longitude" });
    }
    
    // Determine city from coordinates (simple approximation)
    let city = "Lahore"; // Default
    if (latitude > 24 && latitude < 25 && longitude > 66 && longitude < 68) {
      city = "Karachi";
    } else if (latitude > 33 && latitude < 34 && longitude > 72 && longitude < 74) {
      city = "Islamabad";
    }
    
    // Import agentRegistry dynamically
    const { agentRegistry } = await import("./mcp/index");
    
    // Create search message for Facility Finder agent
    const searchMessage = language === "urdu" 
      ? `${city} mein mere qareeb tarin sehat ki sahooliyat talaash karen.`
      : `Find nearby healthcare facilities in ${city}.`;
    
    // Route to Facility Finder agent (returns text response)
    await agentRegistry.routeMessage(
      "facility",
      "facility-search-session",
      searchMessage,
      language
    );
    
    // Return mock facilities filtered by city for now
    // TODO: Extract structured data from agent response in future
    const mockFacilities = [
      {
        id: 1,
        name: "Jinnah Hospital",
        lat: 31.4827,
        lng: 74.3145,
        type: "Teaching Hospital",
        isOpen: true,
        phone: "+92 42 111 222 333",
        address: "Ferozepur Road, Lahore",
        city: "Lahore"
      },
      {
        id: 2,
        name: "Services Hospital",
        lat: 31.5050,
        lng: 74.3293,
        type: "Government Hospital",
        isOpen: true,
        phone: "+92 42 111 222 444",
        address: "Jail Road, Lahore",
        city: "Lahore"
      },
      {
        id: 3,
        name: "Model Town BHU",
        lat: 31.4835,
        lng: 74.3278,
        type: "Basic Health Unit",
        isOpen: true,
        phone: "+92 42 111 222 555",
        address: "Model Town, Lahore",
        city: "Lahore"
      },
      {
        id: 4,
        name: "Agha Khan Hospital Karachi",
        lat: 24.8967,
        lng: 67.0650,
        type: "Private Hospital",
        isOpen: true,
        phone: "+92 21 111 911 911",
        address: "Stadium Road, Karachi",
        city: "Karachi"
      },
      {
        id: 5,
        name: "PIMS Hospital Islamabad",
        lat: 33.7093,
        lng: 73.0722,
        type: "Teaching Hospital",
        isOpen: true,
        phone: "+92 51 111 222 666",
        address: "G-8/3, Islamabad",
        city: "Islamabad"
      },
      {
        id: 6,
        name: "CityMed Pharmacy",
        lat: 31.5651,
        lng: 74.3098,
        type: "Pharmacy",
        isOpen: true,
        phone: "+92 42 111 333 111",
        address: "Mall Road, Lahore",
        city: "Lahore"
      },
      {
        id: 7,
        name: "Health Plus Drug Store",
        lat: 31.5204,
        lng: 74.3587,
        type: "Pharmacy",
        isOpen: true,
        phone: "+92 42 111 333 222",
        address: "Gulberg III, Lahore",
        city: "Lahore"
      },
      {
        id: 8,
        name: "MediCare Pharmacy",
        lat: 31.4697,
        lng: 74.2728,
        type: "Pharmacy",
        isOpen: true,
        phone: "+92 42 111 333 333",
        address: "DHA Phase 5, Lahore",
        city: "Lahore"
      },
      {
        id: 9,
        name: "Fazal Din Pharmacy",
        lat: 24.8700,
        lng: 67.0631,
        type: "Pharmacy",
        isOpen: true,
        phone: "+92 21 111 444 111",
        address: "Tariq Road, Karachi",
        city: "Karachi"
      },
      {
        id: 10,
        name: "D. Watson Pharmacy Karachi",
        lat: 24.9056,
        lng: 67.0822,
        type: "Pharmacy",
        isOpen: true,
        phone: "+92 21 111 444 222",
        address: "Clifton Block 5, Karachi",
        city: "Karachi"
      },
      {
        id: 11,
        name: "MedLife Pharmacy",
        lat: 33.7077,
        lng: 73.0469,
        type: "Pharmacy",
        isOpen: true,
        phone: "+92 51 111 555 111",
        address: "Blue Area, Islamabad",
        city: "Islamabad"
      },
      {
        id: 12,
        name: "Sehat Pharmacy",
        lat: 33.6995,
        lng: 73.0363,
        type: "Pharmacy",
        isOpen: true,
        phone: "+92 51 111 555 222",
        address: "F-7 Markaz, Islamabad",
        city: "Islamabad"
      }
    ];
    
    const filteredFacilities = mockFacilities.filter(f => f.city === city);
    res.json({ facilities: filteredFacilities });
  } catch (error: any) {
    console.error("[Routes] Facility search error:", error);
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
