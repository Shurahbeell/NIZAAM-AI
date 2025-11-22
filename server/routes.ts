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

// ==================== APPOINTMENT ROUTES ====================

// Get next upcoming appointment for a user
router.get("/api/appointments/next/:patientId", async (req: Request, res: Response) => {
  try {
    const appointments = await storage.getUpcomingAppointments(req.params.patientId);
    const nextAppointment = appointments[0] || null;
    res.json(nextAppointment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all appointments for a user
router.get("/api/appointments/user/:patientId", async (req: Request, res: Response) => {
  try {
    const appointments = await storage.getUserAppointments(req.params.patientId);
    res.json(appointments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get appointment by ID
router.get("/api/appointments/:id", async (req: Request, res: Response) => {
  try {
    const appointment = await storage.getAppointmentById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.json(appointment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all appointments (admin only)
router.get("/api/appointments", async (_req: Request, res: Response) => {
  try {
    const appointments = await storage.getAllAppointments();
    res.json(appointments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create appointment
router.post("/api/appointments", async (req: Request, res: Response) => {
  try {
    const { insertAppointmentSchema } = await import("@shared/schema");
    
    // Convert appointmentDate string to Date if needed
    let data = req.body;
    if (typeof data.appointmentDate === "string") {
      data = {
        ...data,
        appointmentDate: new Date(data.appointmentDate)
      };
    }
    
    const validated = insertAppointmentSchema.parse(data);
    const appointment = await storage.createAppointment(validated);
    res.json(appointment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update appointment status
router.patch("/api/appointments/:id", async (req: Request, res: Response) => {
  try {
    const appointment = await storage.updateAppointmentStatus(req.params.id, req.body.status);
    res.json(appointment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get appointments for a hospital (hospital staff only)
router.get("/api/hospital/:hospitalId/appointments", async (req: Request, res: Response) => {
  try {
    const appointments = await storage.getAllAppointments();
    // Filter appointments for this hospital
    const hospitalAppointments = appointments.filter(a => a.hospitalId === req.params.hospitalId);
    res.json(hospitalAppointments);
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

// Acknowledge incoming emergency notification (hospital staff)
router.patch("/api/emergencies/:id/acknowledge", async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.body;
    if (!hospitalId) {
      return res.status(400).json({ error: "hospitalId is required" });
    }
    const emergency = await storage.acknowledgeEmergency(req.params.id, hospitalId);
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

// ==================== MEDICAL HISTORY ====================
router.get("/api/medical-history/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const history = await storage.getUserMedicalHistory(userId);
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/medical-history", async (req: Request, res: Response) => {
  try {
    const { insertMedicalHistorySchema } = await import("@shared/schema");
    const validated = insertMedicalHistorySchema.parse(req.body);
    const history = await storage.createMedicalHistory(validated);
    res.json(history);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== MEDICINES ====================
router.get("/api/medicines/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const medicines = await storage.getUserMedicines(userId);
    res.json(medicines);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/medicines", async (req: Request, res: Response) => {
  try {
    const { insertMedicinesSchema } = await import("@shared/schema");
    const validated = insertMedicinesSchema.parse(req.body);
    const medicine = await storage.createMedicine(validated);
    res.json(medicine);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== EMERGENCY CASES (EMERGENCY CALLS) ====================
router.post("/api/emergency-cases", async (req: Request, res: Response) => {
  try {
    const { insertEmergencyCaseSchema } = await import("@shared/schema");
    const data = req.body;
    
    // Convert coordinates if needed
    const validated = insertEmergencyCaseSchema.parse(data);
    const emergencyCase = await storage.createEmergencyCase(validated);
    
    // Broadcast to frontliners and hospitals that a new emergency case was created
    // (WebSocket or notification system would be implemented here)
    console.log("[Emergency] New case created:", emergencyCase.id);
    
    
    res.json(emergencyCase);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/api/emergency-cases", async (req: Request, res: Response) => {
  try {
    const cases = await storage.getAllEmergencyCases();
    res.json(cases);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/emergency-cases/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const emergencyCase = await storage.getEmergencyCaseById(id);
    res.json(emergencyCase || {});
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/api/emergency-cases/:id/assign", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { assignedToType, assignedToId } = req.body;
    
    const updated = await storage.assignEmergencyCase(id, assignedToType, assignedToId);
    
    
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/api/emergency-cases/:id/status", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, log } = req.body;
    
    const updated = await storage.updateEmergencyCaseStatus(id, status, log);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/frontliner/:frontlinerId/open-cases", async (req: Request, res: Response) => {
  try {
    const { frontlinerId } = req.params;
    const cases = await storage.getOpenCasesForFrontliner(frontlinerId);
    res.json(cases);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/hospital/:hospitalId/incoming-emergencies", async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.params;
    const cases = await storage.getIncomingEmergencies(hospitalId);
    res.json(cases);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Acknowledge incoming emergency case (hospital staff)
router.patch("/api/emergency-cases/:id/acknowledge", async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.body;
    if (!hospitalId) {
      return res.status(400).json({ error: "hospitalId is required" });
    }
    const emergencyCase = await storage.acknowledgeEmergencyCase(req.params.id, hospitalId);
    res.json(emergencyCase);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/api/nearby-hospitals", async (req: Request, res: Response) => {
  try {
    const { lat, lng, limit = "10" } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ error: "lat and lng query parameters are required" });
    }
    const hospitals = await storage.findNearestHospitals(lat as string, lng as string, parseInt(limit as string));
    res.json({ hospitals });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get doctors for a hospital
router.get("/api/hospital/:hospitalId/doctors", async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.params;
    const doctors = await storage.getDoctorsByHospital(hospitalId);
    res.json(doctors);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
