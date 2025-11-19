import { openai, MCP_CONFIG } from "../index";
import { translationService } from "../services/translation";
import { storage } from "../../storage";
import type { Agent } from "../orchestrator/agent-registry";
import { GOOGLE_MAPS_API_KEY } from "../../config/google";

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

interface GooglePlacesResult {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating?: number;
  place_id: string;
  distance?: number;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export async function findNearbyFacilities(
  lat: number,
  lng: number,
  radius: number = 200000
): Promise<GooglePlacesResult[]> {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=hospital&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "ZERO_RESULTS" || !data.results) {
      return [];
    }

    const results: GooglePlacesResult[] = data.results.map((place: any) => ({
      name: place.name,
      address: place.vicinity,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      rating: place.rating,
      place_id: place.place_id,
      distance: calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng)
    }));

    return results.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  } catch (error) {
    console.error("[findNearbyFacilities] Error:", error);
    return [];
  }
}

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
    name: "CityMed Pharmacy",
    type: "Pharmacy",
    city: "Lahore",
    address: "Mall Road, Lahore",
    services: ["Prescription Medicines", "OTC Drugs", "Medical Supplies", "Home Delivery"],
    rating: 4.3,
    reviewCount: 567,
    availability: "8 AM - 11 PM"
  },
  {
    id: "6",
    name: "Health Plus Drug Store",
    type: "Pharmacy",
    city: "Lahore",
    address: "Gulberg III, Lahore",
    services: ["Prescription Medicines", "OTC Drugs", "Vitamins", "First Aid Supplies"],
    rating: 4.1,
    reviewCount: 432,
    availability: "24/7"
  },
  {
    id: "7",
    name: "Fazal Din Pharmacy",
    type: "Pharmacy",
    city: "Karachi",
    address: "Tariq Road, Karachi",
    services: ["Prescription Medicines", "OTC Drugs", "Medical Equipment", "Lab Tests"],
    rating: 4.5,
    reviewCount: 891,
    availability: "24/7"
  },
  {
    id: "8",
    name: "MedLife Pharmacy",
    type: "Pharmacy",
    city: "Islamabad",
    address: "Blue Area, Islamabad",
    services: ["Prescription Medicines", "OTC Drugs", "Supplements", "Cosmetics"],
    rating: 4.2,
    reviewCount: 324,
    availability: "9 AM - 10 PM"
  }
];

export class FacilityFinderAgent implements Agent {
  name = "Facility Finder Agent";
  description = "Smart hospital/BHU/pharmacy matching with Triage coordination";
  capabilities = [
    "facility_matching",
    "pharmacy_search",
    "distance_calculation",
    "triage_coordination",
    "availability_checking",
    "bilingual_support"
  ];

  async handleMessage(
    sessionId: string,
    message: string,
    language: string = "english"
  ): Promise<string> {
    try {
      console.log(`[FacilityFinderAgent] Processing message in ${language}`);
      
      const detectedLanguage = await translationService.detectLanguage(message);
      const userLanguage = language === "urdu" || detectedLanguage === "urdu" ? "urdu" : "english";
      
      let processedMessage = message;
      if (userLanguage === "urdu") {
        processedMessage = await translationService.translate(message, "english", "Facility search");
      }
      
      const history = await storage.getSessionMessages(sessionId);
      const fullText = processedMessage + " " + history.map(m => m.content).join(" ");
    
    let city = "Lahore";
    const cities = ["lahore", "karachi", "islamabad"];
    cities.forEach(c => {
      if (fullText.toLowerCase().includes(c)) {
        city = c.charAt(0).toUpperCase() + c.slice(1);
      }
    });
    
    const facilities = SAMPLE_FACILITIES.filter(f => f.city === city);
    
    const facilitiesInfo = facilities.map(f =>
      `${f.name} (${f.type})\nServices: ${f.services.join(", ")}\nRating: ${f.rating}/5\nAvailability: ${f.availability}`
    ).join("\n\n");

    const prompt = `Find the best healthcare facilities for this patient.

Patient Request: ${message}
Location: ${city}

Available Facilities:
${facilitiesInfo}

Provide top 3 recommendations with match scores (0-1) in JSON:
{
  "recommendations": [
    {"name": "facility", "matchScore": 0.9, "reasoning": "why"}
  ],
  "summary": "brief recommendation"
}`;

      const result = await openai.chat.completions.create({
        model: MCP_CONFIG.model,
        messages: [
          { role: "system", content: "You are a facility finder. Respond with JSON only." },
          { role: "user", content: prompt }
        ],
        max_completion_tokens: 1500
      });

      const parsed = JSON.parse(result.choices[0].message.content || "{}");
      
      let responseText = `I found ${parsed.recommendations?.length || 0} healthcare facilities in ${city}:\n\n`;
      
      parsed.recommendations?.forEach((rec: any, i: number) => {
        const facility = facilities.find(f => f.name === rec.name);
        if (facility) {
          responseText += `${i + 1}. **${facility.name}** - ${facility.type}\n`;
          responseText += `   📍 ${facility.address}\n`;
          responseText += `   ⭐ ${facility.rating}/5 (${facility.reviewCount} reviews)\n`;
          responseText += `   🏥 ${facility.services.slice(0, 3).join(", ")}\n`;
          responseText += `   🕐 ${facility.availability}\n`;
          responseText += `   📊 Match: ${Math.round(rec.matchScore * 100)}% - ${rec.reasoning}\n\n`;
        }
      });
      
      responseText += parsed.summary || "";

      const localizedResponse = userLanguage === "urdu"
        ? await translationService.translate(responseText, "urdu", "Facility search results")
        : responseText;

      await storage.createAgentMessage({
        sessionId,
        senderType: "agent",
        content: localizedResponse,
        metadata: { recommendations: parsed.recommendations, city },
        language: userLanguage
      });

      return localizedResponse;

    } catch (error) {
      console.error("[FacilityFinderAgent] Error:", error);
      const fallback = "I couldn't find facilities. Please specify your location and medical needs.";
      return language === "urdu"
        ? await translationService.translate(fallback, "urdu")
        : fallback;
    }
  }
}

export const facilityFinderAgent = new FacilityFinderAgent();
