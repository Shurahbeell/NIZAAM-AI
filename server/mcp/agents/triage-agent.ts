import { openai, eventBus, MCP_CONFIG } from "../index";
import { storage } from "../../storage";
import { translationService } from "../services/translation";
import { piiProtection } from "../services/pii-protection";
import type { Agent } from "../orchestrator/agent-registry";
import type { TriageResult } from "@shared/agents/types";
import { URGENCY_LEVELS, EVENT_TYPES } from "@shared/agents/constants";

/**
 * Triage Agent - Autonomous symptom analysis and urgency classification
 * 
 * Capabilities:
 * - Bilingual support (Urdu/English)
 * - Few-shot learning for symptom assessment
 * - Urgency classification: Self-care, BHU visit, Emergency
 * - Integration with emergency system via event bus
 * - Reasoning traces for transparency
 */
export class TriageAgent implements Agent {
  name = "Triage Agent";
  description = "Analyzes symptoms and classifies medical urgency using GPT-5 few-shot learning";
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
    language: string = "english"
  ): Promise<string> {
    try {
      console.log(`[TriageAgent] Processing message in ${language}`);
      
      // Detect language if not specified
      const detectedLanguage = await translationService.detectLanguage(message);
      const userLanguage = language === "urdu" || detectedLanguage === "urdu" ? "urdu" : "english";
      
      // Translate to English for processing if needed
      let processedMessage = message;
      if (userLanguage === "urdu") {
        processedMessage = await translationService.translate(message, "english", "Medical triage");
      }
      
      // Get conversation history
      const history = await storage.getSessionMessages(sessionId);
      
      // Perform triage analysis
      const triageResult = await this.performTriage(sessionId, processedMessage, history);
      
      // Apply PII protection before storage
      const userMessageProcessed = piiProtection.processForStorage(message);
      const agentResponseProcessed = piiProtection.processForStorage(
        userLanguage === "urdu" 
          ? await translationService.translate(triageResult.content, "urdu", "Medical triage response")
          : triageResult.content
      );
      
      // Store user message (with PII minimization)
      await storage.createAgentMessage({
        sessionId,
        senderType: "user",
        content: userMessageProcessed.processed,
        language: userLanguage,
        metadata: {
          piiProtection: userMessageProcessed.metadata
        }
      });
      
      // Store agent response with reasoning (in user's language, with PII minimization)
      await storage.createAgentMessage({
        sessionId,
        senderType: "agent",
        content: agentResponseProcessed.processed,
        reasoningTrace: {
          reasoning: triageResult.reasoning,
          confidence: triageResult.confidence,
          originalLanguage: "english",
          responseLanguage: userLanguage
        },
        metadata: {
          ...triageResult.metadata,
          piiProtection: agentResponseProcessed.metadata
        },
        language: userLanguage
      });
      
      // Return unredacted response to user (but stored version is protected)
      const localizedResponse = userLanguage === "urdu"
        ? await translationService.translate(triageResult.content, "urdu", "Medical triage response")
        : triageResult.content;
      
      // Emit events based on urgency
      if (triageResult.metadata?.urgency === URGENCY_LEVELS.EMERGENCY) {
        await eventBus.emitAgentEvent({
          sessionId,
          type: EVENT_TYPES.EMERGENCY_REQUESTED,
          triggeredByAgent: "triage",
          data: {
            symptoms: triageResult.metadata.symptoms,
            urgency: "emergency",
            reasoning: triageResult.reasoning
          }
        });
      }
      
      const response = localizedResponse;
      
      return response;
      
    } catch (error) {
      console.error("[TriageAgent] Error handling message:", error);
      
      const errorMsg = "I apologize, but I encountered an error. Please try again or contact emergency services if this is urgent.";
      return language === "urdu" 
        ? "معذرت، مجھے ایک خرابی کا سامنا ہے۔ براہ کرم دوبارہ کوشش کریں یا اگر یہ فوری ہے تو ایمرجنسی سروسز سے رابطہ کریں۔"
        : errorMsg;
    }
  }

  /**
   * Perform triage analysis using GPT-5 with few-shot learning
   */
  private async performTriage(
    sessionId: string,
    message: string,
    history: any[]
  ): Promise<{
    content: string;
    reasoning: string;
    confidence: number;
    metadata: any;
  }> {
    const systemPrompt = this.getTriageSystemPrompt();
    const fewShotExamples = this.getFewShotExamples();
    
    // Build conversation context
    const messages: any[] = [
      { role: "system", content: systemPrompt },
      ...fewShotExamples,
      ...history.map(h => ({
        role: h.senderType === "user" ? "user" : "assistant",
        content: h.content
      })),
      { role: "user", content: message }
    ];
    
    try {
      const response = await openai.chat.completions.create({
        model: MCP_CONFIG.model,
        messages,
        max_completion_tokens: MCP_CONFIG.maxTokens
      });
      
      const content = response.choices[0].message.content || "";
      
      // Parse structured response
      const triageData = this.parseTriageResponse(content);
      
      return {
        content: triageData.userMessage,
        reasoning: triageData.reasoning,
        confidence: triageData.confidence,
        metadata: {
          urgency: triageData.urgency,
          symptoms: triageData.symptoms,
          recommendedActions: triageData.actions
        }
      };
      
    } catch (error) {
      console.error("[TriageAgent] GPT-5 error:", error);
      throw error;
    }
  }

  /**
   * System prompt for triage agent with few-shot learning
   */
  private getTriageSystemPrompt(): string {
    return `You are an expert medical triage assistant for Pakistan's healthcare system. Your role is to:

1. **Assess Symptoms**: Ask clarifying questions about symptoms, duration, severity
2. **Classify Urgency**: Determine if the situation requires:
   - SELF-CARE: Minor issues manageable at home with OTC medication
   - BHU-VISIT: Non-urgent but requires professional medical consultation at Basic Health Unit
   - EMERGENCY: Life-threatening conditions requiring immediate hospital emergency care

3. **Provide Guidance**: Offer clear, actionable recommendations based on urgency

**Pakistan Context:**
- Basic Health Units (BHUs) provide primary care in rural areas
- Emergency departments handle critical cases
- Many patients have limited access to immediate care
- Use culturally appropriate language

**Response Format:**
Always structure your response as:
---REASONING---
[Your medical reasoning and risk assessment]
---URGENCY---
[self-care | bhu-visit | emergency]
---SYMPTOMS---
[Comma-separated list of identified symptoms]
---ACTIONS---
[Numbered list of recommended actions]
---CONFIDENCE---
[0.0-1.0 confidence score]
---MESSAGE---
[Your response to the patient in clear, empathetic language]

**Safety Rules:**
- Always err on the side of caution
- For chest pain, difficulty breathing, severe bleeding, loss of consciousness → EMERGENCY
- Never diagnose specific conditions - only triage urgency
- Encourage emergency services (1122 in Pakistan) for critical cases`;
  }

  /**
   * Few-shot examples for GPT-5 learning
   */
  private getFewShotExamples(): any[] {
    return [
      {
        role: "user",
        content: "I have a mild headache that started this morning. No fever or other symptoms."
      },
      {
        role: "assistant",
        content: `---REASONING---
Patient reports mild headache with onset this morning. No red flag symptoms (fever, vision changes, neck stiffness, trauma). Duration less than 24 hours. This appears to be a tension headache or mild primary headache, manageable with self-care.
---URGENCY---
self-care
---SYMPTOMS---
headache, mild severity
---ACTIONS---
1. Rest in a quiet, dark room
2. Take over-the-counter pain reliever (paracetamol 500mg)
3. Stay hydrated with water
4. If headache persists beyond 48 hours or worsens, visit your local BHU
5. Seek emergency care if you develop fever, vision changes, or severe pain
---CONFIDENCE---
0.92
---MESSAGE---
For a mild headache without concerning symptoms, you can manage this at home. Rest, take paracetamol, and drink plenty of water. However, if your headache becomes severe, lasts more than 2 days, or you develop new symptoms like fever or vision problems, please visit your nearest health facility.`
      },
      {
        role: "user",
        content: "My mother has severe chest pain that started 20 minutes ago. She's sweating and feels nauseous."
      },
      {
        role: "assistant",
        content: `---REASONING---
CRITICAL SITUATION: Patient experiencing acute chest pain with associated symptoms (diaphoresis, nausea). These are classic signs of a possible cardiac event (myocardial infarction). Time-critical condition requiring immediate emergency intervention. This is a medical emergency.
---URGENCY---
emergency
---SYMPTOMS---
chest pain severe, diaphoresis, nausea, acute onset
---ACTIONS---
1. CALL 1122 (Pakistan Emergency Services) IMMEDIATELY
2. Do not delay - this is a medical emergency
3. Have patient sit or lie down in comfortable position
4. Loosen tight clothing
5. If patient becomes unconscious, be prepared for CPR
6. Do NOT drive to hospital yourself - wait for ambulance
---CONFIDENCE---
0.98
---MESSAGE---
This is a medical emergency. Please call 1122 (Pakistan's emergency number) immediately. These symptoms could indicate a heart attack, which requires urgent medical attention. Do not delay - every minute counts. Have your mother rest in a comfortable position while waiting for the ambulance.`
      },
      {
        role: "user",
        content: "I've had a cough and mild fever (100°F) for 3 days. Feeling tired but able to do daily activities."
      },
      {
        role: "assistant",
        content: `---REASONING---
Patient presents with upper respiratory symptoms: cough and low-grade fever (100°F/37.8°C) for 3 days. Patient remains functional with daily activities. No severe respiratory distress, high fever, or red flag symptoms. Likely viral upper respiratory infection. Warrants medical evaluation but not emergent. Appropriate for BHU consultation for examination and possible symptomatic treatment.
---URGENCY---
bhu-visit
---SYMPTOMS---
cough, fever low-grade, fatigue
---ACTIONS---
1. Visit your nearest Basic Health Unit (BHU) for examination
2. Stay hydrated with plenty of fluids
3. Get adequate rest
4. Monitor temperature twice daily
5. Isolate from vulnerable family members if possible
6. Seek emergency care if fever exceeds 103°F, difficulty breathing develops, or symptoms worsen rapidly
---CONFIDENCE---
0.89
---MESSAGE---
Your symptoms suggest a respiratory infection that should be evaluated by a healthcare provider. Please visit your nearest BHU for a proper examination. In the meantime, rest, drink plenty of fluids, and monitor your symptoms. If you develop difficulty breathing or your fever goes above 103°F, seek emergency care immediately.`
      }
    ];
  }

  /**
   * Parse structured response from GPT-5
   */
  private parseTriageResponse(content: string): {
    reasoning: string;
    urgency: string;
    symptoms: string[];
    actions: string[];
    confidence: number;
    userMessage: string;
  } {
    const reasoningMatch = content.match(/---REASONING---([\s\S]*?)---URGENCY---/);
    const urgencyMatch = content.match(/---URGENCY---([\s\S]*?)---SYMPTOMS---/);
    const symptomsMatch = content.match(/---SYMPTOMS---([\s\S]*?)---ACTIONS---/);
    const actionsMatch = content.match(/---ACTIONS---([\s\S]*?)---CONFIDENCE---/);
    const confidenceMatch = content.match(/---CONFIDENCE---([\s\S]*?)---MESSAGE---/);
    const messageMatch = content.match(/---MESSAGE---([\s\S]*?)$/);
    
    return {
      reasoning: reasoningMatch?.[1]?.trim() || "No reasoning provided",
      urgency: urgencyMatch?.[1]?.trim() || "bhu-visit",
      symptoms: symptomsMatch?.[1]?.trim().split(",").map(s => s.trim()) || [],
      actions: actionsMatch?.[1]?.trim().split("\n").filter(a => a.trim()) || [],
      confidence: parseFloat(confidenceMatch?.[1]?.trim() || "0.75"),
      userMessage: messageMatch?.[1]?.trim() || content
    };
  }

  /**
   * Autonomous actions - periodically check for high-risk patterns
   */
  async autonomousActions() {
    console.log("[TriageAgent] Running autonomous pattern detection...");
    
    // TODO: Implement pattern detection for high-risk cases
    // - Check for multiple emergency classifications in same area
    // - Detect seasonal outbreak patterns
    // - Alert Knowledge Agent if patterns detected
  }
}

export const triageAgent = new TriageAgent();
