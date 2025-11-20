import { Router, type Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// Register frontliner (create a frontliner profile for an existing user)
const registerFrontlinerSchema = z.object({
  userId: z.string(),
  vehicleType: z.string().optional(),
  organization: z.string().optional(),
});

router.post("/register", requireAuth, async (req: Request, res: Response) => {
  try {
    const data = registerFrontlinerSchema.parse(req.body);
    
    // Check if frontliner profile already exists for this user
    const existing = await storage.getFrontlinerByUserId(data.userId);
    if (existing) {
      return res.status(400).json({ error: "Frontliner profile already exists for this user" });
    }

    // Create frontliner profile
    const frontliner = await storage.createFrontliner({
      userId: data.userId,
      vehicleType: data.vehicleType,
      organization: data.organization,
      isAvailable: true,
    });

    res.json({ success: true, frontliner });
  } catch (error: any) {
    console.error("[Frontliners] Register error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    res.status(500).json({ error: "Failed to register frontliner" });
  }
});

// Update frontliner location
const updateLocationSchema = z.object({
  lat: z.string(),
  lng: z.string(),
  isAvailable: z.boolean().optional(),
});

router.patch("/:id/location", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateLocationSchema.parse(req.body);

    // Update location
    const frontliner = await storage.updateFrontlinerLocation(
      id,
      data.lat,
      data.lng,
      data.isAvailable
    );

    if (!frontliner) {
      return res.status(404).json({ error: "Frontliner not found" });
    }

    res.json({ success: true, frontliner });
  } catch (error: any) {
    console.error("[Frontliners] Update location error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    res.status(500).json({ error: "Failed to update location" });
  }
});

// Get frontliner by ID
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const frontliner = await storage.getFrontlinerById(id);

    if (!frontliner) {
      return res.status(404).json({ error: "Frontliner not found" });
    }

    res.json({ success: true, frontliner });
  } catch (error: any) {
    console.error("[Frontliners] Get frontliner error:", error);
    res.status(500).json({ error: "Failed to get frontliner" });
  }
});

// Get frontliner by user ID
router.get("/user/:userId", requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const frontliner = await storage.getFrontlinerByUserId(userId);

    if (!frontliner) {
      return res.status(404).json({ error: "Frontliner not found" });
    }

    res.json({ success: true, frontliner });
  } catch (error: any) {
    console.error("[Frontliners] Get frontliner by user error:", error);
    res.status(500).json({ error: "Failed to get frontliner" });
  }
});

// Get open cases for a frontliner
router.get("/:id/cases", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cases = await storage.getOpenCasesForFrontliner(id);

    res.json({ success: true, cases });
  } catch (error: any) {
    console.error("[Frontliners] Get cases error:", error);
    res.status(500).json({ error: "Failed to get cases" });
  }
});

export default router;
