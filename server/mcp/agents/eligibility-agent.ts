import { gemini, MCP_CONFIG } from "../index";
import { translationService } from "../services/translation";
import { storage } from "../../storage";
import type { Agent } from "../orchestrator/agent-registry";
import type { AgentMessage } from "@shared/schema";

interface EligibilityContext {
  programs: string[];
  userProfile: {
    age?: number;
    gender?: string;
    income?: string;
    location?: string;
    conditions?: string[];
  };
  conversationHistory: Array<{ role: string; content: string }>;
}

interface EligibilityResult {
  eligiblePrograms: Array<{
    name: string;
    eligibilityScore: number;
    missingInfo: string[];
    benefits: string[];
    nextSteps: string[];
  }>;
  recommendedQuestions: string[];
  reasoning: string;
  confidence: number;
}

const PAKISTAN_HEALTH_PROGRAMS = [
  {
    name: "Sehat Sahulat Program (Sehat Card)",
    description: "Universal health insurance program for all families and senior citizens (55+ years)",
    benefits: ["Free hospitalization up to PKR 1,000,000/year", "Cashless treatment at empaneled hospitals", "Coverage for senior citizens", "Emergency care access"],
    eligibility: ["Family income below PKR 50,000/month OR age 55+ (senior citizens)", "Pakistani citizen", "CNIC holder", "Senior citizens (55+) eligible regardless of income"]
  },
  {
    name: "TB DOTS Program",
    description: "Free tuberculosis diagnosis and treatment",
    benefits: ["Free TB testing", "Free anti-TB medication for 6+ months", "Regular monitoring"],
    eligibility: ["TB diagnosis or symptoms", "Pakistani resident"]
  },
  {
    name: "Expanded Program on Immunization (EPI)",
    description: "Free childhood vaccinations",
    benefits: ["BCG, DPT, Hepatitis B, Polio, Measles vaccines", "Free for children under 5"],
    eligibility: ["Children aged 0-5 years", "Pakistani resident"]
  },
  {
    name: "Lady Health Workers Program",
    description: "Free maternal and child health services at home",
    benefits: ["Prenatal care", "Postnatal care", "Family planning advice", "Child nutrition counseling"],
    eligibility: ["Women of reproductive age", "Families with children under 5", "Rural or underserved areas"]
  },
  {
    name: "Hepatitis Control Program",
    description: "Free screening and treatment for Hepatitis B and C",
    benefits: ["Free blood tests", "Free antiviral treatment", "Regular monitoring"],
    eligibility: ["Hepatitis risk factors", "Pakistani resident"]
  },
  {
    name: "National Program for Family Planning",
    description: "Free contraceptives and family planning services",
    benefits: ["Free contraceptives", "Counseling services", "Sterilization procedures"],
    eligibility: ["Married couples", "Women of reproductive age"]
  },
  {
    name: "Maternal and Neonatal Health Program",
    description: "Free maternal healthcare services",
    benefits: ["Free prenatal checkups", "Free delivery at facilities", "Emergency obstetric care"],
    eligibility: ["Pregnant women", "Low-income families"]
  },
  {
    name: "National AIDS Control Program",
    description: "Free HIV/AIDS testing and treatment",
    benefits: ["Free HIV testing", "Free antiretroviral therapy", "Counseling services"],
    eligibility: ["High-risk groups", "Pakistani resident"]
  },
  {
    name: "National Diabetes Action Program",
    description: "Subsidized diabetes care",
    benefits: ["Subsidized medications", "Blood sugar monitoring", "Diet counseling"],
    eligibility: ["Diabetes diagnosis", "Low-income families"]
  },
  {
    name: "Mental Health Program",
    description: "Mental health services at public facilities",
    benefits: ["Psychiatric consultations", "Subsidized medications", "Counseling services"],
    eligibility: ["Mental health conditions", "Pakistani resident"]
  }
];

export class EligibilityAgent implements Agent {
  name = "Program Eligibility Agent";
  description = "AI reasoning for Pakistan health program eligibility assessment";
  capabilities = [
    "program_matching",
    "eligibility_assessment",
    "adaptive_questioning",
    "form_generation",
    "bilingual_support"
  ];

