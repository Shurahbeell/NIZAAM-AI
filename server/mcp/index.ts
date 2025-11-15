import OpenAI from "openai";
import { EventBus } from "./orchestrator/event-bus";
import { AgentRegistry } from "./orchestrator/agent-registry";
import { triageAgent } from "./agents/triage-agent";

// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access
// without requiring your own OpenAI API key. Charges are billed to your credits.
// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
export const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

// Initialize event bus for agent-to-agent communication
export const eventBus = new EventBus();

// Initialize agent registry
export const agentRegistry = new AgentRegistry(eventBus);

// MCP Server Configuration
export const MCP_CONFIG = {
  model: "gpt-5", // Latest OpenAI model
  temperature: 1, // Default for gpt-5 (cannot be changed)
  maxTokens: 8192,
  retries: 7,
  minTimeout: 2000,
  maxTimeout: 128000,
  concurrencyLimit: 2
};

// Initialize MCP server
export async function initializeMCP() {
  console.log("[MCP] Initializing Multi-Agent System...");
  
  // Register Triage Agent
  agentRegistry.register("triage", triageAgent);
  
  // TODO: Register remaining agents when implemented
  // agentRegistry.register("eligibility", eligibilityAgent);
  // agentRegistry.register("facility", facilityAgent);
  // agentRegistry.register("followup", followupAgent);
  // agentRegistry.register("analytics", analyticsAgent);
  // agentRegistry.register("knowledge", knowledgeAgent);
  
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
