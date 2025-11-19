/**
 * MCP Agent Bootstrap
 * Registers all agents in the Multi-Agent System
 */
import { agentRegistry } from "./index";
import { triageAgent } from "./agents/triage-agent";
import { eligibilityAgent } from "./agents/eligibility-agent";
import { facilityFinderAgent } from "./agents/facility-finder-agent";
import { followUpAgent } from "./agents/followup-agent";
import { healthAnalyticsAgent } from "./agents/analytics-agent";
import { knowledgeAgent } from "./agents/knowledge-agent";

console.log("[Bootstrap] Registering MCP agents...");

// Register all agents
agentRegistry.register("triage", triageAgent);
agentRegistry.register("eligibility", eligibilityAgent);
agentRegistry.register("facility", facilityFinderAgent);
agentRegistry.register("followup", followUpAgent);
agentRegistry.register("analytics", healthAnalyticsAgent);
agentRegistry.register("knowledge", knowledgeAgent);

console.log("[Bootstrap] All agents registered successfully");
