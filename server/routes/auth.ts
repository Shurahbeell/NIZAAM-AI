import { Router, type Request, Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { storage } from "../storage";
import { generateToken, requireAuth } from "../middleware/auth";

const router = Router();

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(4),
  role: z.enum(["patient", "hospital"]),
  hospitalId: z.string().optional(),
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

// Register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    
    // Check if user already exists
    const existing = await storage.getUserByUsername(data.username);
    if (existing) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await storage.createUser({
      username: data.username,
      password: hashedPassword,
      role: data.role,
      hospitalId: data.hospitalId,
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role as "patient" | "hospital",
      hospitalId: user.hospitalId || undefined,
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        hospitalId: user.hospitalId,
      },
    });
  } catch (error: any) {
    console.error("[Auth] Register error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);

    // Find user
    const user = await storage.getUserByUsername(data.username);
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Verify password
    const validPassword = await bcrypt.compare(data.password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role as "patient" | "hospital",
      hospitalId: user.hospitalId || undefined,
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        hospitalId: user.hospitalId,
      },
    });
  } catch (error: any) {
    console.error("[Auth] Login error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    res.status(500).json({ error: "Login failed" });
  }
});

// Get current user
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await storage.getUser(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      hospitalId: user.hospitalId,
    });
  } catch (error: any) {
    console.error("[Auth] Me error:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

export default router;
