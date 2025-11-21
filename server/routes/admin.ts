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

// Bootstrap: Create first admin account (only works if no admins exist)
const bootstrapSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(4),
  bootstrapKey: z.string(),
});

router.post("/bootstrap", async (req: Request, res: Response) => {
  try {
    const { username, password, bootstrapKey } = bootstrapSchema.parse(req.body);

    // Verify bootstrap key from environment
    const validBootstrapKey = process.env.BOOTSTRAP_KEY || "bootstrap-1122-admin";
    if (bootstrapKey !== validBootstrapKey) {
      return res.status(403).json({ error: "Invalid bootstrap key" });
    }

    // Check if any admin exists
    const existingAdmins = await storage.getUsersByRole("admin");
    if (existingAdmins.length > 0) {
      return res.status(400).json({ error: "Admin account already exists. Use /login instead." });
    }

    // Check if username exists
    const existing = await storage.getUserByUsername(username);
    if (existing) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Hash password and create admin user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await storage.createUser({
      username,
      password: hashedPassword,
      role: "admin",
    });

    // Generate token for immediate login
    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: "admin" as any,
    });

    console.log(`[Admin] Bootstrap: First admin account created - ${username}`);

    res.json({
      token,
      user: { id: user.id, username: user.username, role: "admin" },
      message: "Admin account created successfully. You are now logged in.",
    });
  } catch (error: any) {
    console.error("[Admin] Bootstrap error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input" });
    }
    res.status(500).json({ error: "Bootstrap failed" });
  }
});

// Admin login
const adminLoginSchema = z.object({
  username: z.string(),
  password: z.string(),
  adminKey: z.string(),
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
  latitude: z.string().min(1, "Hospital latitude is required"),
  longitude: z.string().min(1, "Hospital longitude is required"),
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
      latitude: data.latitude,
      longitude: data.longitude,
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
  currentLatitude: z.string().min(1, "Current latitude is required"),
  currentLongitude: z.string().min(1, "Current longitude is required"),
  baseLatitude: z.string().min(1, "Base station latitude is required"),
  baseLongitude: z.string().min(1, "Base station longitude is required"),
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

    // Create frontliner profile with location
    const frontliner = await storage.createFrontliner({
      userId: user.id,
      organization: "Rescue 1122",
      vehicleType: data.vehicleType || "Ambulance",
      currentLat: data.currentLatitude,
      currentLng: data.currentLongitude,
      baseLatitude: data.baseLatitude,
      baseLongitude: data.baseLongitude,
      isAvailable: true,
    });

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

// Get all hospitals (public - used by appointments booking)
router.get("/hospitals", async (req: Request, res: Response) => {
  try {
    const hospitals = await storage.getAllHospitals();
    res.json(hospitals.map(h => ({ id: h.id, name: h.name, address: h.address, phone: h.phone, type: h.type })));
  } catch (error: any) {
    console.error("[Admin] Get hospitals error:", error);
    res.status(500).json({ error: "Failed to fetch hospitals" });
  }
});

export default router;
