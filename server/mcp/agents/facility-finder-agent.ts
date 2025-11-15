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
interface FacilitySearchContext {
  medicalNeeds: string[];
  urgency: "routine" | "urgent" | "emergency";
  location?: {
    latitude?: number;
    longitude?: number;
    city?: string;
  };
  preferences?: {
    maxDistance?: number;
    facilityType?: string[];
    minRating?: number;
  };
}

interface FacilityMatch {
  id: string;
  name: string;
  type: string;
  address: string;
  distance?: number;
  rating: number;
  reviewCount: number;
  services: string[];
  availability: string;
  matchScore: number;
  reasoning: string;
}

interface FacilitySearchResult {
  recommendations: FacilityMatch[];
  reasoning: string;
  confidence: number;
  triageCoordination?: {
    urgencyLevel: string;
    recommendedAction: string;
  };
}

// Sample facility data - In production, this would come from a database
const SAMPLE_FACILITIES = [
  {
    id: "1",
    name: "Jinnah Hospital",
    type: "Teaching Hospital",
    city: "Lahore",
    address: "Ferozepur Road, Lahore",
    services: ["Emergency", "Cardiology", "Surgery", "Pediatrics", "ICU"],
    rating: 4.2,
    reviewCount: 1234,
    availability: "24/7"
  },
  {
    id: "2",
    name: "Services Hospital",
    type: "Government Hospital",
    city: "Lahore",
    address: "Jail Road, Lahore",
    services: ["Emergency", "General Medicine", "Surgery", "Obstetrics"],
    rating: 4.0,
    reviewCount: 892,
    availability: "24/7"
  },
  {
    id: "3",
    name: "Model Town BHU",
    type: "Basic Health Unit",
    city: "Lahore",
    address: "Model Town, Lahore",
    services: ["General Medicine", "Vaccinations", "Family Planning", "Maternal Care"],
    rating: 3.8,
    reviewCount: 156,
    availability: "8 AM - 4 PM"
  },
  {
    id: "4",
    name: "Agha Khan University Hospital",
    type: "Private Hospital",
    city: "Karachi",
    address: "Stadium Road, Karachi",
    services: ["Emergency", "Cardiology", "Oncology", "Surgery", "ICU", "Nephrology"],
    rating: 4.7,
    reviewCount: 3421,
    availability: "24/7"
  },
  {
    id: "5",
    name: "Shaukat Khanum Hospital",
    type: "Specialized Cancer Hospital",
    city: "Lahore",
    address: "Johar Town, Lahore",
    services: ["Oncology", "Radiation Therapy", "Chemotherapy", "Surgery"],
    rating: 4.9,
    reviewCount: 5678,
    availability: "24/7"
  },
  {
    id: "6",
    name: "Lady Health Worker Clinic",
    type: "Community Clinic",
    city: "Lahore",
    address: "Gulberg, Lahore",
    services: ["Prenatal Care", "Vaccinations", "Family Planning", "Health Education"],
    rating: 4.1,
    reviewCount: 89,
    availability: "9 AM - 2 PM"
  }
];

export const FACILITY_FINDER_AGENT_CAPABILITIES: AgentCapability[] = [
  "facility_matching",
  "distance_calculation",
  "triage_coordination",
  "availability_checking",
  "bilingual_support"
];

export class FacilityFinderAgent {
  private translationService: TranslationService;

  constructor() {
    this.translationService = new TranslationService();
  }

  async processMessage(
    message: string,
    language: "english" | "urdu",
    conversationHistory: AgentMessage[]
  ): Promise<{ response: string; metadata: any }> {
    
    // Extract search context
    const context = this.extractSearchContext(message, conversationHistory);
    
    // Find matching facilities
    const searchResult = await this.findFacilities(context, language);
    
    // Generate response
    const response = await this.generateResponse(searchResult, language);
    
    return {
      response: response.text,
      metadata: {
        recommendations: searchResult.recommendations,
        confidence: searchResult.confidence,
        reasoning: searchResult.reasoning,
        triageCoordination: searchResult.triageCoordination
      }
    };
  }

  private extractSearchContext(
    message: string,
    history: AgentMessage[]
  ): FacilitySearchContext {
    
    const context: FacilitySearchContext = {
      medicalNeeds: [],
      urgency: "routine"
    };

    const fullText = message + " " + history.map(m => m.content).join(" ");

    // Extract medical needs
    const needsKeywords = [
      "emergency", "urgent", "chest pain", "bleeding", "fracture",
      "fever", "cough", "headache", "pregnancy", "vaccination",
      "diabetes", "heart", "cancer", "surgery"
    ];
    
    needsKeywords.forEach(keyword => {
      if (fullText.toLowerCase().includes(keyword)) {
        context.medicalNeeds.push(keyword);
      }
    });

    // Determine urgency
    if (/\b(emergency|urgent|severe|critical|فوری)\b/i.test(fullText)) {
      context.urgency = "emergency";
    } else if (/\b(soon|quickly|today|جلد)\b/i.test(fullText)) {
      context.urgency = "urgent";
    }

    // Extract location
    const cities = ["lahore", "karachi", "islamabad", "rawalpindi", "faisalabad", "multan"];
    cities.forEach(city => {
      if (fullText.toLowerCase().includes(city)) {
        context.location = { city: city.charAt(0).toUpperCase() + city.slice(1) };
      }
    });

    return context;
  }

