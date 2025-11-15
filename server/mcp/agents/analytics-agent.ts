import { openai, MCP_CONFIG } from "../index";
import { translationService } from "../services/translation";
import { storage } from "../../storage";
import type { Agent } from "../orchestrator/agent-registry";

// Sample WHO/NIH protocol database
const HEALTH_PROTOCOLS = [
  {
    org: "WHO",
    title: "Diabetes Management Guidelines",
    topics: ["diabetes", "blood sugar", "insulin"],
    keyPoints: [
      "Target HbA1c < 7% for most adults",
      "Lifestyle modifications first-line",
      "Metformin as first medication",
      "Regular blood sugar monitoring"
    ]
  },
  {
    org: "WHO",
    title: "TB Treatment Guidelines",
    topics: ["tuberculosis", "TB", "DOTS"],
    keyPoints: [
      "DOTS strategy essential",
      "Minimum 6 months treatment",
      "Never single drug therapy",
      "Regular sputum testing"
    ]
  },
  {
    org: "WHO",
    title: "Maternal Health Guidelines",
    topics: ["pregnancy", "prenatal", "maternal"],
    keyPoints: [
      "Minimum 8 prenatal visits",
      "Iron and folic acid supplements",
      "Skilled birth attendance",
      "Postnatal care within 24 hours"
    ]
  },
  {
    org: "CDC",
    title: "Childhood Vaccination Schedule",
    topics: ["vaccination", "immunization", "children"],
    keyPoints: [
      "BCG at birth for TB",
      "DPT series at 6, 10, 14 weeks",
      "Measles at 9 months",
      "Polio drops at birth, 6, 10, 14 weeks"
    ]
  }
];

export class HealthAnalyticsAgent implements Agent {
  name = "Health Analytics Agent";
  description = "WHO/NIH protocol retrieval and evidence-based guidance";
  capabilities = [
    "protocol_retrieval",
    "evidence_assessment",
    "citation_generation",
    "medical_guidance",
    "bilingual_support"
  ];

  async handleMessage(
    sessionId: string,
    message: string,
    language: string = "english"
  ): Promise<string> {
    try {
      console.log(`[HealthAnalyticsAgent] Processing message in ${language}`);
      
      // Detect and translate Urdu input to English for GPT-5
      const detectedLanguage = await translationService.detectLanguage(message);
      const userLanguage = language === "urdu" || detectedLanguage === "urdu" ? "urdu" : "english";
      
      let processedMessage = message;
      if (userLanguage === "urdu") {
        processedMessage = await translationService.translate(message, "english", "Health analytics query");
      }
      
      // Find relevant protocols
      const queryLower = processedMessage.toLowerCase();
    const relevant = HEALTH_PROTOCOLS.filter(p =>
      p.topics.some(topic => queryLower.includes(topic))
    );

    const protocolsInfo = relevant.length > 0
      ? relevant.map(p => 
          `${p.org} - ${p.title}\n${p.keyPoints.map(k => `- ${k}`).join("\n")}`
        ).join("\n\n")
      : "General medical knowledge";

    const prompt = `Provide evidence-based health guidance.

Question: ${message}

Relevant Protocols:
${protocolsInfo}

Provide answer with evidence in JSON:
{
  "answer": "comprehensive answer",
  "protocols": [
    {"org": "WHO/CDC", "title": "title", "keyPoints": ["point 1"]}
  ],
  "evidenceLevel": "high|moderate|low",
  "recommendations": ["action 1", "action 2"],
  "disclaimer": "when to see doctor"
}`;

      // Query GPT-5 for evidence-based answer
      const result = await openai.chat.completions.create({
        model: MCP_CONFIG.model,
        messages: [
          { role: "system", content: "You are a medical evidence expert. Respond with JSON only." },
          { role: "user", content: prompt }
        ],
        max_completion_tokens: 2000
      });

      const parsed = JSON.parse(result.choices[0].message.content || "{}");
      
      // Null guards for GPT-5 response fields
      const answer = parsed.answer || "I can provide health guidance based on medical protocols.";
      const evidenceLevel = parsed.evidenceLevel || "moderate";
      
      let responseText = `${answer}\n\n`;
      
      const evidenceEmoji = evidenceLevel === "high" ? "🟢" : evidenceLevel === "moderate" ? "🟡" : "🟠";
      responseText += `${evidenceEmoji} **Evidence Level**: ${evidenceLevel.toUpperCase()}\n\n`;

      if (parsed.protocols?.length > 0) {
        responseText += "📚 **Evidence Sources:**\n";
        parsed.protocols.forEach((p: any, i: number) => {
          responseText += `${i + 1}. ${p.org} - ${p.title}\n`;
          if (p.keyPoints) {
            responseText += p.keyPoints.slice(0, 2).map((k: string) => `   - ${k}`).join("\n") + "\n";
          }
        });
        responseText += "\n";
      }

      if (parsed.recommendations?.length > 0) {
        responseText += "💡 **Recommendations:**\n";
        parsed.recommendations.forEach((rec: string, i: number) => {
          responseText += `${i + 1}. ${rec}\n`;
        });
        responseText += "\n";
      }

      responseText += `\n⚠️ ${parsed.disclaimer || "This is not medical advice. Consult a healthcare professional."}`;

      // Translate response to Urdu if needed
      const localizedResponse = userLanguage === "urdu"
        ? await translationService.translate(responseText, "urdu", "Health analytics response")
        : responseText;

      await storage.createAgentMessage({
        sessionId,
        senderType: "agent",
        content: localizedResponse,
        metadata: { protocols: parsed.protocols, evidenceLevel: parsed.evidenceLevel },
        language: userLanguage
      });

      return localizedResponse;

    } catch (error) {
      console.error("[HealthAnalyticsAgent] Error:", error);
      const fallback = "I can provide health information based on WHO/NIH protocols. What would you like to know?";
      return language === "urdu"
        ? await translationService.translate(fallback, "urdu")
        : fallback;
    }
  }
}

export const healthAnalyticsAgent = new HealthAnalyticsAgent();
