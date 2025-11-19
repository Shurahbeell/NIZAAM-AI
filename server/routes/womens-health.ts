import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { storage } from "../storage";

const router = Router();

// GET women's health awareness topics
router.get("/topics", async (req: Request, res: Response) => {
  try {
    const topics = await storage.getWomensHealthTopics();
    res.json({ topics });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET specific topic by ID
router.get("/topics/:id", async (req: Request, res: Response) => {
  try {
    const topic = await storage.getWomensHealthTopic(req.params.id);
    if (!topic) {
      return res.status(404).json({ error: "Topic not found" });
    }
    res.json({ topic });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET screening reminders for authenticated user
router.get("/reminders", requireAuth, async (req: Request, res: Response) => {
  try {
    const reminders = await storage.getUserScreeningReminders(req.user!.userId);
    res.json({ reminders });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
