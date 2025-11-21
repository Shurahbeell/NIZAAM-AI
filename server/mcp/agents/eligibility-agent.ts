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
    name: "Sehat Sahulat Program",
    description: "Health insurance for families earning less than PKR 50,000/month",
    benefits: ["Free hospitalization up to PKR 1,000,000/year", "Cashless treatment at empaneled hospitals"],
    eligibility: ["Family income below PKR 50,000/month", "Pakistani citizen", "CNIC holder"]
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
        processedMessage = await translationService.translate(message, "en", "Program eligibility");
      }
      
      const history = await storage.getSessionMessages(sessionId);
      
      // Extract context from conversation
      const context = this.extractContext(history);
      
      // Get eligibility assessment
      const assessment = await this.assessEligibility(processedMessage, context, "en");
      
      // Generate response in English first
      const response = await this.generateResponse(assessment, "en");
      
      // Translate response back to user's language
      let responseContent = response.text;
      if (isUrdu) {
        // Translate to Urdu script
        responseContent = await translationService.translate(response.text, "ur", "Program eligibility response");
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
          reasoning: assessment.reasoning
        },
        language: isUrdu ? "ur" : "en"
      });
      
      return responseContent;
      
    } catch (error) {
      console.error("[EligibilityAgent] Error:", error);
      const fallback = "I can help you find health programs you're eligible for. Please tell me about your situation.";
      return language !== "en" 
        ? await translationService.translate(fallback, "ur")
        : fallback;
    }
  }

  private extractContext(history: any[]): EligibilityContext {
    const context: EligibilityContext = {
      programs: PAKISTAN_HEALTH_PROGRAMS.map(p => p.name),
      userProfile: {},
      conversationHistory: history.map(msg => ({
        role: msg.senderType === "user" ? "user" : "assistant",
        content: msg.content
      }))
    };

    // Extract profile information from conversation
    const fullText = history.map(m => m.content).join(" ");
    
    // Age extraction
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
    language: "en" | "ur"
  ): Promise<EligibilityResult> {
    
    const programsInfo = PAKISTAN_HEALTH_PROGRAMS.map(p => 
      `${p.name}: ${p.description}\nBenefits: ${p.benefits.join(", ")}\nEligibility: ${p.eligibility.join(", ")}`
    ).join("\n\n");

    const prompt = `You are an AI assistant helping users determine eligibility for Pakistan's health programs.

Available Programs:
${programsInfo}

User Profile (extracted from conversation):
Age: ${context.userProfile.age || "unknown"}
Gender: ${context.userProfile.gender || "unknown"}
Income: ${context.userProfile.income || "unknown"}
Location: ${context.userProfile.location || "unknown"}

Conversation History:
${context.conversationHistory.map(m => `${m.role}: ${m.content}`).join("\n")}

Latest User Message: ${userMessage}

Task: Analyze eligibility for all programs and provide:
1. List of potentially eligible programs with scores (0.0-1.0)
2. Missing information needed to confirm eligibility
3. Recommended follow-up questions to gather missing info
4. Clear reasoning for assessments

Respond in JSON format:
{
  "eligiblePrograms": [
    {
      "name": "program name",
      "eligibilityScore": 0.0-1.0,
      "missingInfo": ["info needed"],
      "benefits": ["key benefits"],
      "nextSteps": ["what to do next"]
    }
  ],
  "recommendedQuestions": ["question to ask user"],
  "reasoning": "explanation of assessment",
  "confidence": 0.0-1.0
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
    language: "en" | "ur"
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
    if (language === "ur") {
      responseText = await translationService.translate(responseText, "ur");
    }

    return { text: responseText };
  }
}

export const eligibilityAgent = new EligibilityAgent();