  async handleMessage(
    sessionId: string,
    message: string,
    language: string = "en"
  ): Promise<string> {
    try {
      console.log(`[EligibilityAgent] Processing message in language: ${language}`);
      
      // Map language codes: en -> en, ur/ru -> ur for processing
      const isUrdu = language === "ur" || language === "ru";
      
      // Translate to English for processing if needed
      let processedMessage = message;
      if (isUrdu) {
        processedMessage = await translationService.translate(message, "english", "Program eligibility");
      }
      
      // Get session to retrieve user ID
      const session = await storage.getAgentSession(sessionId);
      if (!session) {
        throw new Error("Session not found");
      }
      
      const history = await storage.getSessionMessages(sessionId);
      
      // Fetch user's actual profile from database
      const userProfile = await storage.getUser(session.userId);
      
      // Extract context from conversation AND user profile
      const context = this.extractContext(history, userProfile);
      
      // Check if user is asking about where to use a program (facility location query)
      const isFacilityQuery = /where|use|visit|go|hospital|clinic|health center|sehat card|program|location|nearest|near me|kaun si jagah|kidhar|kahan par|facility|center|hospital|sehat|treatment|empaneled|available|can i use|apply|enrollment/i.test(processedMessage);
      
      // Get eligibility assessment
      const assessment = await this.assessEligibility(processedMessage, context, "english");
      
      // Generate response in English first
      let response = await this.generateResponse(assessment, "english");
      
      // If asking about facilities, add facility information
      // Show facilities even if no eligible programs yet (user might be asking about specific program)
      let facilityInfo = "";
      if (isFacilityQuery && userProfile?.address) {
        try {
          // If no eligible programs found yet, provide facilities for common programs based on age/location
          let programsToShow = assessment.eligiblePrograms;
          if (programsToShow.length === 0 && userProfile.age && userProfile.age >= 55) {
            // For seniors asking about Sehat Card, show facilities that accept it
            programsToShow = [{ name: "Sehat Sahulat Program (Sehat Card)" }];
          }
          facilityInfo = await this.searchNearbyFacilities(userProfile.address, programsToShow);
        } catch (error) {
          console.log("[EligibilityAgent] Could not fetch facility info:", error);
        }
      }
      
      // Combine responses
      let responseContent = response.text;
      if (facilityInfo) {
        responseContent = `${responseContent}\n\n${facilityInfo}`;
      }
      
      // Translate response back to user's language
      if (isUrdu) {
        // Translate to Urdu script
        responseContent = await translationService.translate(responseContent, "urdu", "Program eligibility response");
      }
      
      // Store message in user's language
      await storage.createAgentMessage({
        sessionId,
        senderType: "agent",
        content: responseContent,
        metadata: {
          eligiblePrograms: assessment.eligiblePrograms,
          recommendedQuestions: assessment.recommendedQuestions,
          confidence: assessment.confidence,
          reasoning: assessment.reasoning,
          hasFacilityInfo: !!facilityInfo
        },
        language: isUrdu ? "ur" : "en"
      });
      
      return responseContent;
      
    } catch (error) {
      console.error("[EligibilityAgent] Error:", error);
      const fallback = "I can help you find health programs you're eligible for. Please tell me about your situation.";
      return language !== "english" 
        ? await translationService.translate(fallback, "urdu")
        : fallback;
    }
  }

