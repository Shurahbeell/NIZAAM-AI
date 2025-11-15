import { openai, MCP_CONFIG } from "../index";
import { translationService } from "../services/translation";
import { storage } from "../../storage";
import type { Agent } from "../orchestrator/agent-registry";

export class FollowUpAgent implements Agent {
  name = "Follow-Up Agent";
  description = "Autonomous scheduling and adaptive reminders";
  capabilities = [
    "autonomous_scheduling",
    "adaptive_reminders",
    "adherence_tracking",
    "escalation_logic",
    "bilingual_support"
  ];

  async handleMessage(
    sessionId: string,
    message: string,
    language: string = "english"
  ): Promise<string> {
    try {
      console.log(`[FollowUpAgent] Processing message in ${language}`);
      
      // Detect and translate Urdu input to English for GPT-5
      const detectedLanguage = await translationService.detectLanguage(message);
      const userLanguage = language === "urdu" || detectedLanguage === "urdu" ? "urdu" : "english";
      
      let processedMessage = message;
      if (userLanguage === "urdu") {
        processedMessage = await translationService.translate(message, "english", "Follow-up care");
      }
      
      const history = await storage.getSessionMessages(sessionId);
      const fullText = processedMessage + " " + history.map(m => m.content).join(" ");
    
    // Extract context
    const hasMedication = /\b(medication|medicine|pills|insulin|دوا)\b/i.test(fullText);
    const hasVaccination = /\b(vaccine|vaccination|immunization|ٹیکہ)\b/i.test(fullText);
    const forgotMeds = /\b(forgot|missed|skip|نہیں لیا)\b/i.test(fullText);
    
    const adherence = forgotMeds ? 0.5 : 0.8;

    const prompt = `Create a follow-up plan for this patient.

Patient Message: ${message}
Has Medication: ${hasMedication}
Has Vaccination: ${hasVaccination}
Adherence Level: ${Math.round(adherence * 100)}%

Create adaptive reminders and recommendations in JSON:
{
  "reminders": [
    {
      "type": "medication|vaccination|checkup",
      "message": "reminder text",
      "priority": "low|medium|high",
      "timing": "when to send"
    }
  ],
  "recommendations": ["tip 1", "tip 2"],
  "escalations": ["action if needed"],
  "summary": "brief summary"
}`;

      const result = await openai.chat.completions.create({
        model: MCP_CONFIG.model,
        messages: [
          { role: "system", content: "You are a follow-up care coordinator. Respond with JSON only." },
          { role: "user", content: prompt }
        ],
        temperature: 0.4,
        max_tokens: 1500
      });

      const parsed = JSON.parse(result.choices[0].message.content || "{}");
      
      let responseText = "I've created a personalized follow-up plan:\n\n";

      if (parsed.reminders?.length > 0) {
        responseText += "📅 **Upcoming Reminders:**\n";
        parsed.reminders.forEach((reminder: any, i: number) => {
          const emoji = reminder.priority === "high" ? "🔴" : reminder.priority === "medium" ? "🟡" : "🟢";
          responseText += `${i + 1}. ${emoji} ${reminder.message} (${reminder.timing})\n`;
        });
        responseText += "\n";
      }

      if (parsed.escalations?.length > 0) {
        responseText += "⚠️ **Important:**\n";
        parsed.escalations.forEach((esc: string) => {
          responseText += `- ${esc}\n`;
        });
        responseText += "\n";
      }

      if (parsed.recommendations?.length > 0) {
        responseText += "💡 **Tips:**\n";
        parsed.recommendations.forEach((rec: string, i: number) => {
          responseText += `${i + 1}. ${rec}\n`;
        });
      }

      // Translate response to Urdu if needed
      const localizedResponse = userLanguage === "urdu"
        ? await translationService.translate(responseText, "urdu", "Follow-up care plan")
        : responseText;

      await storage.createAgentMessage({
        sessionId,
        senderType: "agent",
        content: localizedResponse,
        metadata: { reminders: parsed.reminders, adherence },
        language: userLanguage
      });

      return localizedResponse;

    } catch (error) {
      console.error("[FollowUpAgent] Error:", error);
      const fallback = "I can help you set up medication reminders. Tell me about your treatment plan.";
      return language === "urdu"
        ? await translationService.translate(fallback, "urdu")
        : fallback;
    }
  }
}

export const followUpAgent = new FollowUpAgent();
