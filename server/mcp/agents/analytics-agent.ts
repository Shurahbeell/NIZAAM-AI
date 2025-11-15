import { openai, MCP_CONFIG } from "../index";
import { translationService } from "../services/translation";
import type { Agent } from "../orchestrator/agent-registry";
import type { AgentMessage } from "@shared/schema";
import { openai, MCP_CONFIG } from "../index";
import { translationService } from "../services/translation";
import type { Agent } from "../orchestrator/agent-registry";
import type { AgentMessage } from "@shared/schema";
import { openai, MCP_CONFIG } from "../index";
import { translationService } from "../services/translation";
import type { Agent } from "../orchestrator/agent-registry";
import type { AgentMessage } from "@shared/schema";
import { openai, MCP_CONFIG } from "../index";
import { translationService } from "../services/translation";
import type { Agent } from "../orchestrator/agent-registry";
import type { AgentMessage } from "@shared/schema";
import { openai, MCP_CONFIG } from "../index";
import { translationService } from "../services/translation";
import type { Agent } from "../orchestrator/agent-registry";
import type { AgentMessage } from "@shared/schema";
interface HealthQuery {
  topic: string;
  specificQuestion: string;
  patientContext?: {
    age?: number;
    gender?: string;
    conditions?: string[];
  };
}

interface ProtocolSource {
  organization: string;
  title: string;
  url: string;
  relevanceScore: number;
  keyPoints: string[];
  citation: string;
}

interface AnalyticsResult {
  answer: string;
  protocols: ProtocolSource[];
  evidenceLevel: "high" | "moderate" | "low";
  recommendations: string[];
  reasoning: string;
  confidence: number;
}

// Sample WHO/NIH protocol database - In production, this would be a real database or API
const HEALTH_PROTOCOLS = [
  {
    organization: "WHO",
    title: "Diabetes Management Guidelines",
    url: "https://www.who.int/health-topics/diabetes",
    topics: ["diabetes", "blood sugar", "insulin", "HbA1c"],
    keyPoints: [
      "Target HbA1c < 7% for most adults",
      "Lifestyle modifications as first-line treatment",
      "Metformin as first-line medication",
      "Regular blood sugar monitoring essential"
    ]
  },
  {
    organization: "WHO",
    title: "Tuberculosis Treatment Guidelines",
    url: "https://www.who.int/tb/publications/guidelines",
    topics: ["tuberculosis", "TB", "DOTS", "anti-TB medication"],
    keyPoints: [
      "Directly Observed Treatment Short-course (DOTS) strategy",
      "Minimum 6 months treatment duration",
      "Never use single drug therapy",
      "Regular sputum testing for monitoring"
    ]
  },
  {
    organization: "WHO",
    title: "Maternal Health Guidelines",
    url: "https://www.who.int/health-topics/maternal-health",
    topics: ["pregnancy", "prenatal", "postnatal", "maternal care"],
    keyPoints: [
      "Minimum 8 prenatal visits recommended",
      "Iron and folic acid supplementation",
      "Skilled birth attendance essential",
      "Postnatal care within 24 hours of delivery"
    ]
  },
  {
    organization: "CDC",
    title: "Childhood Vaccination Schedule",
    url: "https://www.cdc.gov/vaccines/schedules/",
    topics: ["vaccination", "immunization", "children", "vaccines"],
    keyPoints: [
      "BCG at birth for TB prevention",
      "DPT series at 6, 10, 14 weeks",
      "Measles vaccine at 9 months",
      "Polio drops at birth, 6, 10, 14 weeks"
    ]
  },
  {
    organization: "NIH",
    title: "Hypertension Management",
    url: "https://www.nhlbi.nih.gov/health-topics/high-blood-pressure",
    topics: ["hypertension", "blood pressure", "cardiovascular"],
    keyPoints: [
      "Target BP < 140/90 mmHg for most adults",
      "Lifestyle changes: DASH diet, exercise, weight loss",
      "ACE inhibitors or ARBs as first-line for many patients",
      "Regular BP monitoring at home"
    ]
  },
  {
    organization: "WHO",
    title: "Mental Health Action Plan",
    url: "https://www.who.int/mental_health",
    topics: ["mental health", "depression", "anxiety", "psychological"],
    keyPoints: [
      "Early intervention improves outcomes",
      "Psychosocial support as first-line",
      "Medication when needed for moderate-severe cases",
      "Community-based care preferred over institutionalization"
    ]
  }
];

