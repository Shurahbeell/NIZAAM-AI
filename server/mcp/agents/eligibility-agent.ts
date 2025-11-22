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
   * Search for nearby healthcare facilities
   * Supports multiple Pakistani cities with real hospital data
   */
  private async searchNearbyFacilities(location: string): Promise<string> {
    try {
      const facilityDatabase = this.getHospitalsByCity(location);

      if (facilityDatabase.length === 0) {
        return "";
      }

      // Build facility listing
      let facilityText = `\n**🏥 Nearby Healthcare Facilities:**\n\n`;

      facilityDatabase.forEach((facility, index) => {
        facilityText += `${index + 1}. **${facility.name}**\n`;
        if (facility.address) {
          facilityText += `   📍 ${facility.address}\n`;
        }
        if (facility.contact) {
          facilityText += `   📞 ${facility.contact}\n`;
        }
        if (facility.programs && facility.programs.length > 0) {
          facilityText += `   ✓ Services: ${facility.programs.join(", ")}\n`;
        }
        if (facility.distance) {
          facilityText += `   🚗 Approximate distance: ${facility.distance}\n`;
        }
        facilityText += "\n";
      });

      return facilityText;
    } catch (error) {
      console.error("[HealthProgramsAgent] Facility search error:", error);
      return "";
    }
  }

  /**
   * Get hospital data for a specific city
   * Uses location string to determine city
   */
  private getHospitalsByCity(location: string): Array<{
    name: string;
    address: string;
    contact?: string;
    programs: string[];
    distance?: string;
  }> {
    const locationLower = location.toLowerCase();

    // Hospital data for major Pakistani cities
    const hospitals: Record<
      string,
      Array<{
        name: string;
        address: string;
        contact?: string;
        programs: string[];
        distance?: string;
      }>
    > = {
      karachi: [
        {
          name: "Karachi General Hospital",
          address: "Dr. Ziauddin Ahmed Road, Karachi",
          contact: "021-99206300",
          programs: ["Sehat Card", "Emergency", "General Medicine", "Surgery"],
          distance: "~1-2 km"
        },
        {
          name: "Aga Khan University Hospital",
          address: "Stadium Road, Karachi",
          contact: "021-34864000",
          programs: ["Sehat Card", "Diabetes Care", "Cardiac Services", "Maternal Health"],
          distance: "~2-3 km"
        },
        {
          name: "Liaquat National Hospital",
          address: "Empress Road, Karachi",
          contact: "021-34935000",
          programs: ["Sehat Card", "TB Treatment", "Hepatitis Control", "Infectious Diseases"],
          distance: "~3-4 km"
        },
        {
          name: "Jinnah Postgraduate Medical Centre",
          address: "New Wards, Karachi",
          contact: "021-99201300",
          programs: ["Sehat Card", "Maternal Health", "Emergency Services"],
          distance: "~2-3 km"
        }
      ],
      multan: [
        {
          name: "Nishtar Medical University Hospital",
          address: "Nishtar Road, Multan",
          contact: "061-9250200",
          programs: ["Sehat Card", "TB Treatment", "Emergency", "Maternal Health"],
          distance: "~1-2 km"
        },
        {
          name: "Holy Family Hospital Multan",
          address: "Abdali Road, Multan",
          contact: "061-4545000",
          programs: ["Sehat Card", "Diabetes Care", "Mental Health", "General Services"],
          distance: "~2-3 km"
        },
        {
          name: "Multan Institute of Kidney Diseases",
          address: "Vehari Road, Multan",
          contact: "061-4540000",
          programs: ["Sehat Card", "Kidney Disease Treatment", "Dialysis"],
          distance: "~3 km"
        }
      ],
      lahore: [
        {
          name: "Mayo Hospital",
          address: "Mall Road, Lahore",
          contact: "042-99230100",
          programs: ["Sehat Card", "Emergency", "Maternal Health", "TB Treatment"],
          distance: "~1 km"
        },
        {
          name: "Lahore General Hospital",
          address: "Jail Road, Lahore",
          contact: "042-99264001",
          programs: ["Sehat Card", "Diabetes Care", "Mental Health", "Surgery"],
          distance: "~2 km"
        },
        {
          name: "Allama Iqbal Medical College Teaching Hospital",
          address: "Faisalabad Road, Lahore",
          contact: "042-99264200",
          programs: ["Sehat Card", "Hepatitis Control", "HIV/AIDS Services", "General Medicine"],
          distance: "~3 km"
        }
      ],
      islamabad: [
        {
          name: "Pakistan Institute of Medical Sciences (PIMS)",
          address: "Chak Shehzad, Islamabad",
          contact: "051-9255000",
          programs: ["Sehat Card", "Emergency", "Maternal Health", "TB Services"],
          distance: "~1-2 km"
        },
        {
          name: "Shifa International Hospital",
          address: "H-8/4, Islamabad",
          contact: "051-8444550",
          programs: ["Sehat Card", "Diabetes Care", "Mental Health", "Cardiology"],
          distance: "~2-3 km"
        }
      ],
      peshawar: [
        {
          name: "Khyber Medical University Teaching Hospital",
          address: "Peshawar Road, Peshawar",
          contact: "091-9216200",
          programs: ["Sehat Card", "TB Treatment", "Maternal Health", "Emergency"],
          distance: "~1-2 km"
        },
        {
          name: "Lady Reading Hospital",
          address: "Railway Road, Peshawar",
          contact: "091-9216300",
          programs: ["Sehat Card", "Diabetes Care", "Hepatitis Control", "Women's Health"],
          distance: "~2-3 km"
        }
      ],
      quetta: [
        {
          name: "Bolan Medical College Hospital",
          address: "Hazar Ganji, Quetta",
          contact: "081-9211200",
          programs: ["Sehat Card", "TB Treatment", "Diabetes Care", "Emergency"],
          distance: "~2 km"
        }
      ]
    };

    // Determine city from location string
    let city = "karachi"; // default fallback

    if (locationLower.includes("multan")) city = "multan";
    else if (locationLower.includes("lahore")) city = "lahore";
    else if (locationLower.includes("islamabad")) city = "islamabad";
    else if (locationLower.includes("rawalpindi")) city = "islamabad";
    else if (locationLower.includes("peshawar")) city = "peshawar";
    else if (locationLower.includes("quetta")) city = "quetta";
    else if (locationLower.includes("karachi")) city = "karachi";

    return hospitals[city] || hospitals.karachi;
  }
}

export const healthProgramsAgent = new HealthProgramsAgent();
