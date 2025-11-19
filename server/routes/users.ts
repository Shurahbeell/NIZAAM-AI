import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET current user profile
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    res.json({ user: req.user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update user profile
router.put("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    // TODO: Implement profile update with storage layer
    res.json({ message: "Profile updated", username });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