export const ANALYTICS_AGENT_CAPABILITIES: AgentCapability[] = [
  "protocol_retrieval",
  "evidence_assessment",
  "citation_generation",
  "medical_guidance",
  "bilingual_support"
];

export class HealthAnalyticsAgent {
  private translationService: TranslationService;

  constructor() {
    this.translationService = new TranslationService();
  }

  async processMessage(
    message: string,
    language: "english" | "urdu",
    conversationHistory: AgentMessage[]
  ): Promise<{ response: string; metadata: any }> {
    
    // Parse health query
    const query = this.parseQuery(message, conversationHistory);
    
    // Retrieve relevant protocols and generate answer
    const result = await this.retrieveProtocols(query, language);
    
    // Generate response
    const response = await this.generateResponse(result, language);
    
    return {
      response: response.text,
      metadata: {
        protocols: result.protocols,
        evidenceLevel: result.evidenceLevel,
        recommendations: result.recommendations,
        confidence: result.confidence,
        reasoning: result.reasoning
      }
    };
  }

  private parseQuery(message: string, history: AgentMessage[]): HealthQuery {
    const fullText = message + " " + history.map(m => m.content).join(" ");
    
    // Extract age
    let age: number | undefined;
    const ageMatch = fullText.match(/(\d+)\s*(years?|سال)/i);
    if (ageMatch) age = parseInt(ageMatch[1]);
    
    // Extract gender
    let gender: string | undefined;
    if (/\b(female|woman|lady|عورت|خاتون)\b/i.test(fullText)) {
      gender = "female";
    } else if (/\b(male|man|مرد)\b/i.test(fullText)) {
      gender = "male";
    }
    
    // Extract conditions
    const conditions: string[] = [];
    const conditionKeywords = ["diabetes", "hypertension", "TB", "tuberculosis", "pregnancy", "asthma"];
    conditionKeywords.forEach(condition => {
      if (fullText.toLowerCase().includes(condition.toLowerCase())) {
        conditions.push(condition);
      }
    });

    return {
      topic: message,
      specificQuestion: message,
      patientContext: age || gender || conditions.length > 0 ? {
        age,
        gender,
        conditions: conditions.length > 0 ? conditions : undefined
      } : undefined
    };
  }

