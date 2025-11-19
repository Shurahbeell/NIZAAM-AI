import express, { type Request, Response, NextFunction } from "express";
import http from "http";
import { setupVite, serveStatic, log } from "./vite";
import { initializeMCP, startEventProcessing } from "./mcp/index";
import { validatePIIProtectionConfig } from "./mcp/services/pii-protection";
import cookieParser from "cookie-parser";
import { rateLimit } from "./middleware/rate-limit";
import errorHandler from "./middleware/error-handler";

// Import MCP bootstrap to register all agents
import "./mcp/bootstrap";

// Import all route modules
import authRoutes from "./routes/auth";
import facilitiesRoutes from "./routes/facilities";
import photosRoutes from "./routes/photos";
import emergenciesRoutes from "./routes/emergencies";
import agentsRoutes from "./routes/agents";
import appointmentsRoutes from "./routes/appointments";
import usersRoutes from "./routes/users";
import analyticsRoutes from "./routes/analytics";
import womensHealthRoutes from "./routes/womens-health";
import vaccinationsRoutes from "./routes/vaccinations";

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Apply global rate limiting: 60 requests per 60 seconds per IP
app.use(rateLimit({ windowMs: 60 * 1000, max: 60 }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // CRITICAL: Validate PII protection configuration before starting
  // This will fail fast if production encryption is misconfigured
  validatePIIProtectionConfig();
  
  // Initialize MCP Multi-Agent System
  await initializeMCP();
  startEventProcessing();
  
  // Mount all API routes with /api prefix
  app.use("/api/auth", authRoutes);
  app.use("/api/emergencies", emergenciesRoutes);
  app.use("/api/agent", agentsRoutes);
  app.use("/api/facilities", facilitiesRoutes);
  app.use("/api/facilities", photosRoutes);
  app.use("/api/appointments", appointmentsRoutes);
  app.use("/api/users", usersRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/womens-health", womensHealthRoutes);
  app.use("/api/vaccinations", vaccinationsRoutes);

  // Global error handler (must be AFTER all routes)
  app.use(errorHandler);

  // Setup HTTP server
  const server = http.createServer(app);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    log(`[MCP] Multi-Agent System online with ${process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ? 'Replit AI' : 'OpenAI'}`);
  });
})();
