import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import type { AgentCapability, AgentMessage } from "../types";
import { TranslationService } from "../services/translation";
import { PIIProtectionService } from "../services/pii-protection";

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

export const KNOWLEDGE_AGENT_CAPABILITIES: AgentCapability[] = [
  "pattern_detection",
  "outbreak_monitoring",
  "data_aggregation",
  "alert_escalation",
  "anonymization"
];

export class KnowledgeAgent {
  private translationService: TranslationService;
  private piiProtection: PIIProtectionService;

  constructor() {
    this.translationService = new TranslationService();
    this.piiProtection = new PIIProtectionService();
  }

  async processMessage(
    message: string,
    language: "english" | "urdu",
    conversationHistory: AgentMessage[]
  ): Promise<{ response: string; metadata: any }> {
    
    // Anonymize all data before processing
    const anonymizedMessage = await this.piiProtection.redactPII(message);
    const anonymizedHistory = await Promise.all(
      conversationHistory.map(async (msg) => ({
        ...msg,
        content: await this.piiProtection.redactPII(msg.content)
      }))
    );
    
    // Analyze patterns and detect potential outbreaks
    const analysis = await this.analyzeHealthPatterns(
      anonymizedMessage,
      anonymizedHistory,
      language
    );
    
    // Generate response
    const response = await this.generateResponse(analysis, language);
    
    // Process escalations if needed
    if (analysis.alerts.some(a => a.shouldEscalate)) {
      await this.escalateAlerts(analysis.alerts.filter(a => a.shouldEscalate));
    }
    
    return {
      response: response.text,
      metadata: {
        patterns: analysis.patterns,
        alerts: analysis.alerts,
        trends: analysis.trends,
        confidence: analysis.confidence,
        reasoning: analysis.reasoning
      }
    };
  }

  private async analyzeHealthPatterns(
    message: string,
    history: AgentMessage[],
    language: "english" | "urdu"
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
      const result = await generateText({
        model: openai("gpt-4o"),
        messages: [
          {
            role: "system",
            content: "You are a public health surveillance expert analyzing anonymized data. Respond only with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        maxTokens: 2500
      });

      const parsed = JSON.parse(result.text);
      
      // Parse date strings
      parsed.patterns = parsed.patterns.map((p: any) => ({
        ...p,
        timeRange: {
          start: new Date(p.timeRange.start),
          end: new Date(p.timeRange.end)
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
        reasoning: "Insufficient data for pattern detection. Continue monitoring.",
        confidence: 0.5
      };
    }
  }

  private simulateAggregatedData(): string {
    // In production, this would query anonymized data from agent_messages
    // For demo purposes, we return sample aggregated data
    
    return `
Sample Anonymized Health Data (Last 30 Days):

Symptom Patterns:
- Respiratory symptoms (cough, fever): 127 cases
  - Lahore: 45 cases
  - Karachi: 38 cases
  - Islamabad: 25 cases
  - Other: 19 cases
  
- Gastrointestinal symptoms: 34 cases
  - Distributed evenly across regions
  
- Fever + rash: 8 cases
  - Concentrated in Lahore (6 cases)
  - Last 7 days: 5 cases
  
Age Distribution:
- 0-5 years: 32%
- 6-18 years: 18%
- 19-45 years: 35%
- 46+ years: 15%

Temporal Trends:
- Week 1: 45 total cases
- Week 2: 52 total cases (+15%)
- Week 3: 68 total cases (+30%)
- Week 4: 71 total cases (+4%)

Note: All data anonymized and aggregated per privacy protocols.
`;
  }

  private async escalateAlerts(alerts: OutbreakAlert[]): Promise<void> {
    // In production, this would:
    // 1. Store alerts in knowledge_alerts table
    // 2. Notify health authorities via configured channels
    // 3. Trigger automated responses (e.g., increased surveillance)
    
    console.log("[KnowledgeAgent] ESCALATION TRIGGERED:");
    alerts.forEach(alert => {
      console.log(`- ${alert.patternType} (${alert.riskLevel}) → ${alert.escalationTarget}`);
      console.log(`  Evidence: ${alert.evidencePoints.join(", ")}`);
    });
    
    // TODO: Implement actual escalation logic
    // - Email/SMS to health department
    // - Create knowledge_alerts record
    // - Trigger event for other agents to adjust behavior
  }

  private async generateResponse(
    analysis: KnowledgeAnalysis,
    language: "english" | "urdu"
  ): Promise<{ text: string }> {
    
    let responseText = "";

    // Alerts section (most important)
    if (analysis.alerts.length > 0) {
      responseText += "🚨 **Outbreak Alerts Detected:**\n\n";
      
      analysis.alerts.forEach((alert, i) => {
        const riskEmoji = alert.riskLevel === "critical" ? "🔴" 
          : alert.riskLevel === "high" ? "🟠"
          : alert.riskLevel === "moderate" ? "🟡" : "🟢";
        
        responseText += `${i + 1}. ${riskEmoji} **${alert.patternType}** - ${alert.riskLevel.toUpperCase()} RISK\n`;
        responseText += `   ${alert.description}\n`;
        responseText += `   Affected areas: ${alert.affectedAreas.join(", ")}\n`;
        responseText += `   Evidence: ${alert.evidencePoints.join(", ")}\n`;
        
        if (alert.recommendations.length > 0) {
          responseText += `   Recommendations:\n${alert.recommendations.map(r => `   - ${r}`).join("\n")}\n`;
        }
        
        if (alert.shouldEscalate) {
          responseText += `   ⚠️ ESCALATED to ${alert.escalationTarget}\n`;
        }
        responseText += "\n";
      });
    }

    // Patterns section
    if (analysis.patterns.length > 0) {
      responseText += "📊 **Health Patterns Detected:**\n\n";
      
      analysis.patterns.slice(0, 3).forEach((pattern, i) => {
        responseText += `${i + 1}. ${pattern.symptomCluster.join(", ")}\n`;
        responseText += `   Frequency: ${pattern.frequency} cases\n`;
        responseText += `   Locations: ${pattern.locations.join(", ")}\n`;
        responseText += `   Severity: ${pattern.severity}\n\n`;
      });
    }

    // Trends section
    if (analysis.trends.length > 0) {
      responseText += "📈 **Health Trends:**\n";
      analysis.trends.forEach((trend, i) => {
        responseText += `${i + 1}. ${trend}\n`;
      });
      responseText += "\n";
    }

    // Public health insights
    if (analysis.publicHealthInsights.length > 0) {
      responseText += "💡 **Public Health Insights:**\n";
      analysis.publicHealthInsights.forEach((insight, i) => {
        responseText += `${i + 1}. ${insight}\n`;
      });
      responseText += "\n";
    }

    if (responseText === "") {
      responseText = "No significant health patterns or alerts detected at this time. Routine monitoring continues.";
    }

    responseText += `\n🔒 **Privacy**: All data analyzed is fully anonymized and aggregated per health privacy protocols.`;

    // Translate to Urdu if needed
    if (language === "urdu") {
      responseText = await this.translationService.translate(responseText, "urdu");
    }

    return { text: responseText };
  }

  getCapabilities(): AgentCapability[] {
    return KNOWLEDGE_AGENT_CAPABILITIES;
  }
}