  private async retrieveProtocols(
    query: HealthQuery,
    language: "english" | "urdu"
  ): Promise<AnalyticsResult> {
    
    // Find relevant protocols
    const relevantProtocols = HEALTH_PROTOCOLS.filter(protocol => {
      const queryLower = query.specificQuestion.toLowerCase();
      return protocol.topics.some(topic => queryLower.includes(topic.toLowerCase()));
    });

    const protocolsInfo = relevantProtocols.length > 0
      ? relevantProtocols.map(p => 
          `${p.organization} - ${p.title}\nKey Points:\n${p.keyPoints.map(k => `- ${k}`).join("\n")}`
        ).join("\n\n")
      : "No specific protocols found. Using general medical knowledge.";

    const patientContextStr = query.patientContext 
      ? `Patient: ${query.patientContext.age ? `${query.patientContext.age} years old` : ""} ${query.patientContext.gender || ""} ${query.patientContext.conditions?.join(", ") || ""}`
      : "General query";

    const prompt = `You are a health analytics AI providing evidence-based medical guidance.

Patient Question: ${query.specificQuestion}
${patientContextStr}

Relevant WHO/NIH Protocols:
${protocolsInfo}

Task: Provide a comprehensive, evidence-based answer that:
1. Directly answers the question using protocol guidelines
2. Cites specific protocols and evidence
3. Provides actionable recommendations
4. Acknowledges limitations and when to seek professional care

Respond in JSON format:
{
  "answer": "comprehensive answer to the question",
  "protocols": [
    {
      "organization": "WHO/NIH/CDC",
      "title": "protocol title",
      "relevanceScore": 0.0-1.0,
      "keyPoints": ["relevant key points"],
      "citation": "formal citation"
    }
  ],
  "evidenceLevel": "high|moderate|low",
  "recommendations": ["actionable recommendations"],
  "reasoning": "how protocols were applied to this case",
  "confidence": 0.0-1.0
}`;

    try {
      const result = await generateText({
        model: openai("gpt-4o"),
        messages: [
          {
            role: "system",
            content: "You are a medical evidence synthesis expert. Provide accurate, protocol-based guidance. Respond only with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        maxTokens: 2500
      });

      const parsed = JSON.parse(result.text);
      
      // Enhance protocols with URLs
      parsed.protocols = parsed.protocols.map((p: any) => {
        const matchingProtocol = relevantProtocols.find(
          rp => rp.organization === p.organization && rp.title === p.title
        );
        return {
          ...p,
          url: matchingProtocol?.url || "https://www.who.int"
        };
      });

      return parsed as AnalyticsResult;

    } catch (error) {
      console.error("[AnalyticsAgent] Retrieval error:", error);
      
      // Fallback response
      return {
        answer: "I can provide general health information, but please consult a healthcare professional for personalized medical advice.",
        protocols: relevantProtocols.slice(0, 2).map(p => ({
          organization: p.organization,
          title: p.title,
          url: p.url,
          relevanceScore: 0.7,
          keyPoints: p.keyPoints.slice(0, 3),
          citation: `${p.organization}. ${p.title}.`
        })),
        evidenceLevel: "moderate",
        recommendations: [
          "Consult a healthcare professional",
          "Follow evidence-based guidelines",
          "Regular monitoring and follow-up"
        ],
        reasoning: "Providing general guidance based on available protocols.",
        confidence: 0.6
      };
    }
  }

  private async generateResponse(
    result: AnalyticsResult,
    language: "english" | "urdu"
  ): Promise<{ text: string }> {
    
    let responseText = `${result.answer}\n\n`;

    // Evidence level
    const evidenceEmoji = result.evidenceLevel === "high" ? "🟢" : result.evidenceLevel === "moderate" ? "🟡" : "🟠";
    responseText += `${evidenceEmoji} **Evidence Level**: ${result.evidenceLevel.toUpperCase()}\n\n`;

    // Protocols section
    if (result.protocols.length > 0) {
      responseText += "📚 **Evidence Sources:**\n";
      result.protocols.forEach((protocol, i) => {
        responseText += `${i + 1}. ${protocol.organization} - ${protocol.title}\n`;
        if (protocol.keyPoints.length > 0) {
          responseText += `   Key Points:\n${protocol.keyPoints.slice(0, 3).map(k => `   - ${k}`).join("\n")}\n`;
        }
        responseText += `   Reference: ${protocol.url}\n\n`;
      });
    }

    // Recommendations section
    if (result.recommendations.length > 0) {
      responseText += "💡 **Recommendations:**\n";
      result.recommendations.forEach((rec, i) => {
        responseText += `${i + 1}. ${rec}\n`;
      });
      responseText += "\n";
    }

    responseText += `\n⚠️ **Disclaimer**: This information is based on WHO/NIH protocols and should not replace professional medical consultation.`;

    // Translate to Urdu if needed
    if (language === "urdu") {
      responseText = await this.translationService.translate(responseText, "urdu");
    }

    return { text: responseText };
  }

  getCapabilities(): AgentCapability[] {
    return ANALYTICS_AGENT_CAPABILITIES;
  }
}
