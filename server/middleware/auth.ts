import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET;

if (!JWT_SECRET) {
  if (process.env.NODE_ENV === "production") {
    console.error("FATAL: JWT_SECRET environment variable is required in production!");
    console.error("Please set JWT_SECRET in your environment variables.");
    process.exit(1);
  } else {
    console.warn("WARNING: JWT_SECRET not set, using development fallback.");
    console.warn("This is INSECURE and should NEVER be used in production!");
  }
}

// Use a deterministic dev secret that changes per app instance
const DEV_SECRET = "dev-secret-" + (process.env.REPL_SLUG || "local");
const SECRET = JWT_SECRET || DEV_SECRET;

export interface JWTPayload {
  userId: string;
  username: string;
  role: "patient" | "hospital" | "frontliner";
  hospitalId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, SECRET) as JWTPayload;
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(...roles: ("patient" | "hospital" | "frontliner")[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Required role: ${roles.join(" or ")}` });
    }

    next();
  };
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}
