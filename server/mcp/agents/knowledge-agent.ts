import { gemini, MCP_CONFIG } from "../index";
import { translationService } from "../services/translation";
import { piiProtection } from "../services/pii-protection";
import { storage } from "../../storage";
import type { Agent } from "../orchestrator/agent-registry";
import { healthPrograms } from "@shared/health-programs";

interface HealthPattern {
  symptomCluster: string[];
  frequency: number;
  locations: string[];
  ageGroups: string[];
  timeRange: {
    start: Date;
    end: Date;
  };
  severity: "low" | "medium" | "high";
}

interface OutbreakAlert {
  id: string;
  patternType: string;
  description: string;
  affectedAreas: string[];
  riskLevel: "low" | "moderate" | "high" | "critical";
  recommendations: string[];
  evidencePoints: string[];
  confidence: number;
  shouldEscalate: boolean;
  escalationTarget?: string;
}

interface KnowledgeAnalysis {
  patterns: HealthPattern[];
  alerts: OutbreakAlert[];
  trends: string[];
  publicHealthInsights: string[];
  reasoning: string;
  confidence: number;
}

export class KnowledgeAgent implements Agent {
  name = "Knowledge Agent";
  description = "Health programs advisor and outbreak monitoring";
  capabilities = [
    "program_information",
    "pattern_detection",
    "outbreak_monitoring",
    "data_aggregation",
    "alert_escalation",
    "anonymization"
  ];

  async handleMessage(
    sessionId: string,
    message: string,
    language: string = "en"
  ): Promise<string> {
    try {
      console.log(`[KnowledgeAgent] Processing message in language: ${language}`);
      
      // Map language codes: en -> en, ur/ru -> ur for processing
      const isUrdu = language === "ur" || language === "ru";
      
      // Translate to English for processing if needed
      let processedMessage = message;
      if (isUrdu) {
        processedMessage = await translationService.translate(message, "en", "Health programs");
      }
      
      // Check if this is a health program query vs outbreak monitoring
      const isProgramQuery = this.isProgramQuery(processedMessage);
      
      let responseContent: string;
      
      if (isProgramQuery) {
        // Handle health program question directly with Gemini
        responseContent = await this.answerProgramQuestion(processedMessage, isUrdu ? "ur" : "en");
      } else {
        // Original outbreak monitoring flow
        // Anonymize all data before processing
        const anonymizedResult = piiProtection.minimizePII(processedMessage);
        const anonymizedMessage = anonymizedResult.minimized;
        
        // Analyze patterns and detect potential outbreaks
        const analysis = await this.analyzeHealthPatterns(anonymizedMessage, "en");
        
        // Generate response in English first
        const response = await this.generateResponse(analysis, "en");
        
        // Translate response back to user's language
        responseContent = response.text;
        if (isUrdu) {
          // Translate to Urdu script
          responseContent = await translationService.translate(response.text, "ur", "Health programs response");
        }
        
        // Process escalations if needed
        if (analysis.alerts.some(a => a.shouldEscalate)) {
          await this.escalateAlerts(analysis.alerts.filter(a => a.shouldEscalate));
        }
      }
      
      await storage.createAgentMessage({
        sessionId,
        senderType: "agent",
        content: responseContent,
        metadata: {},
        language: isUrdu ? "ur" : "en"
      });
      
      return responseContent;
      
    } catch (error) {
      console.error("[KnowledgeAgent] Error:", error);
      const fallback = "I can help you find information about health programs. Please tell me what you'd like to know.";
      return language !== "en"
        ? await translationService.translate(fallback, "ur")
        : fallback;
    }
  }

