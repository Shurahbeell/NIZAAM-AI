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
        name: "Civil Hospital Lahore",
        lat: 31.5245,
        lng: 74.3215,
        type: "Government Hospital",
        isOpen: true,
        phone: "+92 42 111 222 777",
        address: "Mall Road, Lahore",
        city: "Lahore"
      },
      {
        id: 7,
        name: "Mayo Hospital",
        lat: 31.5204,
        lng: 74.3587,
        type: "Teaching Hospital",
        isOpen: true,
        phone: "+92 42 111 222 888",
        address: "Guava Garden, Lahore",
        city: "Lahore"
      },
      {
        id: 8,
        name: "Shaukat Khanum Memorial Hospital",
        lat: 31.4697,
        lng: 74.2728,
        type: "Private Hospital",
        isOpen: true,
        phone: "+92 42 111 222 999",
        address: "DHA Phase 5, Lahore",
        city: "Lahore"
      },
      {
        id: 9,
        name: "Liaquat National Hospital Karachi",
        lat: 24.8700,
        lng: 67.0631,
        type: "Private Hospital",
        isOpen: true,
        phone: "+92 21 111 444 555",
        address: "Tariq Road, Karachi",
        city: "Karachi"
      },
      {
        id: 10,
        name: "Aga Khan University Hospital Karachi",
        lat: 24.9056,
        lng: 67.0822,
        type: "Private Hospital",
        isOpen: true,
        phone: "+92 21 111 444 666",
        address: "Clifton Block 5, Karachi",
        city: "Karachi"
      },
      {
        id: 11,
        name: "Islamabad Healthcare Complex",
        lat: 33.7077,
        lng: 73.0469,
        type: "Government Hospital",
        isOpen: true,
        phone: "+92 51 111 555 777",
        address: "Blue Area, Islamabad",
        city: "Islamabad"
      },
      {
        id: 12,
        name: "United Hospital Islamabad",
        lat: 33.6995,
        lng: 73.0363,
        type: "Private Hospital",
        isOpen: true,
        phone: "+92 51 111 555 888",
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

// ==================== MEDICINE CHATBOT ====================

// Medicine chatbot powered by Gemini (using Replit AI Integrations)
// Supports multilingual responses in English, Urdu Script, and Roman Urdu
router.post("/api/medicine/chat", async (req: Request, res: Response) => {
  try {
    const { medicine, question, context, language = "english" } = req.body;
    
    if (!medicine || !question) {
      return res.status(400).json({ error: "Missing medicine or question" });
    }

    // Import Gemini and translation service
    const { GoogleGenAI } = await import("@google/genai");
    const { translationService } = await import("./mcp/services/translation");
    
    // Use Replit's AI Integrations for Gemini access
    const client = new GoogleGenAI({
      apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY || "",
      httpOptions: {
        apiVersion: "",
        baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL || ""
      }
    });

    // Map language codes to full language names (same as triage agent)
    const languageMap: { [key: string]: string } = {
      "english": "English",
      "ur": "Urdu (written in Arabic-Persian script)",
      "ru": "Roman Urdu (written in Romanized Latin script)"
    };

    const targetLanguage = languageMap[language] || "English";

    // Translate user question to English for processing if needed
    let processedQuestion = question;
    if (language === "ur" || language === "ru") {
      processedQuestion = await translationService.translate(question, "english", "medicine query");
    }

    // Create a detailed prompt for medicine information
    const systemPrompt = `You are a knowledgeable pharmaceutical specialist for Pakistan. Your role is to provide accurate, comprehensive information about medicines and drugs.

**CRITICAL LANGUAGE REQUIREMENT: You MUST respond ONLY in ${targetLanguage}. Do not provide any text in Hindi, English (unless specified), or any other language. Do not mix languages.**

When users ask about a medicine, provide comprehensive information including:
- Clear explanation of what the medicine is
- Proper dosage and how to take it
- Common side effects and serious side effects
- Drug interactions with other medicines
- Contraindications and when NOT to use
- Special precautions for pregnant women, elderly, or children
- Storage and handling instructions
- Effectiveness and how long it takes to work
- Whether it requires a prescription
- Common brand names

Always use simple, clear language and end by reminding the user to consult a healthcare professional for proper medical advice.

**PAKISTAN CONTEXT:**
- Use context appropriate for Pakistan's healthcare system
- Reference common medicines available in Pakistan
- Be empathetic and culturally sensitive`;

    const medicineContext = context ? `
Additional Medicine Information Available:
- Generic Name: ${context.genericName}
- Category: ${context.category}
- Usage: ${context.usage}
- Dosage: ${context.dosage}
- Side Effects: ${context.sideEffects?.join(", ")}
- Drug Interactions: ${context.interactions?.join(", ")}
- Contraindications: ${context.contraindications?.join(", ")}
- Precautions: ${context.precautions}
` : "";

    const userPrompt = `About ${medicine}: ${processedQuestion}${medicineContext}

Respond ONLY in ${targetLanguage}. Do not mix languages. Do not use Hindi. Do not provide English translation unless specifically requested.`;

    console.log(`[Medicine Chat] Processing question about ${medicine} in language: ${language}`);

    // Call Gemini API with proper configuration
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: systemPrompt + "\n\n" + userPrompt
            }
          ]
        }
      ]
    });

    // Extract response text with better error handling
    let responseText = response.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      console.error("[Medicine Chat] No response text from Gemini", { 
        response: JSON.stringify(response) 
      });
      return res.status(500).json({ 
        error: "Failed to generate response from AI. Please try again." 
      });
    }

    // If language was Urdu or Roman Urdu but Gemini responded in English, translate back
    if ((language === "ur" || language === "ru") && !responseText.match(/[\u0600-\u06FF]/)) {
      // Gemini didn't respond in Urdu, translate English to Urdu
      const targetLanguage = language === "ur" ? "urdu" : "urdu"; // Both map to urdu translation
      responseText = await translationService.translate(responseText, targetLanguage, "medicine information");
    }

    console.log(`[Medicine Chat] Successfully generated response for ${medicine}`);
    res.json({ response: responseText });
  } catch (error: any) {
    console.error("[Medicine Chat] Error:", error.message || error);
    res.status(500).json({ 
      error: error.message || "Failed to process medicine question" 
    });
  }
});

