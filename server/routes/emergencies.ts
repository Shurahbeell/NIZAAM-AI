import { Router, type Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { requireAuth, requireRole } from "../middleware/auth";
import { insertEmergencySchema } from "@shared/schema";

// Priority mapping from string to number
const priorityStringToNumber: Record<string, number> = {
  "critical": 5,
  "high": 4,
  "medium": 3,
  "low": 2,
  "unknown": 1,
};

const router = Router();

// Helper: Find nearest 1122 frontliner and route emergency
async function routeToNearestFrontliner(lat?: string, lng?: string, emergency: any = {}) {
  if (!lat || !lng) return null;

  try {
    const lat_num = parseFloat(lat);
    const lng_num = parseFloat(lng);
    
    // Find nearest frontliners
    const frontliners = await storage.findNearestFrontliners(lat, lng, 5);
    
    if (frontliners.length === 0) {
      console.log("[Emergency Routing] No frontliners available, will route to hospital");
      return null;
    }

    // Get the nearest available frontliner
    const nearest = frontliners.find(f => f.isAvailable);
    if (!nearest) {
      console.log("[Emergency Routing] No available frontliners");
      return null;
    }

    // Get the frontliner user's full name
    let frontlinerName = nearest.organization || "Rescue 1122";
    if (nearest.userId) {
      const user = await storage.getUser(nearest.userId);
      if (user?.fullName) {
        frontlinerName = user.fullName;
      }
    }

    console.log(`[Emergency Routing] Routing to Rescue 1122 frontliner at distance ${nearest.distance}m`);
    return { type: "frontliner", id: nearest.id, name: frontlinerName };
  } catch (error) {
    console.error("[Emergency Routing] Error finding frontliners:", error);
    return null;
  }
}

// Helper: Find nearest hospital to route emergency
async function routeToNearestHospital(lat?: string, lng?: string) {
  if (!lat || !lng) return null;

  try {
    // Find nearest hospitals
    const hospitals = await storage.findNearestHospitals(lat, lng, 5);
    
    if (hospitals.length === 0) {
      console.log("[Emergency Routing] No hospitals available");
      return null;
    }

    // Get the nearest hospital
    const nearest = hospitals[0];

    console.log(`[Emergency Routing] Routing to nearest hospital: ${nearest.name} at distance ${nearest.distance}m`);
    return { type: "hospital", id: nearest.id, name: nearest.name };
  } catch (error) {
    console.error("[Emergency Routing] Error finding hospitals:", error);
    return null;
  }
}

// Create emergency (patient only) - routes to nearest 1122 frontliner
router.post("/", requireAuth, requireRole("patient"), async (req: Request, res: Response) => {
  try {
    // Only allow specific fields from request body - derive patientId from token
    const { patientName, patientPhone, location, emergencyType, priority, symptoms, notes, lat, lng } = req.body;

    // Check if this is an LHW reporting an emergency
    const isLhwReport = req.user!.role === "lhw";
    
    const data = insertEmergencySchema.parse({
      patientName,
      patientPhone,
      location,
      emergencyType,
      priority,
      symptoms,
      notes,
      patientId: req.user!.userId, // Always use authenticated user's ID
      status: "active",
      reportedByLhwId: isLhwReport ? req.user!.userId : undefined,
    });

    const emergency = await storage.createEmergency(data);

    const priorityNumber = priorityStringToNumber[priority as string] || 3;
    const assignments: any[] = [];

    // Route to nearest Rescue 1122 frontliner
    const frontlinerAssignment = await routeToNearestFrontliner(lat, lng, emergency);
    if (frontlinerAssignment) {
      // Create emergency case assigned to frontliner
      const frontlinerCase = await storage.createEmergencyCase({
        patientId: req.user!.userId,
        originLat: lat || "0",
        originLng: lng || "0",
        status: "assigned",
        priority: priorityNumber,
        assignedToType: frontlinerAssignment.type,
        assignedToId: frontlinerAssignment.id,
      });
      console.log(`[Emergencies] Created case ${frontlinerCase.id} and assigned to frontliner ${frontlinerAssignment.id}`);
      assignments.push(frontlinerAssignment);
    }

    // Route to nearest hospital
    const hospitalAssignment = await routeToNearestHospital(lat, lng);
    if (hospitalAssignment) {
      // Create emergency case assigned to hospital
      const hospitalCase = await storage.createEmergencyCase({
        patientId: req.user!.userId,
        originLat: lat || "0",
        originLng: lng || "0",
        status: "assigned",
        priority: priorityNumber,
        assignedToType: hospitalAssignment.type,
        assignedToId: hospitalAssignment.id,
      });
      console.log(`[Emergencies] Created case ${hospitalCase.id} and assigned to hospital ${hospitalAssignment.id}`);
      assignments.push(hospitalAssignment);
    }

    // Trigger emergency event for MCP system
    await storage.createAgentEvent({
      type: "EmergencyCreated",
      payload: {
        emergencyId: emergency.id,
        priority: emergency.priority,
        emergencyType: emergency.emergencyType,
        location: emergency.location,
        assignedTo: assignments,
      },
      triggeredByAgent: "system",
      status: "pending",
    });

    res.json({ ...emergency, assignedTo: assignments });
  } catch (error: any) {
    console.error("[Emergencies] Create error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create emergency" });
  }
});

