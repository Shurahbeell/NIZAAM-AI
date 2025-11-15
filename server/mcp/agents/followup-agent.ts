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
interface FollowUpContext {
  patientId: string;
  conditions: string[];
  medications: Array<{
    name: string;
    schedule: string;
    lastTaken?: Date;
  }>;
  vaccinations: Array<{
    name: string;
    dueDate: Date;
    status: "pending" | "completed" | "overdue";
  }>;
  appointments: Array<{
    date: Date;
    type: string;
    status: "scheduled" | "completed" | "missed";
  }>;
  adherenceHistory: {
    medicationAdherence: number; // 0-1
    appointmentAttendance: number; // 0-1
  };
}

interface FollowUpPlan {
  reminders: Array<{
    type: "medication" | "vaccination" | "appointment" | "checkup";
    message: string;
    scheduledFor: Date;
    priority: "low" | "medium" | "high";
    adaptiveReasoning: string;
  }>;
  escalations: Array<{
    condition: string;
    action: string;
    reason: string;
  }>;
  recommendations: string[];
  reasoning: string;
  confidence: number;
}

export const FOLLOWUP_AGENT_CAPABILITIES: AgentCapability[] = [
  "autonomous_scheduling",
  "adaptive_reminders",
  "adherence_tracking",
  "escalation_logic",
  "bilingual_support"
];

export class FollowUpAgent {
  private translationService: TranslationService;

  constructor() {
    this.translationService = new TranslationService();
  }

  async processMessage(
    message: string,
    language: "english" | "urdu",
    conversationHistory: AgentMessage[]
  ): Promise<{ response: string; metadata: any }> {
    
    // Extract follow-up context
    const context = this.extractContext(message, conversationHistory);
    
    // Generate follow-up plan
    const plan = await this.generateFollowUpPlan(context, message, language);
    
    // Generate response
    const response = await this.generateResponse(plan, language);
    
    return {
      response: response.text,
      metadata: {
        reminders: plan.reminders,
        escalations: plan.escalations,
        recommendations: plan.recommendations,
        confidence: plan.confidence,
        reasoning: plan.reasoning
      }
    };
  }

  private extractContext(
    message: string,
    history: AgentMessage[]
  ): FollowUpContext {
    
    const fullText = message + " " + history.map(m => m.content).join(" ");
    
    const context: FollowUpContext = {
      patientId: "demo-patient",
      conditions: [],
      medications: [],
      vaccinations: [],
      appointments: [],
      adherenceHistory: {
        medicationAdherence: 0.7, // Default estimate
        appointmentAttendance: 0.8
      }
    };

    // Extract conditions
    const conditionKeywords = ["diabetes", "hypertension", "asthma", "tuberculosis", "hepatitis"];
    conditionKeywords.forEach(condition => {
      if (fullText.toLowerCase().includes(condition)) {
        context.conditions.push(condition);
      }
    });

    // Extract medication mentions
    const medicationKeywords = ["insulin", "metformin", "aspirin", "antibiotic", "medication", "medicine", "pills", "دوا"];
    medicationKeywords.forEach(med => {
      if (fullText.toLowerCase().includes(med)) {
        context.medications.push({
          name: med,
          schedule: "daily"
        });
      }
    });

    // Extract vaccination mentions
    if (/\b(vaccine|vaccination|immunization|ٹیکہ)\b/i.test(fullText)) {
      context.vaccinations.push({
        name: "Pending vaccination",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        status: "pending"
      });
    }

    // Detect adherence issues
    if (/\b(forgot|missed|skip|نہیں لیا)\b/i.test(fullText)) {
      context.adherenceHistory.medicationAdherence = 0.5;
    }

    return context;
  }

