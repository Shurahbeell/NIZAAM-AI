import { Router, type Request, Response } from "express";
import { db } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";
import {
  donationCauses,
  donationAccounts,
  donations,
  supplyRequests,
  donationAllocations,
  communityEvents,
  supplies,
  insertDonationCauseSchema,
  insertDonationAccountSchema,
  insertDonationSchema,
  insertSupplyRequestSchema,
  insertDonationAllocationSchema,
  insertCommunityEventSchema,
  users,
} from "../../shared/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { z } from "zod";

const router = Router();

// ============ DONATION CAUSES ============

// GET /api/donations/causes - Public list of active causes
router.get("/causes", async (req: Request, res: Response) => {
  try {
    const causes = await db
      .select()
      .from(donationCauses)
      .where(eq(donationCauses.active, true));

    res.json(causes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch causes" });
  }
});

// POST /api/donations/causes - Admin create cause
router.post("/causes", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const data = insertDonationCauseSchema.parse(req.body);
    const cause = await db.insert(donationCauses).values(data).returning();
    res.json(cause[0]);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create cause" });
  }
});

// PUT /api/donations/causes/:id - Admin update cause
router.put("/causes/:id", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = insertDonationCauseSchema.partial().parse(req.body);
    const cause = await db.update(donationCauses).set(data).where(eq(donationCauses.id, id)).returning();
    res.json(cause[0]);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    res.status(500).json({ error: "Failed to update cause" });
  }
});

// DELETE /api/donations/causes/:id - Admin soft-delete cause
router.delete("/causes/:id", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.update(donationCauses).set({ active: false }).where(eq(donationCauses.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete cause" });
  }
});

// ============ DONATION ACCOUNTS ============

// GET /api/donations/accounts - Public list of active accounts
router.get("/accounts", async (req: Request, res: Response) => {
  try {
    const accounts = await db
      .select()
      .from(donationAccounts)
      .where(eq(donationAccounts.isActive, true));

    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});

// POST /api/donations/accounts - Admin create account
router.post("/accounts", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const data = insertDonationAccountSchema.parse(req.body);
    const account = await db.insert(donationAccounts).values(data).returning();
    res.json(account[0]);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create account" });
  }
});

// PUT /api/donations/accounts/:id - Admin update account
router.put("/accounts/:id", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = insertDonationAccountSchema.partial().parse(req.body);
    const account = await db.update(donationAccounts).set(data).where(eq(donationAccounts.id, id)).returning();
    res.json(account[0]);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    res.status(500).json({ error: "Failed to update account" });
  }
});

// DELETE /api/donations/accounts/:id - Admin deactivate account
router.delete("/accounts/:id", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.update(donationAccounts).set({ isActive: false }).where(eq(donationAccounts.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to deactivate account" });
  }
});

// ============ DONATIONS ============

// POST /api/donations/create - Create donation record
router.post("/create", async (req: Request, res: Response) => {
  try {
    const data = insertDonationSchema.parse(req.body);
    const donation = await db.insert(donations).values(data).returning();
    res.json(donation[0]);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create donation" });
  }
});

// GET /api/donations/user/:id - User donation history
router.get("/user/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userDonations = await db
      .select()
      .from(donations)
      .where(eq(donations.userId, id));

    res.json(userDonations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user donations" });
  }
});

// GET /api/donations/all - Admin view all donations
router.get("/all", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { causeId, fromDate, toDate } = req.query;

    let query = db.select().from(donations);

    // Apply filters
    const conditions: any[] = [];
    if (causeId) conditions.push(eq(donations.causeId, causeId as string));
    if (fromDate) conditions.push(gte(donations.createdAt, new Date(fromDate as string)));
    if (toDate) conditions.push(lte(donations.createdAt, new Date(toDate as string)));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const allDonations = await query;
    res.json(allDonations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch donations" });
  }
});

// ============ SUPPLY REQUESTS ============

// POST /api/donations/supply-request - LHW submit request
router.post("/supply-request", requireAuth, requireRole("lhw"), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const data = insertSupplyRequestSchema.parse({ ...req.body, lhwId: req.user.userId });
    const request = await db.insert(supplyRequests).values(data).returning();
    res.json(request[0]);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create supply request" });
  }
});

// GET /api/donations/supply-request/lhw/:lhwId - LHW request history
router.get("/supply-request/lhw/:lhwId", requireAuth, async (req: Request, res: Response) => {
  try {
    const { lhwId } = req.params;
    const requests = await db
      .select()
      .from(supplyRequests)
      .where(eq(supplyRequests.lhwId, lhwId));

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch supply requests" });
  }
});

// GET /api/donations/supply-requests - Admin list all requests
router.get("/supply-requests", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { status, priorityLevel } = req.query;

    let query = db.select().from(supplyRequests);

    const conditions: any[] = [];
    if (status) conditions.push(eq(supplyRequests.status, status as string));
    if (priorityLevel) conditions.push(eq(supplyRequests.priorityLevel, priorityLevel as string));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const requests = await query;
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch supply requests" });
  }
});

// PUT /api/donations/supply-request/:id - Admin approve/decline/fulfill
router.put("/supply-request/:id", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const request = await db
      .update(supplyRequests)
      .set({ status })
      .where(eq(supplyRequests.id, id))
      .returning();

    res.json(request[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update supply request" });
  }
});

// ============ DONATION ALLOCATIONS ============

// POST /api/donations/allocate - Admin allocate donation
router.post("/allocate", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const data = insertDonationAllocationSchema.parse(req.body);
    const allocation = await db.insert(donationAllocations).values(data).returning();
    res.json(allocation[0]);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    res.status(500).json({ error: "Failed to allocate donation" });
  }
});

// GET /api/donations/allocations - Admin view allocations
router.get("/allocations", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const allocations = await db.select().from(donationAllocations);
    res.json(allocations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch allocations" });
  }
});

// POST /api/donations/verify-allocation - LHW verify allocation
router.post("/verify-allocation/:id", requireAuth, requireRole("lhw"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { verificationMediaUrl } = req.body;

    const allocation = await db
      .update(donationAllocations)
      .set({ verifiedByLhw: true, verificationMediaUrl })
      .where(eq(donationAllocations.id, id))
      .returning();

    res.json(allocation[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to verify allocation" });
  }
});

// ============ COMMUNITY EVENTS / SEMINARS ============

// POST /api/donations/seminars - Admin create event
router.post("/seminars", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const data = insertCommunityEventSchema.parse({ ...req.body, createdBy: req.user.userId });
    const event = await db.insert(communityEvents).values(data).returning();
    res.json(event[0]);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create event" });
  }
});

// GET /api/donations/seminars - Public list events
router.get("/seminars", async (req: Request, res: Response) => {
  try {
    const events = await db.select().from(communityEvents);
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// GET /api/donations/seminars/:id - Event details
router.get("/seminars/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await db.select().from(communityEvents).where(eq(communityEvents.id, id));
    res.json(event[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch event" });
  }
});

// PUT /api/donations/seminars/:id - Admin update event
router.put("/seminars/:id", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = insertCommunityEventSchema.partial().parse(req.body);
    const event = await db.update(communityEvents).set(data).where(eq(communityEvents.id, id)).returning();
    res.json(event[0]);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    res.status(500).json({ error: "Failed to update event" });
  }
});

export default router;