  private isProgramQuery(message: string): boolean {
    const programKeywords = [
      "program", "sehat", "sahulat", "vaccination", "immunization", "epi",
      "tb", "tuberculosis", "hepatitis", "maternal", "neonatal", "family planning",
      "diabetes", "mental health", "aids", "hiv", "eligib", "eligible", 
      "apply", "registration", "enrollment", "benefit", "coverage", "insurance",
      "free", "treatment", "healthcare", "services", "facilities", "how to",
      "tell me about", "information", "details", "requirements", "documents"
    ];
    const lowerMessage = message.toLowerCase();
    return programKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  private async answerProgramQuestion(message: string, language: "en" | "ur"): Promise<string> {
    const programsInfo = healthPrograms.map(p => 
      `**${p.name}**\nDescription: ${p.description}\nPurpose: ${p.purpose}\nEligibility: ${p.eligibility}\nBenefits: ${p.benefits}\nRequired Documents: ${p.required_documents.join(", ")}\nCost: ${p.cost}\nHow to Apply: ${p.how_to_apply}\nNotes: ${p.notes}`
    ).join("\n\n---\n\n");

    const prompt = `You are a Pakistan health programs expert. Answer the user's question about health programs.

Available Programs Database:
${programsInfo}

User Question: ${message}

Provide a clear, helpful, and accurate answer based on the programs information above. If the user is asking about eligibility, list the programs they might qualify for. If asking about how to apply, explain the process. Be specific and reference program names when relevant.`;

    try {
      const result = await gemini.models.generateContent({
        model: MCP_CONFIG.model,
        contents: [
          {
            role: "user",
            parts: [{
              text: prompt
            }]
          }
        ]
      });

      let answer = result.text || "I couldn't find information about that program.";
      
      // Translate to Urdu if needed
      if (language === "ur") {
        answer = await translationService.translate(answer, "ur", "Health program answer");
      }
      
      return answer;
    } catch (error) {
      console.error("[KnowledgeAgent] Program query error:", error);
      const fallback = "I can help with information about Pakistan health programs. Please ask about specific programs.";
      return language === "ur"
        ? await translationService.translate(fallback, "ur")
        : fallback;
    }
  }

  private async analyzeHealthPatterns(
    message: string,
    language: string
  ): Promise<KnowledgeAnalysis> {
    
    // In production, this would query aggregated anonymized data from database
    // For now, we'll simulate pattern detection with sample data
    
    const aggregatedData = this.simulateAggregatedData();
    
    const prompt = `You are a public health surveillance AI analyzing anonymized health data for pattern detection and outbreak monitoring.

Latest Query: ${message}

Aggregated Anonymized Data (last 30 days):
${aggregatedData}

Task: Analyze for:
1. Disease clusters or unusual symptom patterns
2. Geographic concentrations of similar cases
3. Temporal trends (increasing/decreasing)
4. Potential outbreak indicators
5. Public health action recommendations

Detection Criteria:
- Outbreak Alert: ≥5 similar cases in same area within 7 days
- Pattern: ≥3 similar cases with common characteristics
- Trend: 50%+ increase week-over-week

Respond in JSON format:
{
  "patterns": [
    {
      "symptomCluster": ["symptoms"],
      "frequency": number,
      "locations": ["areas"],
      "ageGroups": ["age ranges"],
      "timeRange": {
        "start": "ISO date",
        "end": "ISO date"
      },
      "severity": "low|medium|high"
    }
  ],
  "alerts": [
    {
      "id": "unique-id",
      "patternType": "outbreak type",
      "description": "what's happening",
      "affectedAreas": ["locations"],
      "riskLevel": "low|moderate|high|critical",
      "recommendations": ["public health actions"],
      "evidencePoints": ["supporting data"],
      "confidence": 0.0-1.0,
      "shouldEscalate": true/false,
      "escalationTarget": "health authority if escalating"
    }
  ],
  "trends": ["notable trends"],
  "publicHealthInsights": ["insights for health planning"],
  "reasoning": "analysis methodology",
  "confidence": 0.0-1.0
}`;

    try {
      const result = await gemini.models.generateContent({
        model: MCP_CONFIG.model,
        contents: [
          {
            role: "user",
            parts: [{
              text: "You are a public health surveillance expert analyzing anonymized data. Respond only with valid JSON.\n\n" + prompt
            }]
          }
        ]
      });

      const parsed = JSON.parse(result.text || "{}");
      
      // Type-safe guards for Gemini response fields (protect against schema drift)
      if (!Array.isArray(parsed.patterns)) {
        parsed.patterns = [];
      }
      if (!Array.isArray(parsed.alerts)) {
        parsed.alerts = [];
      }
      if (!Array.isArray(parsed.trends)) {
        parsed.trends = [];
      }
      if (!Array.isArray(parsed.publicHealthInsights)) {
        parsed.publicHealthInsights = [];
      }
      
      // Parse date strings with defensive checks
      parsed.patterns = parsed.patterns.map((p: any) => ({
        ...p,
        timeRange: {
          start: new Date(p.timeRange?.start || Date.now()),
          end: new Date(p.timeRange?.end || Date.now())
        }
      }));

      return parsed as KnowledgeAnalysis;

    } catch (error) {
      console.error("[KnowledgeAgent] Analysis error:", error);
      
      // Fallback response
      return {
        patterns: [],
        alerts: [],
        trends: ["Normal seasonal patterns observed"],
        publicHealthInsights: ["Continue routine surveillance"],
        reasoning: "Unable to analyze patterns due to error",
        confidence: 0.0
      };
    }
  }

  private async generateResponse(
    assessment: KnowledgeAnalysis,
    language: "en" | "ur"
  ): Promise<{ text: string }> {
    
    let responseText = "";

    // Type-safe guards for Gemini response fields (protect against schema drift)
    const patterns = Array.isArray(assessment.patterns) ? assessment.patterns : [];
    const alerts = Array.isArray(assessment.alerts) ? assessment.alerts : [];
    const trends = Array.isArray(assessment.trends) ? assessment.trends : [];
    const insights = Array.isArray(assessment.publicHealthInsights) ? assessment.publicHealthInsights : [];

    if (alerts.length > 0) {
      responseText = "**HEALTH ALERTS**\n\n";
      
      alerts.forEach((alert) => {
        responseText += `🚨 ${alert.patternType.toUpperCase()}\n`;
        responseText += `Risk Level: ${alert.riskLevel}\n`;
        responseText += `Description: ${alert.description}\n`;
        responseText += `Affected Areas: ${alert.affectedAreas.join(", ")}\n`;
        responseText += `Recommendations:\n${alert.recommendations.map(r => `- ${r}`).join("\n")}\n\n`;
      });
    }

    if (patterns.length > 0) {
      responseText += "**HEALTH PATTERNS**\n\n";
      
      patterns.forEach((pattern) => {
        responseText += `Pattern: ${pattern.symptomCluster.join(", ")}\n`;
        responseText += `Locations: ${pattern.locations.join(", ")}\n`;
        responseText += `Frequency: ${pattern.frequency} cases\n`;
        responseText += `Severity: ${pattern.severity}\n\n`;
      });
    }

    if (trends.length > 0) {
      responseText += "**TRENDS**\n";
      trends.forEach(t => responseText += `- ${t}\n`);
      responseText += "\n";
    }

    if (insights.length > 0) {
      responseText += "**INSIGHTS**\n";
      insights.forEach(i => responseText += `- ${i}\n`);
    }

    if (!responseText.trim()) {
      responseText = "No significant patterns or alerts detected. Health systems operating normally.";
    }

    return { text: responseText };
  }

  private simulateAggregatedData(): string {
    return `
Date Range: Last 30 days
Total Cases Analyzed: 1,200
Geographic Coverage: National

Sample Data:
- Respiratory infections: 45 cases (trending stable)
- Gastrointestinal issues: 32 cases (trending down)
- Waterborne illness: 8 cases (localized to Sindh)
- Malaria: 15 cases (seasonal pattern observed)
- Dengue: 12 cases (concentrated in urban areas)

No current outbreak alerts. All indicators within normal range.
    `;
  }

  private async escalateAlerts(alerts: OutbreakAlert[]): Promise<void> {
    // Log alerts that need escalation
    console.log("[KnowledgeAgent] Escalating alerts:", alerts.map(a => ({
      id: a.id,
      type: a.patternType,
      riskLevel: a.riskLevel,
      target: a.escalationTarget
    })));
    
    // In production, this would notify health authorities
  }
}

export const knowledgeAgent = new KnowledgeAgent();