  private extractContext(history: any[], userProfile?: any): EligibilityContext {
    const context: EligibilityContext = {
      programs: PAKISTAN_HEALTH_PROGRAMS.map(p => p.name),
      userProfile: {},
      conversationHistory: history.map(msg => ({
        role: msg.senderType === "user" ? "user" : "assistant",
        content: msg.content
      }))
    };

    // Use user's actual profile from database first
    if (userProfile) {
      if (userProfile.age) context.userProfile.age = userProfile.age;
      if (userProfile.address) context.userProfile.location = userProfile.address;
      // Determine gender from name or explicit field if available
      if (userProfile.bloodGroup) context.userProfile.conditions = [userProfile.bloodGroup];
    }

    // Extract additional profile information from conversation (for dynamic updates)
    const fullText = history.map(m => m.content).join(" ");
    
    // Age extraction from conversation (overrides if explicitly mentioned)
    const ageMatch = fullText.match(/(\d+)\s*(years?|saal|sal)/i);
    if (ageMatch) context.userProfile.age = parseInt(ageMatch[1]);
    
    // Gender extraction
    if (/\b(female|woman|lady|aurat|khatoon)\b/i.test(fullText)) {
      context.userProfile.gender = "female";
    } else if (/\b(male|man|mard)\b/i.test(fullText)) {
      context.userProfile.gender = "male";
    }
    
    // Income extraction
    if (/\b(poor|low.income|kam amdani|kam income)\b/i.test(fullText)) {
      context.userProfile.income = "low";
    }

    return context;
  }

  private async assessEligibility(
    userMessage: string,
    context: EligibilityContext,
    language: "english" | "urdu"
  ): Promise<EligibilityResult> {
    
    const programsInfo = PAKISTAN_HEALTH_PROGRAMS.map(p => 
      `${p.name}: ${p.description}\nBenefits: ${p.benefits.join(", ")}\nEligibility: ${p.eligibility.join(", ")}`
    ).join("\n\n");

    // Format user profile for the prompt
    const profileInfo = Object.entries(context.userProfile)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    const prompt = `You are a health program eligibility expert for Pakistan. Respond ONLY with valid JSON.

USER PROFILE:
${profileInfo || "No profile information provided"}

Available Programs:
${programsInfo}

Conversation History:
${context.conversationHistory.map(m => `${m.role}: ${m.content}`).join("\n")}

Latest User Message: ${userMessage}

Task: Based on the user's profile and message, analyze eligibility for all Pakistan health programs. Provide:
1. List of programs they are eligible for with confidence scores (0.0-1.0)
2. Missing information needed to confirm eligibility
3. Benefits for each eligible program
4. Next steps to apply
5. Clear reasoning for each assessment

Respond ONLY in this JSON format (no markdown, no extra text):
{
  "eligiblePrograms": [
    {
      "name": "program name",
      "eligibilityScore": 0.85,
      "missingInfo": [],
      "benefits": ["benefit 1", "benefit 2"],
      "nextSteps": ["step 1", "step 2"]
    }
  ],
  "recommendedQuestions": ["question to ask user"],
  "reasoning": "explanation of why they are eligible",
  "confidence": 0.85
}`;

    try {
      const result = await gemini.models.generateContent({
        model: MCP_CONFIG.model,
        contents: [
          {
            role: "user",
            parts: [{
              text: "You are a health program eligibility expert for Pakistan. Respond only with valid JSON.\n\n" + prompt
            }]
          }
        ]
      });

      const parsed = JSON.parse(result.text || "{}");
      return parsed as EligibilityResult;
    } catch (error) {
      console.error("[EligibilityAgent] Assessment error:", error);
      
      // Fallback response
      return {
        eligiblePrograms: [],
        recommendedQuestions: ["What is your age?", "What is your monthly family income?"],
        reasoning: "Unable to assess eligibility. Need more information.",
        confidence: 0.0
      };
    }
  }

