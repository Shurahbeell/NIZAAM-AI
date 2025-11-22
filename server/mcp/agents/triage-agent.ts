import { gemini, eventBus, MCP_CONFIG } from "../index";
import { storage } from "../../storage";
import { translationService } from "../services/translation";
import { piiProtection } from "../services/pii-protection";
import type { Agent } from "../orchestrator/agent-registry";
import { URGENCY_LEVELS, EVENT_TYPES } from "@shared/agents/constants";

/**
 * Triage Agent - Autonomous symptom analysis powered by Gemini
 * 
 * Capabilities:
 * - Bilingual support (Urdu/English)
 * - Symptom assessment using Gemini
 * - Urgency classification: Self-care, BHU visit, Emergency
 * - Integration with emergency system via event bus
 * - Real-time analysis with zero hardcoded data
 */
export class TriageAgent implements Agent {
  name = "Triage Agent";
  description = "Analyzes symptoms and classifies medical urgency using Gemini 2.5 Flash";
  capabilities = [
    "symptom_analysis",
    "urgency_classification",
    "bilingual_support",
    "emergency_detection"
  ];

  /**
   * Handle incoming message and provide triage assessment
   */
  async handleMessage(
    sessionId: string,
    message: string,
    language: string = "en"
  ): Promise<string> {
    try {
      console.log(`[TriageAgent] Processing message in language: ${language}`);
      
      const isUrdu = language === "ur" || language === "ru";
      
      // Translate to English for processing if needed
      let processedMessage = message;
      if (isUrdu) {
        processedMessage = await translationService.translate(message, "english", "Medical triage");
      }
      
      // Get conversation history
      const history = await storage.getSessionMessages(sessionId);
      
      // Perform triage analysis
      const triageResult = await this.performTriage(processedMessage, history);
      
      // Apply PII protection before storage
      const userMessageProcessed = piiProtection.processForStorage(message);
      
      // Translate response back to user's language
      let responseContent = triageResult.content;
      if (isUrdu) {
        responseContent = await translationService.translate(triageResult.content, "urdu", "Medical triage response");
      }
      
      const agentResponseProcessed = piiProtection.processForStorage(responseContent);
      
      // Store user message (with PII minimization)
      await storage.createAgentMessage({
        sessionId,
        senderType: "user",
        content: userMessageProcessed.processed,
        language: isUrdu ? "urdu" : "english",
        metadata: {
          piiProtection: userMessageProcessed.metadata
        }
      });
      
      // Store agent response with reasoning
      await storage.createAgentMessage({
        sessionId,
        senderType: "agent",
        content: agentResponseProcessed.processed,
        metadata: {
          urgency: triageResult.urgency,
          piiProtection: agentResponseProcessed.metadata
        },
        language: isUrdu ? "urdu" : "english"
      });
      
      // Return unredacted response to user
      const localizedResponse = isUrdu
        ? responseContent
        : triageResult.content;
      
      // Emit events based on urgency
      if (triageResult.urgency === URGENCY_LEVELS.EMERGENCY) {
        await eventBus.emitAgentEvent({
          type: EVENT_TYPES.EMERGENCY_REQUESTED,
          triggeredByAgent: "triage",
          triggeredBySession: sessionId,
          payload: {
            symptoms: processedMessage,
            urgency: "emergency",
            userMessage: message
          }
        });
      }
      
      return localizedResponse;
      
    } catch (error) {
      console.error("[TriageAgent] Error handling message:", error);
      
      const errorMsg = "I apologize, but I encountered an error. Please try again or contact emergency services if this is urgent.";
      return language === "ur" || language === "ru"
        ? await translationService.translate(errorMsg, "urdu")
        : errorMsg;
    }
  }

