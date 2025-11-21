import { Router, type Request, Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { storage } from "../storage";
import { requireAuth, generateToken } from "../middleware/auth";

const router = Router();

// Admin auth middleware
const requireAdmin = (req: Request, res: Response, next: Function) => {
  requireAuth(req, res, () => {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  });
};

// Admin login
const adminLoginSchema = z.object({
  username: z.string(),
  password: z.string(),
  adminKey: z.string(), // Hardcoded or env-based admin key for first login
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password, adminKey } = adminLoginSchema.parse(req.body);

    // Verify admin key (for security, this should be in env)
    const validAdminKey = process.env.ADMIN_KEY || "admin-key-1122";
    if (adminKey !== validAdminKey) {
      return res.status(403).json({ error: "Invalid admin key" });
    }

    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ error: "Not an admin user" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: "admin" as any,
    });

    res.json({ token, user: { id: user.id, username: user.username, role: "admin" } });
  } catch (error: any) {
    console.error("[Admin] Login error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input" });
    }
    res.status(500).json({ error: "Login failed" });
  }
});

// Register hospital (admin only)
const registerHospitalSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(4),
  hospitalName: z.string().min(3),
  hospitalAddress: z.string().min(5),
  hospitalPhone: z.string().min(10),
  hospitalType: z.enum(["government", "private"]),
  facilities: z.array(z.string()).optional(),
});

router.post("/register/hospital", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const data = registerHospitalSchema.parse(req.body);

    // Check if user exists
    const existing = await storage.getUserByUsername(data.username);
    if (existing) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Create hospital first
    const hospital = await storage.createHospital({
      name: data.hospitalName,
      address: data.hospitalAddress,
      phone: data.hospitalPhone,
      type: data.hospitalType,
      facilities: data.facilities || [],
    });

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await storage.createUser({
      username: data.username,
      password: hashedPassword,
      role: "hospital",
      hospitalId: hospital.id,
    });

    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: "hospital",
      hospitalId: hospital.id,
    });

    res.json({
      token,
      user: { id: user.id, username: user.username, role: "hospital" },
      hospital,
    });
  } catch (error: any) {
    console.error("[Admin] Register hospital error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input" });
    }
    res.status(500).json({ error: "Registration failed" });
  }
});

// Register frontliner (admin only)
const registerFrontlinerSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(4),
  fullName: z.string().min(3),
  phone: z.string().min(10),
  vehicleType: z.string().optional(),
});

router.post("/register/frontliner", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const data = registerFrontlinerSchema.parse(req.body);

    const existing = await storage.getUserByUsername(data.username);
    if (existing) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await storage.createUser({
      username: data.username,
      password: hashedPassword,
      role: "frontliner",
      fullName: data.fullName,
      phone: data.phone,
    });

    // Auto-create frontliner profile
    const frontliner = await storage.ensureFrontlinerProfile(user.id);
    if (data.vehicleType) {
      // Update vehicle type if provided - would need storage method
    }

    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: "frontliner",
    });

    res.json({
      token,
      user: { id: user.id, username: user.username, role: "frontliner" },
      frontliner,
    });
  } catch (error: any) {
    console.error("[Admin] Register frontliner error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input" });
    }
    res.status(500).json({ error: "Registration failed" });
  }
});

// Get all users (admin only)
router.get("/users", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const users = await storage.getAllUsers();
    res.json(users.map(u => ({ id: u.id, username: u.username, role: u.role, fullName: u.fullName, phone: u.phone })));
  } catch (error: any) {
    console.error("[Admin] Get users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get users by role (admin only)
router.get("/users/role/:role", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const users = await storage.getUsersByRole(req.params.role);
    res.json(users.map(u => ({ id: u.id, username: u.username, role: u.role, fullName: u.fullName, phone: u.phone })));
  } catch (error: any) {
    console.error("[Admin] Get users by role error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Delete user (admin only)
router.delete("/users/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    if (req.params.id === req.user?.userId) {
      return res.status(400).json({ error: "Cannot delete yourself" });
    }
    await storage.deleteUser(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    console.error("[Admin] Delete user error:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