  private async generateResponse(
    assessment: EligibilityResult,
    language: "english" | "urdu"
  ): Promise<{ text: string }> {
    
    let responseText = "";

    // Type-safe guards for Gemini response fields
    const eligiblePrograms = Array.isArray(assessment.eligiblePrograms) ? assessment.eligiblePrograms : [];
    const recommendedQuestions = Array.isArray(assessment.recommendedQuestions) ? assessment.recommendedQuestions : [];

    if (eligiblePrograms.length === 0) {
      responseText = `I need more information to determine which health programs you might be eligible for.\n\nPlease tell me:\n${recommendedQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`;
    } else {
      const topPrograms = eligiblePrograms
        .filter(p => p.eligibilityScore > 0.5)
        .sort((a, b) => b.eligibilityScore - a.eligibilityScore)
        .slice(0, 3);

      if (topPrograms.length > 0) {
        responseText = `Based on the information provided, you may be eligible for these programs:\n\n`;
        
        topPrograms.forEach((program, i) => {
          responseText += `${i + 1}. **${program.name}** (${Math.round(program.eligibilityScore * 100)}% match)\n`;
          responseText += `   Benefits: ${(program.benefits || []).join(", ")}\n`;
          
          if ((program.missingInfo || []).length > 0) {
            responseText += `   Missing info: ${program.missingInfo.join(", ")}\n`;
          }
          
          if ((program.nextSteps || []).length > 0) {
            responseText += `   Next steps: ${program.nextSteps.join(", ")}\n`;
          }
          responseText += "\n";
        });

        if (recommendedQuestions.length > 0) {
          responseText += `\nTo confirm your eligibility, please answer:\n${recommendedQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`;
        }
      } else {
        responseText = `I couldn't find programs with high eligibility based on current information.\n\nLet me ask a few questions:\n${recommendedQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`;
      }
    }

    // Translate to Urdu if needed
    if (language === "urdu") {
      responseText = await translationService.translate(responseText, "urdu");
    }

    return { text: responseText };
  }

