import { Router, type Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { requireAuth } from "../middleware/auth";
import { computeETA_MS, parseCoordinate, formatETA } from "../utils/geo";

const router = Router();

// Create emergency case and auto-assign to nearest frontliner or hospital
const createDispatchSchema = z.object({
  patientId: z.string(),
  originLat: z.string(),
  originLng: z.string(),
  priority: z.number().min(1).max(5).optional(),
  notes: z.string().optional(),
});

router.post("/create", requireAuth, async (req: Request, res: Response) => {
  try {
    const data = createDispatchSchema.parse(req.body);

    // Validate patient owns the request
    if (req.user?.userId !== data.patientId && req.user?.role !== "hospital") {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Create emergency case with initial log entry
    const emergencyCase = await storage.createEmergencyCase({
      patientId: data.patientId,
      originLat: data.originLat,
      originLng: data.originLng,
      status: "new",
      priority: data.priority || 1,
      log: [
        {
          at: new Date().toISOString(),
          by: { id: req.user?.userId, role: req.user?.role },
          status: "new",
          note: data.notes || "Emergency case created",
        },
      ] as any,
    });

    // Find nearest available frontliners and hospitals
    const frontliners = await storage.findNearestFrontliners(data.originLat, data.originLng, 5);
    const hospitals = await storage.findNearestHospitals(data.originLat, data.originLng, 5);

    // Calculate ETAs
    const originLat = parseCoordinate(data.originLat);
    const originLng = parseCoordinate(data.originLng);

    const candidateETAs: Array<{
      type: "frontliner" | "hospital";
      id: string;
      etaMs: number;
      distance: number;
      meta?: any;
    }> = [];

    // Process frontliners
    for (const frontliner of frontliners) {
      if (!frontliner.currentLat || !frontliner.currentLng) continue;

      const frontlinerLat = parseCoordinate(frontliner.currentLat);
      const frontlinerLng = parseCoordinate(frontliner.currentLng);

      const etaMs = computeETA_MS(
        originLat,
        originLng,
        frontlinerLat,
        frontlinerLng,
        Number(process.env.FRONTLINER_DEFAULT_SPEED_KMH) || 40
      );

      candidateETAs.push({
        type: "frontliner",
        id: frontliner.id,
        etaMs,
        distance: frontliner.distance,
        meta: frontliner,
      });
    }

    // Process hospitals using estimated coordinates
    for (const hospital of hospitals) {
      // Use estimated coordinates (from findNearestHospitals)
      // PRODUCTION TODO: Replace with actual geocoded hospital coordinates
      const hospitalLat = hospital.estimatedLat || originLat;
      const hospitalLng = hospital.estimatedLng || originLng;

      const etaMs = computeETA_MS(
        originLat,
        originLng,
        hospitalLat,
        hospitalLng,
        Number(process.env.HOSPITAL_DEFAULT_SPEED_KMH) || 30
      );

      candidateETAs.push({
        type: "hospital",
        id: hospital.id,
        etaMs,
        distance: hospital.distance,
        meta: hospital,
      });
    }

    // Sort by ETA (fastest first)
    candidateETAs.sort((a, b) => a.etaMs - b.etaMs);

    // Assign to best candidate if available
    if (candidateETAs.length > 0) {
      const best = candidateETAs[0];
      const assigned = await storage.assignEmergencyCase(
        emergencyCase.id,
        best.type,
        best.id
      );

      console.log(
        `[Dispatch] Assigned case ${emergencyCase.id} to ${best.type} ${best.id} (ETA: ${formatETA(best.etaMs)}, Distance: ${Math.round(best.distance)}m)`
      );

      return res.json({
        success: true,
        case: assigned,
        assignment: {
          type: best.type,
          id: best.id,
          eta: formatETA(best.etaMs),
          distance: best.distance,
        },
      });
    }

    // No responders available - return unassigned case
    console.log(`[Dispatch] No responders available for case ${emergencyCase.id}`);
    return res.json({
      success: true,
      case: emergencyCase,
      note: "No responders currently available. Case created as pending.",
    });
  } catch (error: any) {
    console.error("[Dispatch] Create error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create emergency case" });
  }
});

// Update emergency case status
const updateStatusSchema = z.object({
  status: z.enum(["new", "assigned", "ack", "in_progress", "completed"]),
  note: z.string().optional(),
});

router.patch("/:caseId/status", requireAuth, async (req: Request, res: Response) => {
  try {
    const { caseId } = req.params;
    const data = updateStatusSchema.parse(req.body);

    // Get existing case to update log
    const existingCase = await storage.getEmergencyCaseById(caseId);
    if (!existingCase) {
      return res.status(404).json({ error: "Emergency case not found" });
    }

    // Parse existing log - handle both string and object forms
    let log: any[] = [];
    if (existingCase.log) {
      if (typeof existingCase.log === "string") {
        try {
          log = JSON.parse(existingCase.log);
        } catch (e) {
          console.error("[Dispatch] Failed to parse log:", e);
          log = [];
        }
      } else if (Array.isArray(existingCase.log)) {
        log = existingCase.log;
      } else if (typeof existingCase.log === "object") {
        // PostgreSQL JSONB returns as object
        log = Array.isArray(existingCase.log) ? existingCase.log : [existingCase.log];
      }
    }

    // Add new log entry
    log.push({
      at: new Date().toISOString(),
      by: { id: req.user?.userId, role: req.user?.role },
      status: data.status,
      note: data.note,
    });

    // Update case - store as JSONB (Drizzle will handle serialization)
    const updated = await storage.updateEmergencyCaseStatus(
      caseId,
      data.status,
      log
    );

    if (!updated) {
      return res.status(404).json({ error: "Emergency case not found" });
    }

    res.json({ success: true, case: updated });
  } catch (error: any) {
    console.error("[Dispatch] Update status error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    res.status(500).json({ error: "Failed to update status" });
  }
});

// Get all emergency cases (for admin/monitoring)
router.get("/cases", requireAuth, async (req: Request, res: Response) => {
  try {
    const cases = await storage.getAllEmergencyCases();
    res.json({ success: true, cases });
  } catch (error: any) {
    console.error("[Dispatch] Get cases error:", error);
    res.status(500).json({ error: "Failed to get cases" });
  }
});

// Get single emergency case
router.get("/cases/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const emergencyCase = await storage.getEmergencyCaseById(id);

    if (!emergencyCase) {
      return res.status(404).json({ error: "Emergency case not found" });
    }

    res.json({ success: true, case: emergencyCase });
  } catch (error: any) {
    console.error("[Dispatch] Get case error:", error);
    res.status(500).json({ error: "Failed to get case" });
  }
});

export default router;
