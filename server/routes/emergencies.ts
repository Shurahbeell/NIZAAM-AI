import { Router, type Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { requireAuth, requireRole } from "../middleware/auth";
import { insertEmergencySchema } from "@shared/schema";

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

    console.log(`[Emergency Routing] Routing to Rescue 1122 frontliner at distance ${nearest.distance}m`);
    return { type: "frontliner", id: nearest.id, name: nearest.organization };
  } catch (error) {
    console.error("[Emergency Routing] Error finding frontliners:", error);
    return null;
  }
}

// Create emergency (patient only) - routes to nearest 1122 frontliner
router.post("/", requireAuth, requireRole("patient"), async (req: Request, res: Response) => {
  try {
    // Only allow specific fields from request body - derive patientId from token
    const { patientName, patientPhone, location, emergencyType, priority, symptoms, notes, lat, lng } = req.body;

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
    });

    const emergency = await storage.createEmergency(data);

    // Try to route to nearest Rescue 1122 frontliner
    const assignment = await routeToNearestFrontliner(lat, lng, emergency);
    
    if (assignment) {
      // Update emergency with assignment
      await storage.updateEmergencyCaseStatus(emergency.id, "assigned", { 
        assignedToType: assignment.type, 
        assignedToId: assignment.id 
      });
    }

    // Trigger emergency event for MCP system
    await storage.createAgentEvent({
      type: "EmergencyCreated",
      payload: {
        emergencyId: emergency.id,
        priority: emergency.priority,
        emergencyType: emergency.emergencyType,
        location: emergency.location,
        assignedTo: assignment,
      },
      triggeredByAgent: "system",
      status: "pending",
    });

    res.json({ ...emergency, assignedTo: assignment });
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

export default router;