  private async findFacilities(
    context: FacilitySearchContext,
    language: "english" | "urdu"
  ): Promise<FacilitySearchResult> {
    
    // Filter facilities by location
    let filteredFacilities = SAMPLE_FACILITIES;
    if (context.location?.city) {
      filteredFacilities = SAMPLE_FACILITIES.filter(
        f => f.city.toLowerCase() === context.location!.city!.toLowerCase()
      );
    }

    // Use AI to rank facilities
    const facilitiesInfo = filteredFacilities.map(f =>
      `${f.name} (${f.type})\nServices: ${f.services.join(", ")}\nRating: ${f.rating}/5 (${f.reviewCount} reviews)\nAvailability: ${f.availability}`
    ).join("\n\n");

    const prompt = `You are an AI helping patients find the best healthcare facility.

User's Medical Needs: ${context.medicalNeeds.join(", ") || "general healthcare"}
Urgency Level: ${context.urgency}
Location: ${context.location?.city || "any"}

Available Facilities:
${facilitiesInfo}

Task: Rank these facilities based on:
1. Match with medical needs (services offered)
2. Urgency level (24/7 for emergencies, clinics OK for routine)
3. Ratings and reviews
4. Facility type appropriateness

Respond in JSON format:
{
  "recommendations": [
    {
      "name": "facility name",
      "matchScore": 0.0-1.0,
      "reasoning": "why this facility matches",
      "urgencyAppropriate": true/false
    }
  ],
  "reasoning": "overall recommendation strategy",
  "confidence": 0.0-1.0,
  "triageCoordination": {
    "urgencyLevel": "routine/urgent/emergency",
    "recommendedAction": "what patient should do"
  }
}`;

    try {
      const result = await generateText({
        model: openai("gpt-4o"),
        messages: [
          {
            role: "system",
            content: "You are a healthcare facility matching expert. Respond only with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        maxTokens: 2000
      });

      const parsed = JSON.parse(result.text);
      
      // Enhance with full facility data
      const recommendations: FacilityMatch[] = parsed.recommendations.map((rec: any) => {
        const facility = filteredFacilities.find(f => f.name === rec.name)!;
        return {
          id: facility.id,
          name: facility.name,
          type: facility.type,
          address: facility.address,
          rating: facility.rating,
          reviewCount: facility.reviewCount,
          services: facility.services,
          availability: facility.availability,
          matchScore: rec.matchScore,
          reasoning: rec.reasoning
        };
      });

      return {
        recommendations,
        reasoning: parsed.reasoning,
        confidence: parsed.confidence,
        triageCoordination: parsed.triageCoordination
      };

    } catch (error) {
      console.error("[FacilityFinderAgent] Search error:", error);
      
      // Fallback: return top-rated facilities
      const fallbackRecs: FacilityMatch[] = filteredFacilities
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3)
        .map(f => ({
          id: f.id,
          name: f.name,
          type: f.type,
          address: f.address,
          rating: f.rating,
          reviewCount: f.reviewCount,
          services: f.services,
          availability: f.availability,
          matchScore: 0.7,
          reasoning: "Top-rated facility in your area"
        }));

      return {
        recommendations: fallbackRecs,
        reasoning: "Showing top-rated facilities. Provide more details for better matching.",
        confidence: 0.5
      };
    }
  }

  private async generateResponse(
    result: FacilitySearchResult,
    language: "english" | "urdu"
  ): Promise<{ text: string }> {
    
    let responseText = "";

    if (result.recommendations.length === 0) {
      responseText = "I couldn't find any facilities matching your needs in the specified area. Could you provide more details about your location or medical needs?";
    } else {
      responseText = `I found ${result.recommendations.length} healthcare facilities for you:\n\n`;
      
      result.recommendations.forEach((facility, i) => {
        responseText += `${i + 1}. **${facility.name}** - ${facility.type}\n`;
        responseText += `   📍 ${facility.address}\n`;
        responseText += `   ⭐ ${facility.rating}/5 (${facility.reviewCount} reviews)\n`;
        responseText += `   🏥 Services: ${facility.services.slice(0, 3).join(", ")}${facility.services.length > 3 ? "..." : ""}\n`;
        responseText += `   🕐 ${facility.availability}\n`;
        responseText += `   📊 Match: ${Math.round(facility.matchScore * 100)}% - ${facility.reasoning}\n\n`;
      });

      if (result.triageCoordination) {
        responseText += `\n⚠️ **Recommendation**: ${result.triageCoordination.recommendedAction}`;
      }
    }

    // Translate to Urdu if needed
    if (language === "urdu") {
      responseText = await this.translationService.translate(responseText, "urdu");
    }

    return { text: responseText };
  }

  getCapabilities(): AgentCapability[] {
    return FACILITY_FINDER_AGENT_CAPABILITIES;
  }
}
