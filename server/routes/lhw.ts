import { Router, type Request, Response } from "express";
import { db } from "../db";
import { 
  lhwAssignments, 
  lhwReports, 
  lhwVaccinations, 
  lhwInventory,
  lhwEducationSessions,
  emergencyCases
} from "../../shared/schema";
import { eq } from "drizzle-orm";

interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

const router = Router();

// Verify LHW role
const lhwRoleCheck = (req: AuthRequest, res: Response, next: any) => {
  if (req.user?.role !== "lhw") {
    return res.status(403).json({ error: "LHW access only" });
  }
  next();
};

// Mock auth middleware for now
const authMiddleware = (req: AuthRequest, res: Response, next: any) => {
  // This would typically validate JWT token from headers
  // For now, we'll use a mock implementation
  req.user = { id: "test-lhw-id", role: "lhw" };
  next();
};

// GET /api/lhw/dashboard
router.get("/dashboard", authMiddleware, lhwRoleCheck, async (req: AuthRequest, res: Response) => {
  try {
    const lhwId = req.user.id;

    const households = await db
      .select()
      .from(lhwAssignments)
      .where(eq(lhwAssignments.lhwId, lhwId));

    const reports = await db
      .select()
      .from(lhwReports)
      .where(eq(lhwReports.lhwId, lhwId));

    const vaccinations = await db
      .select()
      .from(lhwVaccinations)
      .where(eq(lhwVaccinations.lhwId, lhwId));

    const pendingVaccines = vaccinations.filter(v => v.status === "pending").length;
    const overdueVaccines = vaccinations.filter(v => v.status === "overdue").length;

    res.json({
      assignedHouseholds: households.length,
      pendingVisits: reports.filter(r => !r.nextVisitDate).length,
      overdueVaccinations: overdueVaccines,
      emergencyAlerts: 0,
      households: households.map(h => ({
        id: h.id,
        householdName: h.householdName,
        latitude: h.latitude,
        longitude: h.longitude,
        populationServed: h.populationServed,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dashboard" });
  }
});

// GET /api/lhw/households
router.get("/households", authMiddleware, lhwRoleCheck, async (req: AuthRequest, res: Response) => {
  try {
    const households = await db
      .select()
      .from(lhwAssignments)
      .where(eq(lhwAssignments.lhwId, req.user.id));

    res.json(households);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch households" });
  }
});

// POST /api/lhw/visit-log
router.post("/visit-log", authMiddleware, lhwRoleCheck, async (req: AuthRequest, res: Response) => {
  try {
    const { visitType, notes, vitals, nextVisitDate } = req.body;

    const report = await db.insert(lhwReports).values({
      lhwId: req.user.id,
      visitType,
      notes,
      vitals,
      nextVisitDate: nextVisitDate ? new Date(nextVisitDate) : null,
    });

    res.json({ success: true, id: report[0] });
  } catch (error) {
    res.status(500).json({ error: "Failed to log visit" });
  }
});

// GET /api/lhw/vaccinations
router.get("/vaccinations", authMiddleware, lhwRoleCheck, async (req: AuthRequest, res: Response) => {
  try {
    const vaccinations = await db
      .select()
      .from(lhwVaccinations)
      .where(eq(lhwVaccinations.lhwId, req.user.id));

    res.json(vaccinations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch vaccinations" });
  }
});

// POST /api/lhw/vaccination
router.post("/vaccination", authMiddleware, lhwRoleCheck, async (req: AuthRequest, res: Response) => {
  try {
    const { vaccinationId, status, completedAt } = req.body;

    await db
      .update(lhwVaccinations)
      .set({
        status,
        completedAt: status === "completed" ? new Date(completedAt || Date.now()) : null,
      })
      .where(eq(lhwVaccinations.id, vaccinationId));

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update vaccination" });
  }
});

// POST /api/lhw/education-session
router.post("/education-session", authMiddleware, lhwRoleCheck, async (req: AuthRequest, res: Response) => {
  try {
    const { topic, audienceSize, notes } = req.body;

    await db.insert(lhwEducationSessions).values({
      lhwId: req.user.id,
      topic,
      audienceSize,
      notes,
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to log education session" });
  }
});

// POST /api/lhw/emergency
router.post("/emergency", authMiddleware, lhwRoleCheck, async (req: AuthRequest, res: Response) => {
  try {
    const { patientName, patientPhone, symptoms, severity } = req.body;

    const emergencyCase = await db.insert(emergencyCases).values({
      patientId: req.user.id,
      originLat: "0",
      originLng: "0",
      status: "new",
      priority: severity === "critical" ? 1 : severity === "high" ? 2 : severity === "medium" ? 3 : 4,
      log: [{ type: "lhw_report", message: symptoms, timestamp: new Date().toISOString() }],
    });

    res.json({ success: true, id: emergencyCase[0] });
  } catch (error) {
    res.status(500).json({ error: "Failed to report emergency" });
  }
});

// GET /api/lhw/inventory
router.get("/inventory", authMiddleware, lhwRoleCheck, async (req: AuthRequest, res: Response) => {
  try {
    const inventory = await db
      .select()
      .from(lhwInventory)
      .where(eq(lhwInventory.lhwId, req.user.id));

    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

// POST /api/lhw/inventory
router.post("/inventory", authMiddleware, lhwRoleCheck, async (req: AuthRequest, res: Response) => {
  try {
    const { itemId, quantity } = req.body;

    await db
      .update(lhwInventory)
      .set({ quantity })
      .where(eq(lhwInventory.id, itemId));

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update inventory" });
  }
});

// POST /api/lhw/sync (offline queue sync)
router.post("/sync", authMiddleware, lhwRoleCheck, async (req: AuthRequest, res: Response) => {
  try {
    const { type, payload } = req.body;

    // Route to appropriate handler based on type
    switch (type) {
      case "visit":
        await db.insert(lhwReports).values({
          lhwId: req.user.id,
          ...payload,
        });
        break;
      case "vaccination":
        await db
          .update(lhwVaccinations)
          .set(payload)
          .where(eq(lhwVaccinations.id, payload.vaccinationId));
        break;
      case "education":
        await db.insert(lhwEducationSessions).values({
          lhwId: req.user.id,
          ...payload,
        });
        break;
      case "emergency":
        await db.insert(emergencyCases).values({
          patientId: req.user.id,
          ...payload,
        });
        break;
      case "inventory":
        await db
          .update(lhwInventory)
          .set(payload)
          .where(eq(lhwInventory.id, payload.itemId));
        break;
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Sync failed" });
  }
});

export default router;
