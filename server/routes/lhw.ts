import { Router, type Request, Response } from "express";
import { db } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";
import { 
  lhwAssignments, 
  lhwReports, 
  lhwVaccinations, 
  lhwInventory,
  lhwEducationSessions,
  emergencyCases,
  emergencies,
  users
} from "../../shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

// GET /api/lhw/profile
router.get("/profile", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const lhwUser = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user.userId));

    if (!lhwUser.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const profile = lhwUser[0];
    res.json({
      id: profile.id,
      username: profile.username,
      fullName: profile.fullName,
      phone: profile.phone,
      address: profile.address,
      cnic: profile.cnic,
      age: profile.age,
      role: profile.role,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// GET /api/lhw/dashboard
router.get("/dashboard", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const lhwId = req.user.userId;

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
router.get("/households", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const households = await db
      .select()
      .from(lhwAssignments)
      .where(eq(lhwAssignments.lhwId, req.user.userId));

    res.json(households);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch households" });
  }
});

// POST /api/lhw/visit-log
router.post("/visit-log", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const { visitType, notes, vitals, nextVisitDate } = req.body;

    const report = await db.insert(lhwReports).values({
      lhwId: req.user.userId,
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
router.get("/vaccinations", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const vaccinations = await db
      .select()
      .from(lhwVaccinations)
      .where(eq(lhwVaccinations.lhwId, req.user.userId));

    res.json(vaccinations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch vaccinations" });
  }
});

// POST /api/lhw/vaccination
router.post("/vaccination", requireAuth, async (req: Request, res: Response) => {
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
router.post("/education-session", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const { topic, audienceSize, notes } = req.body;

    await db.insert(lhwEducationSessions).values({
      lhwId: req.user.userId,
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
router.post("/emergency", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const { patientName, patientPhone, symptoms, severity } = req.body;

    // Map severity to priority number and text
    const priorityMap: { [key: string]: { num: number; text: string } } = {
      critical: { num: 5, text: "critical" },
      high: { num: 4, text: "high" },
      medium: { num: 3, text: "medium" },
      low: { num: 2, text: "low" },
    };
    
    const priorityInfo = priorityMap[severity] || { num: 3, text: "medium" };

    // Create emergency record in emergencies table with LHW tracking
    const emergency = await db.insert(emergencies).values({
      patientName,
      patientPhone,
      emergencyType: "medical",
      priority: priorityInfo.text,
      symptoms,
      status: "active",
      notes: symptoms,
      reportedByLhwId: req.user.userId, // Mark as LHW-reported
    });

    // Also create emergency case for hospital routing
    const emergencyCase = await db.insert(emergencyCases).values({
      patientId: req.user.userId,
      originLat: "0",
      originLng: "0",
      status: "assigned",
      priority: priorityInfo.num,
      assignedToType: "hospital",
      assignedToId: "", // Will be assigned when hospital responds
      log: [{ type: "lhw_report", message: symptoms, timestamp: new Date().toISOString() }],
    });

    res.json({ success: true, emergencyId: emergency[0], caseId: emergencyCase[0] });
  } catch (error: any) {
    console.error("[LHW] Emergency report error:", error);
    res.status(500).json({ error: "Failed to report emergency" });
  }
});

// GET /api/lhw/inventory
router.get("/inventory", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const inventory = await db
      .select()
      .from(lhwInventory)
      .where(eq(lhwInventory.lhwId, req.user.userId));

    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

// POST /api/lhw/inventory
router.post("/inventory", requireAuth, async (req: Request, res: Response) => {
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
router.post("/sync", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const { type, payload } = req.body;

    // Route to appropriate handler based on type
    switch (type) {
      case "visit":
        await db.insert(lhwReports).values({
          lhwId: req.user.userId,
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
          lhwId: req.user.userId,
          ...payload,
        });
        break;
      case "emergency":
        await db.insert(emergencyCases).values({
          patientId: req.user.userId,
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