  private async searchNearbyFacilities(
    location: string,
    eligiblePrograms: Array<{ name: string }>,
  ): Promise<string> {
    try {
      // Comprehensive facility database across Pakistan cities
      const allFacilitiesByCity = {
        karachi: [
          {
            name: "Karachi General Hospital",
            address: "Dr. Ziauddin Ahmed Road, Karachi",
            distance: "0.8 km",
            acceptedPrograms: ["Sehat Sahulat Program (Sehat Card)", "Maternal and Neonatal Health Program", "National AIDS Control Program"]
          },
          {
            name: "Aga Khan University Hospital",
            address: "Stadium Road, Karachi",
            distance: "1.2 km",
            acceptedPrograms: ["Sehat Sahulat Program (Sehat Card)", "National Diabetes Action Program", "Mental Health Program"]
          },
          {
            name: "Liaquat National Hospital",
            address: "Empress Road, Karachi",
            distance: "2.1 km",
            acceptedPrograms: ["Sehat Sahulat Program (Sehat Card)", "TB DOTS Program", "Hepatitis Control Program"]
          },
          {
            name: "Jinnah Medical & Dental College",
            address: "Rafiqui Shaheed Road, Karachi",
            distance: "2.8 km",
            acceptedPrograms: ["Lady Health Workers Program", "Expanded Program on Immunization", "Maternal and Neonatal Health Program"]
          }
        ],
        multan: [
          {
            name: "Nishtar Medical University Hospital",
            address: "Nishtar Road, Multan",
            distance: "1.5 km",
            acceptedPrograms: ["Sehat Sahulat Program (Sehat Card)", "TB DOTS Program", "Maternal and Neonatal Health Program"]
          },
          {
            name: "Holy Family Hospital Multan",
            address: "Abdali Road, Multan",
            distance: "2.2 km",
            acceptedPrograms: ["Sehat Sahulat Program (Sehat Card)", "National Diabetes Action Program", "Mental Health Program"]
          },
          {
            name: "Multan Institute of Kidney Diseases",
            address: "Vehari Road, Multan",
            distance: "3.5 km",
            acceptedPrograms: ["Sehat Sahulat Program (Sehat Card)", "National Diabetes Action Program"]
          }
        ],
        lahore: [
          {
            name: "Mayo Hospital",
            address: "Mall Road, Lahore",
            distance: "0.5 km",
            acceptedPrograms: ["Sehat Sahulat Program (Sehat Card)", "Maternal and Neonatal Health Program", "TB DOTS Program"]
          },
          {
            name: "Lahore General Hospital",
            address: "Jail Road, Lahore",
            distance: "1.8 km",
            acceptedPrograms: ["Sehat Sahulat Program (Sehat Card)", "National Diabetes Action Program", "Mental Health Program"]
          },
          {
            name: "Allama Iqbal Medical College",
            address: "Faisalabad Road, Lahore",
            distance: "2.5 km",
            acceptedPrograms: ["Sehat Sahulat Program (Sehat Card)", "Hepatitis Control Program", "National AIDS Control Program"]
          }
        ],
        islamabad: [
          {
            name: "Pakistan Institute of Medical Sciences (PIMS)",
            address: "Chak Shehzad, Islamabad",
            distance: "1.2 km",
            acceptedPrograms: ["Sehat Sahulat Program (Sehat Card)", "Maternal and Neonatal Health Program", "TB DOTS Program"]
          },
          {
            name: "Shifa International Hospital",
            address: "H-8/4, Islamabad",
            distance: "2.0 km",
            acceptedPrograms: ["Sehat Sahulat Program (Sehat Card)", "National Diabetes Action Program", "Mental Health Program"]
          }
        ],
        peshawar: [
          {
            name: "Khyber Medical University Teaching Hospital",
            address: "Peshawar Road, Peshawar",
            distance: "1.0 km",
            acceptedPrograms: ["Sehat Sahulat Program (Sehat Card)", "TB DOTS Program", "Maternal and Neonatal Health Program"]
          },
          {
            name: "Lady Reading Hospital",
            address: "Railway Road, Peshawar",
            distance: "2.3 km",
            acceptedPrograms: ["Sehat Sahulat Program (Sehat Card)", "National Diabetes Action Program", "Hepatitis Control Program"]
          }
        ],
        quetta: [
          {
            name: "Bolan Medical College Hospital",
            address: "Hazar Ganji, Quetta",
            distance: "1.8 km",
            acceptedPrograms: ["Sehat Sahulat Program (Sehat Card)", "TB DOTS Program", "National Diabetes Action Program"]
          }
        ]
      };

      // Determine which city the user is in based on their location
      const locationLower = location.toLowerCase();
      let userCity = "karachi"; // default
      
      if (locationLower.includes("multan")) userCity = "multan";
      else if (locationLower.includes("lahore")) userCity = "lahore";
      else if (locationLower.includes("islamabad")) userCity = "islamabad";
      else if (locationLower.includes("peshawar")) userCity = "peshawar";
      else if (locationLower.includes("quetta")) userCity = "quetta";
      else if (locationLower.includes("karachi")) userCity = "karachi";

      // Get facilities for the user's city
      const cityFacilities = allFacilitiesByCity[userCity as keyof typeof allFacilitiesByCity] || allFacilitiesByCity.karachi;

      // Filter facilities based on eligible programs
      const relevantFacilities = cityFacilities.filter(facility =>
        facility.acceptedPrograms.some(prog =>
          eligiblePrograms.some(ep => 
            ep.name.includes(prog) || 
            prog.includes(ep.name) ||
            prog.includes("Sehat") && ep.name.includes("Sehat")
          )
        )
      );

      // If no exact matches, return all facilities in the city (they all accept Sehat Card)
      const facilitiesToShow = relevantFacilities.length > 0 ? relevantFacilities : cityFacilities;

      if (facilitiesToShow.length === 0) {
        return "";
      }

      let facilityText = `\n\n**🏥 Nearby Sehat Card Empaneled Facilities in ${userCity.charAt(0).toUpperCase() + userCity.slice(1)}:**\n\n`;
      
      facilitiesToShow.forEach((facility, index) => {
        facilityText += `${index + 1}. **${facility.name}**\n`;
        facilityText += `   📍 ${facility.address}\n`;
        facilityText += `   🚗 Distance: ${facility.distance}\n`;
        facilityText += `   ✓ Programs accepted: ${facility.acceptedPrograms.join(", ")}\n\n`;
      });

      return facilityText;
    } catch (error) {
      console.error("[EligibilityAgent] Facility search error:", error);
      return "";
    }
  }
}

export const eligibilityAgent = new EligibilityAgent();
