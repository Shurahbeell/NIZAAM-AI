import type { EventBus } from "./event-bus";

export interface Agent {
  name: string;
  description: string;
  capabilities: string[];
  handleMessage: (sessionId: string, message: string, language: string) => Promise<string>;
  autonomousActions?: () => Promise<void>;
}

/**
 * Agent Registry manages all AI agents in the system
 * Provides centralized registration, discovery, and coordination
 */
export class AgentRegistry {
  private agents: Map<string, Agent> = new Map();
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  /**
   * Register a new agent
   */
  register(agentName: string, agent: Agent) {
    if (this.agents.has(agentName)) {
      console.warn(`[AgentRegistry] Agent ${agentName} already registered, overwriting`);
    }
    
    this.agents.set(agentName, agent);
    console.log(`[AgentRegistry] Registered agent: ${agentName}`);
    console.log(`  - Capabilities: ${agent.capabilities.join(", ")}`);
    
    // Subscribe agent to relevant events
    this.subscribeAgentToEvents(agentName, agent);
  }

  /**
   * Get an agent by name
   */
  getAgent(agentName: string): Agent | undefined {
    return this.agents.get(agentName);
  }

  /**
   * Get all registered agents
   */
  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Find agents by capability
   */
  findAgentsByCapability(capability: string): Agent[] {
    return this.getAllAgents().filter(agent => 
      agent.capabilities.includes(capability)
    );
  }

  /**
   * Route a message to the appropriate agent
   */
  async routeMessage(
    agentName: string,
    sessionId: string,
    message: string,
    language: string = "english"
  ): Promise<string> {
    const agent = this.getAgent(agentName);
    
    if (!agent) {
      throw new Error(`Agent ${agentName} not found`);
    }
    
    console.log(`[AgentRegistry] Routing message to ${agentName}`);
    return await agent.handleMessage(sessionId, message, language);
  }

  /**
   * Subscribe agent to events it should handle
   */
  private subscribeAgentToEvents(agentName: string, agent: Agent) {
    // Example event subscriptions based on agent type
    if (agentName === "triage") {
      // Triage agent listens for new emergency requests
      this.eventBus.subscribe("EmergencyRequested", async (event) => {
        console.log(`[${agentName}] Handling EmergencyRequested event`);
        // Agent will process the emergency and emit EmergencyCreated event
      });
    }
    
    if (agentName === "facility") {
      // Facility finder listens for facility search requests
      this.eventBus.subscribe("FacilitySearchRequested", async (event) => {
        console.log(`[${agentName}] Handling FacilitySearchRequested event`);
        // Agent will find facilities and emit FacilityRecommended event
      });
    }
    
    if (agentName === "knowledge") {
      // Knowledge agent listens for all agent events to detect patterns
      this.eventBus.subscribe("EmergencyCreated", async (event) => {
        console.log(`[${agentName}] Analyzing EmergencyCreated for patterns`);
        // Knowledge agent analyzes for outbreak patterns
      });
    }
  }

  /**
   * Trigger autonomous actions for all agents
   * Called periodically to allow agents to take proactive actions
   */
  async triggerAutonomousActions() {
    const entries = Array.from(this.agents.entries());
    for (const [name, agent] of entries) {
      if (agent.autonomousActions) {
        try {
          console.log(`[AgentRegistry] Triggering autonomous actions for ${name}`);
          await agent.autonomousActions();
        } catch (error) {
          console.error(`[AgentRegistry] Error in autonomous actions for ${name}:`, error);
        }
      }
    }
  }
}