// Get all emergencies (hospital only)
router.get("/", requireAuth, requireRole("hospital"), async (req: Request, res: Response) => {
  try {
    let emergencies;

    if (req.user!.hospitalId) {
      // Get emergencies assigned to this hospital
      emergencies = await storage.getEmergenciesByHospital(req.user!.hospitalId);
    } else {
      // If hospital admin without specific hospital, show all
      emergencies = await storage.getAllEmergencies();
    }

    res.json(emergencies);
  } catch (error: any) {
    console.error("[Emergencies] Get all error:", error);
    res.status(500).json({ error: "Failed to fetch emergencies" });
  }
});

// Get user's emergencies (patient only)
router.get("/my", requireAuth, requireRole("patient"), async (req: Request, res: Response) => {
  try {
    const emergencies = await storage.getEmergenciesByUser(req.user!.userId);
    res.json(emergencies);
  } catch (error: any) {
    console.error("[Emergencies] Get my emergencies error:", error);
    res.status(500).json({ error: "Failed to fetch emergencies" });
  }
});

// Get emergency by ID
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const emergency = await storage.getEmergencyById(req.params.id);

    if (!emergency) {
      return res.status(404).json({ error: "Emergency not found" });
    }

    // Authorization check
    if (req.user!.role === "patient" && emergency.patientId !== req.user!.userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (
      req.user!.role === "hospital" &&
      req.user!.hospitalId &&
      emergency.assignedHospitalId !== req.user!.hospitalId
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(emergency);
  } catch (error: any) {
    console.error("[Emergencies] Get by ID error:", error);
    res.status(500).json({ error: "Failed to fetch emergency" });
  }
});

// Update emergency status (hospital only)
router.patch("/:id/status", requireAuth, requireRole("hospital"), async (req: Request, res: Response) => {
  try {
    const { status, assignedHospitalId } = z
      .object({
        status: z.enum(["active", "responding", "resolved"]),
        assignedHospitalId: z.string().optional(),
      })
      .parse(req.body);

    const emergency = await storage.updateEmergencyStatus(
      req.params.id,
      status,
      assignedHospitalId
    );

    if (!emergency) {
      return res.status(404).json({ error: "Emergency not found" });
    }

    res.json(emergency);
  } catch (error: any) {
    console.error("[Emergencies] Update status error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    res.status(500).json({ error: "Failed to update emergency" });
  }
});

// Get incoming emergency cases for hospital
router.get("/cases/incoming/:hospitalId", requireAuth, requireRole("hospital"), async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.params;
    
    // Authorization: ensure user is from the requested hospital
    if (req.user!.hospitalId && req.user!.hospitalId !== hospitalId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const incomingCases = await storage.getIncomingEmergencies(hospitalId);
    res.json(incomingCases);
  } catch (error: any) {
    console.error("[Emergencies] Get incoming cases error:", error);
    res.status(500).json({ error: "Failed to fetch incoming emergencies" });
  }
});

// Acknowledge emergency case
router.patch("/cases/:id/acknowledge", requireAuth, requireRole("hospital"), async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.body;
    
    if (!hospitalId) {
      return res.status(400).json({ error: "Hospital ID is required" });
    }

    // Authorization: ensure user is from the hospital acknowledging
    if (req.user!.hospitalId && req.user!.hospitalId !== hospitalId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const emergencyCase = await storage.acknowledgeEmergencyCase(req.params.id, hospitalId);

    if (!emergencyCase) {
      return res.status(404).json({ error: "Emergency case not found" });
    }

    res.json(emergencyCase);
  } catch (error: any) {
    console.error("[Emergencies] Acknowledge case error:", error);
    res.status(500).json({ error: "Failed to acknowledge emergency" });
  }
});

// Acknowledge emergency (for LHW emergencies)
router.patch("/:id/acknowledge", requireAuth, requireRole("hospital"), async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.body;
    
    if (!hospitalId) {
      return res.status(400).json({ error: "Hospital ID is required" });
    }

    // Authorization: ensure user is from the hospital acknowledging
    if (req.user!.hospitalId && req.user!.hospitalId !== hospitalId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const emergency = await storage.acknowledgeEmergency(req.params.id, hospitalId);

    if (!emergency) {
      return res.status(404).json({ error: "Emergency not found" });
    }

    res.json(emergency);
  } catch (error: any) {
    console.error("[Emergencies] Acknowledge error:", error);
    res.status(500).json({ error: "Failed to acknowledge emergency" });
  }
});

// Complete emergency case
router.patch("/cases/:id/complete", requireAuth, requireRole("hospital"), async (req: Request, res: Response) => {
  try {
    const emergencyCase = await storage.completeEmergencyCase(req.params.id);

    if (!emergencyCase) {
      return res.status(404).json({ error: "Emergency case not found" });
    }

    res.json(emergencyCase);
  } catch (error: any) {
    console.error("[Emergencies] Complete case error:", error);
    res.status(500).json({ error: "Failed to complete emergency" });
  }
});

export default router;
