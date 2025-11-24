import { Router, type Request, Response } from "express";
import { db } from "../db";
import { requireAuth } from "../middleware/auth";
import {
  menstrualHygieneStatus,
  menstrualPadRequests,
  menstrualEducationSessions,
  lhwAssignments,
} from "../../shared/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

// GET /api/lhw/menstrual/household-status
router.get("/household-status", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { householdId } = req.query;
    if (!householdId) {
      return res.status(400).json({ error: "householdId query parameter required" });
    }

    const status = await db
      .select()
      .from(menstrualHygieneStatus)
      .where(
        and(
          eq(menstrualHygieneStatus.householdId, householdId as string),
          eq(menstrualHygieneStatus.lhwId, req.user.userId)
        )
      );

    res.json(status.length > 0 ? status[0] : null);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch household menstrual status" });
  }
});

// POST /api/lhw/menstrual/update-status
router.post("/update-status", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { householdId, lastCycleDate, usesSafeProducts, notes } = req.body;

    const existing = await db
      .select()
      .from(menstrualHygieneStatus)
      .where(
        and(
          eq(menstrualHygieneStatus.householdId, householdId),
          eq(menstrualHygieneStatus.lhwId, req.user.userId)
        )
      );

    if (existing.length > 0) {
      await db
        .update(menstrualHygieneStatus)
        .set({
          lastCycleDate: lastCycleDate ? new Date(lastCycleDate) : undefined,
          usesSafeProducts,
          notes,
          updatedAt: new Date(),
        })
        .where(eq(menstrualHygieneStatus.id, existing[0].id));
    } else {
      await db.insert(menstrualHygieneStatus).values({
        householdId,
        lhwId: req.user.userId,
        lastCycleDate: lastCycleDate ? new Date(lastCycleDate) : null,
        usesSafeProducts,
        notes,
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update menstrual status" });
  }
});

// POST /api/lhw/menstrual/request-pads
router.post("/request-pads", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { householdId, quantityRequested, urgencyLevel } = req.body;

    const request = await db.insert(menstrualPadRequests).values({
      householdId,
      lhwId: req.user.userId,
      quantityRequested,
      urgencyLevel: urgencyLevel || "medium",
      status: "pending",
    });

    res.json({ success: true, id: request[0] });
  } catch (error) {
    res.status(500).json({ error: "Failed to request pads" });
  }
});

// GET /api/lhw/menstrual/requests
router.get("/requests", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const requests = await db
      .select()
      .from(menstrualPadRequests)
      .where(eq(menstrualPadRequests.lhwId, req.user.userId));

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pad requests" });
  }
});

// POST /api/lhw/menstrual/create-education-session
router.post("/create-education-session", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { householdId, materialsProvided, topicsCovered, feedbackForm } = req.body;

    const session = await db.insert(menstrualEducationSessions).values({
      householdId,
      lhwId: req.user.userId,
      materialsProvided: materialsProvided || [],
      topicsCovered: topicsCovered || [],
      feedbackForm: feedbackForm || null,
    });

    res.json({ success: true, id: session[0] });
  } catch (error) {
    res.status(500).json({ error: "Failed to create education session" });
  }
});

// GET /api/lhw/menstrual/sessions
router.get("/sessions", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const sessions = await db
      .select()
      .from(menstrualEducationSessions)
      .where(eq(menstrualEducationSessions.lhwId, req.user.userId));

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch education sessions" });
  }
});

// GET /api/lhw/menstrual/dashboard-stats
router.get("/dashboard-stats", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const statuses = await db
      .select()
      .from(menstrualHygieneStatus)
      .where(eq(menstrualHygieneStatus.lhwId, req.user.userId));

    const requests = await db
      .select()
      .from(menstrualPadRequests)
      .where(eq(menstrualPadRequests.lhwId, req.user.userId));

    const sessions = await db
      .select()
      .from(menstrualEducationSessions)
      .where(eq(menstrualEducationSessions.lhwId, req.user.userId));

    const unsafeHouseholds = statuses.filter((s) => !s.usesSafeProducts).length;
    const pendingRequests = requests.filter((r) => r.status === "pending").length;
    const deliveredPads = requests
      .filter((r) => r.status === "delivered")
      .reduce((sum, r) => sum + r.quantityRequested, 0);

    res.json({
      householdsTracked: statuses.length,
      householdsUsingUnsafeMaterials: unsafeHouseholds,
      pendingPadRequests: pendingRequests,
      educationSessionsHeld: sessions.length,
      padsDelivered: deliveredPads,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

export default router;
