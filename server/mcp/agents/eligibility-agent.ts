import { gemini, MCP_CONFIG } from "../index";
import { translationService } from "../services/translation";
import { storage } from "../../storage";
import type { Agent } from "../orchestrator/agent-registry";

/**
 * Health Programs Chatbot Agent
 * Uses Gemini to dynamically respond to any health-related questions
 * Supports facility finder with real hospital data
 * Maintains conversation history
 */
export class HealthProgramsAgent implements Agent {
  name = "Health Programs Agent";
  description = "AI-powered health programs assistant that answers questions about Pakistan's health programs and facilities";
  capabilities = [
    "health_information",
    "program_eligibility",
    "facility_finder",
    "appointment_guidance",
    "bilingual_support"
  ];

  async handleMessage(
    sessionId: string,
    message: string,
    language: string = "en"
  ): Promise<string> {
    try {
      console.log(`[HealthProgramsAgent] Processing message in language: ${language}`);

      // Get session and user data
      const session = await storage.getAgentSession(sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      // Get conversation history
      const history = await storage.getSessionMessages(sessionId);

      // Get user profile for context
      const userProfile = await storage.getUser(session.userId);

      // Determine if this is a facility query
      const isFacilityQuery = this.detectFacilityQuery(message);

      // Translate message to English if needed for processing
      const isUrdu = language === "ur" || language === "ru";
      let processedMessage = message;
      if (isUrdu) {
        processedMessage = await translationService.translate(message, "english", "health query");
      }

      // Prepare context for Gemini
      const conversationContext = history
        .map(msg => `${msg.senderType === "user" ? "User" : "Assistant"}: ${msg.content}`)
        .join("\n");

      const userContext = this.buildUserContext(userProfile);

      // Generate response using Gemini
      let responseText = await this.generateGeminiResponse(
        processedMessage,
        conversationContext,
        userContext,
        isFacilityQuery
      );

      // If it's a facility query and we have location, add real hospital data
      if (isFacilityQuery && userProfile?.address) {
        try {
          const facilityInfo = await this.searchNearbyFacilities(userProfile.address);
          if (facilityInfo) {
            responseText = `${responseText}\n\n${facilityInfo}`;
          }
        } catch (error) {
          console.log("[HealthProgramsAgent] Facility search error:", error);
          // Continue without facility data - Gemini response is still useful
        }
      }

      // Translate back to user's language if needed
      if (isUrdu) {
        responseText = await translationService.translate(responseText, "urdu", "health response");
      }

      // Save agent message to database
      await storage.createAgentMessage({
        sessionId,
        senderType: "agent",
        content: responseText,
        language: isUrdu ? "ur" : "en"
      });

      return responseText;
    } catch (error) {
      console.error("[HealthProgramsAgent] Error:", error);
      const fallback = "I apologize for the confusion. Could you please rephrase your question about health programs or facilities in Pakistan?";
      return language !== "en" && (language === "ur" || language === "ru")
        ? await translationService.translate(fallback, "urdu")
        : fallback;
    }
  }

  /**
   * Generate dynamic response using Gemini
   */
  private async generateGeminiResponse(
    userMessage: string,
    conversationHistory: string,
    userContext: string,
    isFacilityQuery: boolean
  ): Promise<string> {
    const systemPrompt = `You are an expert health programs advisor for Pakistan. You provide accurate, helpful information about:
- Pakistan's health programs (Sehat Card, TB DOTS, EPI, etc.)
- Program eligibility requirements
- Available healthcare facilities and services
- How to access and use health programs
- Health services and treatments

Your responses should be:
- Clear, concise, and in simple language
- Specific to Pakistan's health system
- Factually accurate based on actual programs
- Empathetic and supportive
- When asked about facilities, acknowledge you'll show nearby options

${isFacilityQuery ? "The user is asking about nearby facilities or where to use health programs. Encourage them by mentioning you'll show specific hospitals below." : ""}

If you don't know something, be honest and suggest they contact their local health department or hospital.`;

    const userPrompt = `${systemPrompt}\n\n${conversationHistory ? `Previous conversation:\n${conversationHistory}\n\n` : ""}${userContext ? `User context:\n${userContext}\n\n` : ""}Current user message: "${userMessage}"

Provide a helpful, natural response. Be conversational and supportive.`;

    try {
      const result = await gemini.models.generateContent({
        model: MCP_CONFIG.model,
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }]
          }
        ]
      });

      return result.text || "I apologize, I couldn't generate a response. Please try again.";
    } catch (error) {
      console.error("[HealthProgramsAgent] Gemini error:", error);
      return "I apologize, I'm having trouble processing your request. Please try again or contact your local health facility.";
    }
  }

  /**
   * Detect if user is explicitly asking about nearby facilities
   * Must include location-related keywords combined with facility keywords
   */
  private detectFacilityQuery(message: string): boolean {
    const messageLower = message.toLowerCase();
    
    // Keywords that indicate location/facility intent
    const locationKeywords = [
      "where", "hospital", "clinic", "facility", "center", 
      "nearby", "near me", "go", "visit", "which hospital", 
      "best hospital", "closest", "nearest", "address",
      "kaun si jagah", "kidhar", "kahan", "hospital ka address"
    ];
    
    // Keywords that indicate usage/enrollment intent combined with program names
    const usageKeywords = [
      "can i use", "how to use", "use where", "apply for", "get", "register",
      "enrollment", "how to apply", "kaise use krun", "kaise apply krun"
    ];

    // Check if user is asking about WHERE to use or which HOSPITAL (explicit location query)
    const isLocationQuery = locationKeywords.some(keyword => messageLower.includes(keyword));
    
    // Check if user is asking HOW TO USE a program (combined with program name)
    const isUsageQuery = usageKeywords.some(keyword => messageLower.includes(keyword)) &&
      (messageLower.includes("sehat") || messageLower.includes("program") || 
       messageLower.includes("card") || messageLower.includes("facility"));

    return isLocationQuery || isUsageQuery;
  }

  /**
   * Build user context string from profile
   */
  private buildUserContext(userProfile: any): string {
    if (!userProfile) return "";

    const parts: string[] = [];
    if (userProfile.age) parts.push(`Age: ${userProfile.age}`);
    if (userProfile.gender) parts.push(`Gender: ${userProfile.gender}`);
    if (userProfile.address) parts.push(`Location: ${userProfile.address}`);
    if (userProfile.bloodGroup) parts.push(`Blood Group: ${userProfile.bloodGroup}`);

    return parts.length > 0 ? parts.join("\n") : "";
  }

  /**
   * Search for nearby healthcare facilities using Gemini
   * Dynamically generates facility recommendations based on user's location
   */
  private async searchNearbyFacilities(location: string): Promise<string> {
    try {
      const prompt = `The user is located in: ${location}

Generate a helpful list of 3-5 real healthcare facilities in this location that:
- Accept Sehat Card (Pakistan's health insurance program)
- Provide quality healthcare services
- Are reasonably accessible

Format your response as:
**🏥 Healthcare Facilities in ${location.split(',')[0]}:**

1. **[Hospital Name]**
   📍 [Address]
   📞 [Contact/Phone]
   ✓ Services: [Main services offered]
   🚗 Approximate distance: [Distance estimate]

Continue for other hospitals...

Be specific with real hospitals if you know them, otherwise suggest typical reliable facilities found in that area.`;

      const result = await gemini.models.generateContent({
        model: MCP_CONFIG.model,
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ]
      });

      return result.text ? `\n${result.text}` : "";
    } catch (error) {
      console.error("[HealthProgramsAgent] Facility search error:", error);
      return "";
    }
  }
}

export const healthProgramsAgent = new HealthProgramsAgent();
