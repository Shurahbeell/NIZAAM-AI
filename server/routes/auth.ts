import { Router, type Request, Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { storage } from "../storage";
import { generateToken, requireAuth } from "../middleware/auth";

const router = Router();

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(4),
  role: z.enum(["patient", "hospital", "frontliner"]),
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

    console.log("[Auth] 🔍 NEW USER CREATED:", {
      id: user.id,
      username: user.username,
      role: user.role,
      requestedUsername: data.username,
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role as "patient" | "hospital" | "frontliner",
      hospitalId: user.hospitalId || undefined,
    });

    console.log("[Auth] 🔑 TOKEN GENERATED FOR:", user.username, "ID:", user.id);

    const response = {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        hospitalId: user.hospitalId,
        // Include profile fields
        fullName: user.fullName,
        phone: user.phone,
        cnic: user.cnic,
        address: user.address,
        age: user.age,
        bloodGroup: user.bloodGroup,
        emergencyContact: user.emergencyContact,
      },
    };

    console.log("[Auth] 📤 SENDING RESPONSE:", JSON.stringify(response.user));

    res.json(response);
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
      role: user.role as "patient" | "hospital" | "frontliner",
      hospitalId: user.hospitalId || undefined,
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        hospitalId: user.hospitalId,
        // Include profile fields
        fullName: user.fullName,
        phone: user.phone,
        cnic: user.cnic,
        address: user.address,
        age: user.age,
        bloodGroup: user.bloodGroup,
        emergencyContact: user.emergencyContact,
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
      // Include profile fields
      fullName: user.fullName,
      phone: user.phone,
      cnic: user.cnic,
      address: user.address,
      age: user.age,
      bloodGroup: user.bloodGroup,
      emergencyContact: user.emergencyContact,
    });
  } catch (error: any) {
    console.error("[Auth] Me error:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Get user by ID (protected - can only get own profile)
router.get("/users/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    // Only allow users to get their own profile
    if (req.user!.userId !== req.params.id) {
      return res.status(403).json({ error: "Not authorized to view this profile" });
    }

    const user = await storage.getUser(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      hospitalId: user.hospitalId,
      fullName: user.fullName,
      phone: user.phone,
      cnic: user.cnic,
      address: user.address,
      age: user.age,
      bloodGroup: user.bloodGroup,
      emergencyContact: user.emergencyContact,
    });
  } catch (error: any) {
    console.error("[Auth] Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

// Update user profile (protected - can only update own profile)
const updateProfileSchema = z.object({
  fullName: z.string().optional(),
  phone: z.string().optional(),
  cnic: z.string().optional(),
  address: z.string().optional(),
  age: z.union([z.number(), z.string()]).transform(val => {
    if (typeof val === 'string') {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  }).optional(),
  bloodGroup: z.string().optional(),
  emergencyContact: z.string().optional(),
});

router.patch("/users/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    // Only allow users to update their own profile
    if (req.user!.userId !== req.params.id) {
      return res.status(403).json({ error: "Not authorized to update this profile" });
    }

    const data = updateProfileSchema.parse(req.body);
    const updatedUser = await storage.updateUserProfile(req.params.id, data);
    
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: updatedUser.id,
      username: updatedUser.username,
      role: updatedUser.role,
      hospitalId: updatedUser.hospitalId,
      fullName: updatedUser.fullName,
      phone: updatedUser.phone,
      cnic: updatedUser.cnic,
      address: updatedUser.address,
      age: updatedUser.age,
      bloodGroup: updatedUser.bloodGroup,
      emergencyContact: updatedUser.emergencyContact,
    });
  } catch (error: any) {
    console.error("[Auth] Update profile error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
