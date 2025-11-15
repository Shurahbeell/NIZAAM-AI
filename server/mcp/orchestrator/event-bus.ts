import { EventEmitter } from "events";
import { storage } from "../../storage";
import type { AgentEvent, InsertAgentEvent } from "@shared/schema";

export type EventHandler = (event: AgentEvent) => Promise<void>;

/**
 * Event Bus for inter-agent communication
 * Enables autonomous agent-to-agent coordination through event emission and subscription
 */
export class EventBus extends EventEmitter {
  private handlers: Map<string, EventHandler[]> = new Map();
  private isProcessing: boolean = false;
  private processingInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.setMaxListeners(50); // Support many agents listening
  }

  /**
   * Emit an event that will be persisted and processed
   */
  async emitAgentEvent(eventData: InsertAgentEvent): Promise<AgentEvent> {
    // Persist event to database
    const event = await storage.createAgentEvent(eventData);
    
    // Emit to in-memory event system for immediate processing
    this.emit(event.type, event);
    
    console.log(`[EventBus] Event emitted: ${event.type} by ${event.triggeredByAgent || "system"}`);
    
    return event;
  }

  /**
   * Subscribe to a specific event type
   */
  subscribe(eventType: string, handler: EventHandler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
    
    // Also subscribe to EventEmitter for real-time handling
    this.on(eventType, async (event: AgentEvent) => {
      try {
        await handler(event);
        await storage.updateAgentEventStatus(event.id, "completed");
      } catch (error) {
        console.error(`[EventBus] Error handling event ${event.id}:`, error);
        await storage.updateAgentEventStatus(event.id, "failed");
      }
    });
    
    console.log(`[EventBus] Handler registered for event type: ${eventType}`);
  }

  /**
   * Start background processing of pending events
   * Ensures autonomous execution even if in-memory handlers miss events
   */
  startProcessing() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    // Process pending events every 30 seconds
    this.processingInterval = setInterval(async () => {
      await this.processPendingEvents();
    }, 30000);
    
    // Process immediately on start
    this.processPendingEvents();
  }

  /**
   * Stop background event processing
   */
  stopProcessing() {
    this.isProcessing = false;
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  /**
   * Process all pending events from database
   */
  private async processPendingEvents() {
    try {
      const pendingEvents = await storage.getPendingAgentEvents();
      
      for (const event of pendingEvents) {
        const handlers = this.handlers.get(event.type) || [];
        
        if (handlers.length === 0) {
          // No handlers registered, mark as failed
          await storage.updateAgentEventStatus(event.id, "failed");
          continue;
        }
        
        // Execute all handlers for this event type
        await Promise.all(
          handlers.map(async (handler) => {
            try {
              await handler(event);
            } catch (error) {
              console.error(`[EventBus] Error in handler for event ${event.id}:`, error);
            }
          })
        );
        
        // Mark event as completed
        await storage.updateAgentEventStatus(event.id, "completed");
      }
    } catch (error) {
      console.error("[EventBus] Error processing pending events:", error);
    }
  }

  /**
   * Get all handlers for an event type
   */
  getHandlers(eventType: string): EventHandler[] {
    return this.handlers.get(eventType) || [];
  }
}