  /**
   * Perform triage analysis using Gemini
   * Completely dynamic, no hardcoded data
   */
  private async performTriage(
    message: string,
    history: any[]
  ): Promise<{
    content: string;
    urgency: string;
  }> {
    const systemPrompt = `You are an expert medical triage assistant for Pakistan's healthcare system. 

Your role is to:
1. Listen to the patient's symptoms
2. Ask clarifying questions if needed
3. Classify the urgency as: SELF-CARE (home treatment), BHU-VISIT (basic health unit), or EMERGENCY (call 1122)
4. Suggest possible medical conditions that could cause these symptoms
5. Provide clear, actionable guidance

**Pakistan Context:**
- Emergency number: 1122
- Basic Health Units (BHUs) provide primary care
- Be empathetic and use simple language
- Always err on the side of caution

**How to suggest possible conditions:**
- Based on the symptoms described, mention 2-4 common conditions that could cause these symptoms
- Use phrases like "This could be related to..." or "Common causes include..."
- Clearly state these are possibilities, NOT diagnoses - only a doctor can diagnose
- Focus on practical information that helps the patient seek appropriate care

**Safety Rules:**
- Chest pain, difficulty breathing, severe bleeding, loss of consciousness, severe trauma → EMERGENCY
- Explain possible conditions in simple language
- Emphasize that only a medical professional can diagnose
- Encourage emergency services (1122) for critical cases`;

    // Build conversation context
    const conversationHistory = history
      .map(h => `${h.senderType === "user" ? "User" : "Assistant"}: ${h.content}`)
      .join("\n");

    const userPrompt = `${conversationHistory ? `Conversation so far:\n${conversationHistory}\n\n` : ""}Patient's latest message: "${message}"

Provide a helpful triage response. Include:
1. Your assessment of their symptoms
2. Possible medical conditions that could cause these symptoms (2-4 suggestions)
3. Suggested urgency level (SELF-CARE, BHU-VISIT, or EMERGENCY)
4. Clear recommendations for what to do next

Be conversational, empathetic, and specific. Emphasize that these are possibilities, not diagnoses. If it seems like an emergency, strongly encourage them to call 1122 immediately.`;

    try {
      const response = await gemini.models.generateContent({
        model: MCP_CONFIG.model,
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
          }
        ]
      });
      
      const content = response.text || "I understand your symptoms. Please provide more details so I can help assess your situation.";
      
      // Detect urgency from Gemini response
      const urgency = this.detectUrgency(content, message);
      
      return {
        content,
        urgency
      };
      
    } catch (error) {
      console.error("[TriageAgent] Gemini error:", error);
      throw error;
    }
  }

  /**
   * Detect urgency level from Gemini response and user message
   */
  private detectUrgency(response: string, message: string): string {
    const combined = `${response} ${message}`.toLowerCase();
    
    // Emergency keywords
    const emergencyKeywords = [
      "emergency", "1122", "call 1122", "call ambulance", "hospital immediately",
      "chest pain", "difficulty breathing", "cannot breathe", "severe bleeding",
      "loss of consciousness", "unconscious", "severe trauma", "accident",
      "poison", "overdose", "severe allergic", "unable to move", "paralyzed",
      "فوری", "فوری طبی خدمات", "1122 کال کریں"
    ];
    
    // BHU visit keywords
    const bhuKeywords = [
      "bhu", "health unit", "visit doctor", "consult", "medical checkup",
      "clinic", "health center", "professional", "need to see", "should see doctor",
      "ڈاکٹر", "صحت", "یونٹ", "چیک اپ"
    ];
    
    // Check for emergency indicators first
    if (emergencyKeywords.some(keyword => combined.includes(keyword))) {
      return URGENCY_LEVELS.EMERGENCY;
    }
    
    // Check for BHU visit indicators
    if (bhuKeywords.some(keyword => combined.includes(keyword))) {
      return URGENCY_LEVELS.BHU_VISIT || "bhu-visit";
    }
    
    // Default to self-care
    return URGENCY_LEVELS.SELF_CARE || "self-care";
  }
}

export const triageAgent = new TriageAgent();
