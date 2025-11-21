import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeMCP, startEventProcessing } from "./mcp/index";
import { validatePIIProtectionConfig } from "./mcp/services/pii-protection";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth";
import facilitiesRoutes from "./routes/facilities";
import photosRoutes from "./routes/photos";
import emergenciesRoutes from "./routes/emergencies";
import agentsRoutes from "./routes/agents";
import frontlinersRoutes from "./routes/frontliners";
import dispatchRoutes from "./routes/dispatch";
import adminRoutes from "./routes/admin";

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
  
  // Mount API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/emergencies", emergenciesRoutes);
  app.use("/api/agent", agentsRoutes);
  app.use("/api/facilities", facilitiesRoutes);
  app.use("/api/facilities", photosRoutes);
  app.use("/api/frontliners", frontlinersRoutes);
  app.use("/api/dispatch", dispatchRoutes);
  app.use("/api/admin", adminRoutes);
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

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
