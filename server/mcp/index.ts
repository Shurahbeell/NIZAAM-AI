import { GoogleGenAI } from "@google/genai";
import { EventBus } from "./orchestrator/event-bus";
import { AgentRegistry } from "./orchestrator/agent-registry";
import { triageAgent } from "./agents/triage-agent";
import { healthProgramsAgent } from "./agents/eligibility-agent";
import { facilityFinderAgent } from "./agents/facility-finder-agent";
import { followUpAgent } from "./agents/followup-agent";
import { healthAnalyticsAgent } from "./agents/analytics-agent";
import { knowledgeAgent } from "./agents/knowledge-agent";

// This is using Replit's AI Integrations service, which provides Gemini-compatible API access
// without requiring your own Gemini API key. Charges are billed to your credits.
export const gemini = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

// Initialize event bus for agent-to-agent communication
export const eventBus = new EventBus();

// Initialize agent registry
export const agentRegistry = new AgentRegistry(eventBus);

// MCP Server Configuration
export const MCP_CONFIG = {
  model: "gemini-2.5-flash", // Fast and efficient Gemini model
  temperature: 1,
  maxTokens: 8192,
  retries: 7,
  minTimeout: 2000,
  maxTimeout: 128000,
  concurrencyLimit: 2
};

// Initialize MCP server
export async function initializeMCP() {
  console.log("[MCP] Initializing Multi-Agent System...");
  
  // Register all agents
  agentRegistry.register("triage", triageAgent);
  agentRegistry.register("eligibility", healthProgramsAgent);
  agentRegistry.register("facility", facilityFinderAgent);
  agentRegistry.register("followup", followUpAgent);
  agentRegistry.register("analytics", healthAnalyticsAgent);
  agentRegistry.register("knowledge", knowledgeAgent);
  
  console.log("[MCP] Multi-Agent System initialized successfully");
  console.log(`[MCP] Registered agents: ${agentRegistry.getAllAgents().map(a => a.name).join(", ")}`);
}

// Start background event processing
export function startEventProcessing() {
  eventBus.startProcessing();
  console.log("[MCP] Event processing started");
}

// Graceful shutdown
export async function shutdownMCP() {
  console.log("[MCP] Shutting down Multi-Agent System...");
  eventBus.stopProcessing();
  console.log("[MCP] Multi-Agent System shut down successfully");
}