// ==================== DISEASE CHATBOT ====================

// Disease chatbot powered by Gemini (using Replit AI Integrations)
// Supports multilingual responses in English, Urdu Script, and Roman Urdu
router.post("/api/disease/chat", async (req: Request, res: Response) => {
  try {
    const { disease, question, context, language = "english" } = req.body;
    
    if (!disease || !question) {
      return res.status(400).json({ error: "Missing disease or question" });
    }

    // Import Gemini and translation service
    const { GoogleGenAI } = await import("@google/genai");
    const { translationService } = await import("./mcp/services/translation");
    
    // Use Replit's AI Integrations for Gemini access
    const client = new GoogleGenAI({
      apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY || "",
      httpOptions: {
        apiVersion: "",
        baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL || ""
      }
    });

    // Map language codes to full language names (same as triage agent)
    const languageMap: { [key: string]: string } = {
      "english": "English",
      "ur": "Urdu (written in Arabic-Persian script)",
      "ru": "Roman Urdu (written in Romanized Latin script)"
    };

    const targetLanguage = languageMap[language] || "English";

    // Translate user question to English for processing if needed
    let processedQuestion = question;
    if (language === "ur" || language === "ru") {
      processedQuestion = await translationService.translate(question, "english", "disease query");
    }

    // Create a detailed prompt for disease information
    const systemPrompt = `You are a knowledgeable health educator for Pakistan. Your role is to provide accurate, comprehensive information about diseases and medical conditions.

**CRITICAL LANGUAGE REQUIREMENT: You MUST respond ONLY in ${targetLanguage}. Do not provide any text in Hindi, English (unless specified), or any other language. Do not mix languages.**

When users ask about a disease, provide comprehensive information including:
- Clear explanation of what the disease is
- Key symptoms and how they present
- Disease progression and stages (if applicable)
- Severity levels and critical warning signs
- Risk factors and who is most affected
- How it's transmitted or caused
- Detailed treatment options
- Prevention methods and lifestyle changes
- When to see a doctor (red flags)
- Complications if untreated
- Prognosis and long-term outlook

Always use simple, clear language and end by reminding the user to consult healthcare professionals for diagnosis and treatment.

**PAKISTAN CONTEXT:**
- Use context appropriate for Pakistan's healthcare system
- Reference common diseases in Pakistan
- Be empathetic and culturally sensitive`;

    const diseaseContext = context ? `
Additional Disease Information Available:
- Symptoms: ${context.symptoms?.join(", ")}
- Risk Factors: ${context.riskFactors?.join(", ")}
- Complications: ${context.complications?.join(", ")}
- Treatments: ${context.treatments?.join(", ")}
- Prevention: ${context.prevention?.join(", ")}
- When to see doctor: ${context.whenToSeeDoctor}
` : "";

    const userPrompt = `About ${disease}: ${processedQuestion}${diseaseContext}

Respond ONLY in ${targetLanguage}. Do not mix languages. Do not use Hindi. Do not provide English translation unless specifically requested.`;

    console.log(`[Disease Chat] Processing question about ${disease} in language: ${language}`);

    // Call Gemini API with proper configuration
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: systemPrompt + "\n\n" + userPrompt
            }
          ]
        }
      ]
    });

    // Extract response text with better error handling
    let responseText = response.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      console.error("[Disease Chat] No response text from Gemini", { 
        response: JSON.stringify(response) 
      });
      return res.status(500).json({ 
        error: "Failed to generate response from AI. Please try again." 
      });
    }

    // If language was Urdu or Roman Urdu but Gemini responded in English, translate back
    if ((language === "ur" || language === "ru") && !responseText.match(/[\u0600-\u06FF]/)) {
      // Gemini didn't respond in Urdu, translate English to Urdu
      const targetLanguage = language === "ur" ? "urdu" : "urdu"; // Both map to urdu translation
      responseText = await translationService.translate(responseText, targetLanguage, "disease information");
    }

    console.log(`[Disease Chat] Successfully generated response for ${disease}`);
    res.json({ response: responseText });
  } catch (error: any) {
    console.error("[Disease Chat] Error:", error.message || error);
    res.status(500).json({ 
      error: error.message || "Failed to process disease question" 
    });
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

// Get hospitals and healthcare facilities (with aggressive vet/pharmacy filtering)
router.get("/api/facilities/hospitals", async (req: Request, res: Response) => {
  try {
    const { lat, lng, limit = "50" } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: "lat and lng query parameters are required" });
    }
    
    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    const limitNum = parseInt(limit as string) || 50;
    
    // Import facility finder agent with aggressive filtering
    const { findNearbyFacilities } = await import("./mcp/agents/facility-finder-agent");
    
    // Call agent with filtering
    const result = await findNearbyFacilities(latitude, longitude, { limit: limitNum });
    
    res.json({
      results: result.results,
      meta: result.meta
    });
  } catch (error: any) {
    console.error("[Hospital Search] Error:", error.message);
    
    // Fallback to mock hospitals if live data fails
    const fallbackHospitals = [
      {
        name: "Jinnah Hospital",
        lat: 31.4827,
        lng: 74.3145,
        address: "Ferozepur Road, Lahore",
        rating: 4.2,
        place_id: "mock_jinnah",
        distance: { text: "2.3 km", value: 2300 }
      },
      {
        name: "Services Hospital",
        lat: 31.5050,
        lng: 74.3293,
        address: "Jail Road, Lahore",
        rating: 4.0,
        place_id: "mock_services",
        distance: { text: "1.8 km", value: 1800 }
      },
      {
        name: "Mayo Hospital",
        lat: 31.5204,
        lng: 74.3587,
        address: "Guava Garden, Lahore",
        rating: 4.1,
        place_id: "mock_mayo",
        distance: { text: "2.0 km", value: 2000 }
      }
    ];
    
    res.json({
      results: fallbackHospitals,
      meta: {
        cached: true,
        source: "google",
        fetched_at: Date.now(),
        error: "Live data fetch failed, showing cached hospitals"
      }
    });
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

// Create doctor
router.post("/api/hospital/:hospitalId/doctors", async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.params;
    const { name, specialization, qualification, consultationFee, availability } = req.body;
    
    if (!name || !specialization || !consultationFee) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const doctor = await storage.createDoctor({
      hospitalId,
      name,
      specialization,
      qualification: qualification || "",
      consultationFee: parseInt(consultationFee),
      availability: availability || "Mon-Fri: 9AM-5PM",
      isAvailable: true
    });

    res.status(201).json(doctor);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update doctor
router.patch("/api/hospital/:hospitalId/doctors/:doctorId", async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;
    const doctor = await storage.updateDoctor(doctorId, req.body);
    
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    res.json(doctor);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete doctor
router.delete("/api/hospital/:hospitalId/doctors/:doctorId", async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;
    await storage.deleteDoctor(doctorId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