  private async generateFollowUpPlan(
    context: FollowUpContext,
    userMessage: string,
    language: "english" | "urdu"
  ): Promise<FollowUpPlan> {
    
    const conditionsText = context.conditions.length > 0 
      ? context.conditions.join(", ") 
      : "general health monitoring";
    
    const medicationsText = context.medications.length > 0
      ? context.medications.map(m => `${m.name} (${m.schedule})`).join(", ")
      : "none mentioned";

    const prompt = `You are an AI health follow-up assistant creating personalized reminder and monitoring plans.

Patient Context:
- Conditions: ${conditionsText}
- Medications: ${medicationsText}
- Medication Adherence: ${Math.round(context.adherenceHistory.medicationAdherence * 100)}%
- Appointment Attendance: ${Math.round(context.adherenceHistory.appointmentAttendance * 100)}%

Latest Patient Message: ${userMessage}

Task: Create an adaptive follow-up plan that includes:
1. Smart reminders (medication, vaccination, checkups) with timing based on adherence patterns
2. Escalation actions if needed (e.g., for low adherence or missed critical appointments)
3. Personalized recommendations for improving health management

Adaptive Logic:
- Low adherence (< 60%): More frequent, supportive reminders
- Medium adherence (60-80%): Standard reminders with encouragement
- High adherence (> 80%): Minimal reminders, focus on maintenance

Respond in JSON format:
{
  "reminders": [
    {
      "type": "medication|vaccination|appointment|checkup",
      "message": "reminder message",
      "scheduledFor": "ISO date string",
      "priority": "low|medium|high",
      "adaptiveReasoning": "why this timing/frequency"
    }
  ],
  "escalations": [
    {
      "condition": "what triggered escalation",
      "action": "recommended action",
      "reason": "why escalating"
    }
  ],
  "recommendations": ["personalized advice"],
  "reasoning": "overall strategy explanation",
  "confidence": 0.0-1.0
}`;

    try {
      const result = await generateText({
        model: openai("gpt-4o"),
        messages: [
          {
            role: "system",
            content: "You are a health follow-up expert creating adaptive care plans. Respond only with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4,
        maxTokens: 2000
      });

      const parsed = JSON.parse(result.text);
      
      // Parse ISO date strings to Date objects
      parsed.reminders = parsed.reminders.map((r: any) => ({
        ...r,
        scheduledFor: new Date(r.scheduledFor)
      }));

      return parsed as FollowUpPlan;

    } catch (error) {
      console.error("[FollowUpAgent] Planning error:", error);
      
      // Fallback plan
      const fallbackDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      return {
        reminders: [
          {
            type: "medication",
            message: "Don't forget to take your medication today",
            scheduledFor: fallbackDate,
            priority: "medium",
            adaptiveReasoning: "Daily medication reminder"
          }
        ],
        escalations: [],
        recommendations: [
          "Set up a daily alarm for medication",
          "Keep a medication diary",
          "Schedule regular checkups"
        ],
        reasoning: "Created basic follow-up plan. More context needed for personalization.",
        confidence: 0.5
      };
    }
  }

  private async generateResponse(
    plan: FollowUpPlan,
    language: "english" | "urdu"
  ): Promise<{ text: string }> {
    
    let responseText = "I've created a personalized follow-up plan for you:\n\n";

    // Reminders section
    if (plan.reminders.length > 0) {
      responseText += "📅 **Upcoming Reminders:**\n";
      plan.reminders.forEach((reminder, i) => {
        const priorityEmoji = reminder.priority === "high" ? "🔴" : reminder.priority === "medium" ? "🟡" : "🟢";
        const dateStr = reminder.scheduledFor.toLocaleDateString();
        responseText += `${i + 1}. ${priorityEmoji} ${reminder.message}\n`;
        responseText += `   Scheduled: ${dateStr} - ${reminder.adaptiveReasoning}\n`;
      });
      responseText += "\n";
    }

    // Escalations section
    if (plan.escalations.length > 0) {
      responseText += "⚠️ **Important Actions Needed:**\n";
      plan.escalations.forEach((escalation, i) => {
        responseText += `${i + 1}. ${escalation.action}\n`;
        responseText += `   Reason: ${escalation.reason}\n`;
      });
      responseText += "\n";
    }

    // Recommendations section
    if (plan.recommendations.length > 0) {
      responseText += "💡 **Health Management Tips:**\n";
      plan.recommendations.forEach((rec, i) => {
        responseText += `${i + 1}. ${rec}\n`;
      });
      responseText += "\n";
    }

    responseText += `\n${plan.reasoning}`;

    // Translate to Urdu if needed
    if (language === "urdu") {
      responseText = await this.translationService.translate(responseText, "urdu");
    }

    return { text: responseText };
  }

  getCapabilities(): AgentCapability[] {
    return FOLLOWUP_AGENT_CAPABILITIES;
  }
}
