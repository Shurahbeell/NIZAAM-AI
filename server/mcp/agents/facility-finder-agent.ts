import { gemini, MCP_CONFIG } from "../index";
import { translationService } from "../services/translation";
import { storage } from "../../storage";
import type { Agent } from "../orchestrator/agent-registry";
import axios from "axios";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.GOOGLE_MAPS_KEY || "";

interface GooglePlace {
  name: string;
  vicinity?: string;
  formatted_address?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  place_id: string;
  user_ratings_total?: number;
  types?: string[];
  photos?: Array<{ photo_reference: string }>;
  formatted_phone_number?: string;
  opening_hours?: any;
}

interface FacilityResult {
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  place_id: string;
  user_ratings_total?: number;
  types?: string[];
  photo_reference?: string;
  phone?: string;
  opening_hours?: any;
  distance?: {
    text: string;
    value: number;
  };
  duration?: {
    text: string;
    value: number;
  };
  recommendation?: string[];
  score?: number;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchPlacesNearby(
  lat: number,
  lng: number,
  radius?: number,
  rankBy?: 'distance',
  keyword?: string,
  pageToken?: string
): Promise<{ results: GooglePlace[]; next_page_token?: string }> {
  try {
    let url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?';
    
    if (rankBy === 'distance') {
      url += `location=${lat},${lng}&rankby=distance&type=hospital`;
    } else {
      url += `location=${lat},${lng}&radius=${radius || 5000}&type=hospital`;
    }
    
    if (keyword) {
      url += `&keyword=${encodeURIComponent(keyword)}`;
    }
    
    if (pageToken) {
      url += `&pagetoken=${pageToken}`;
    }
    
    url += `&key=${GOOGLE_API_KEY}`;
    
    const response = await axios.get(url);
    
    if (response.data.status === 'ZERO_RESULTS') {
      return { results: [] };
    }
    
    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      console.error('[Places API] Error:', response.data.status, response.data.error_message);
      return { results: [] };
    }
    
    return {
      results: response.data.results || [],
      next_page_token: response.data.next_page_token
    };
  } catch (error) {
    console.error('[fetchPlacesNearby] Error:', error);
    return { results: [] };
  }
}

async function fetchPlaceDetails(placeId: string): Promise<Partial<GooglePlace> | null> {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number,opening_hours,website,photos&key=${GOOGLE_API_KEY}`;
    const response = await axios.get(url);
    
    if (response.data.status === 'OK') {
      return response.data.result;
    }
    
    return null;
  } catch (error) {
    console.error('[fetchPlaceDetails] Error:', error);
    return null;
  }
}

async function fetchDistanceMatrix(
  origin: { lat: number; lng: number },
  destinations: Array<{ lat: number; lng: number }>
): Promise<Array<{ distance?: { text: string; value: number }; duration?: { text: string; value: number } }>> {
  try {
    const destinationsStr = destinations.map(d => `${d.lat},${d.lng}`).join('|');
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destinationsStr}&key=${GOOGLE_API_KEY}`;
    
    const response = await axios.get(url);
    
    if (response.data.status === 'OK' && response.data.rows?.[0]?.elements) {
      return response.data.rows[0].elements.map((el: any) => ({
        distance: el.distance,
        duration: el.duration
      }));
    }
    
    return destinations.map(() => ({}));
  } catch (error) {
    console.error('[fetchDistanceMatrix] Error:', error);
    return destinations.map(() => ({}));
  }
}

export async function findNearbyFacilities(
  lat: number,
  lng: number,
  opts?: { limit?: number; filters?: string[] }
): Promise<{ results: FacilityResult[]; meta: { cached: boolean; source: string; fetched_at: number; error?: string } }> {
  const limit = opts?.limit || 50;
  const filters = opts?.filters || [];
  const keyword = filters.join(' ');
  
  console.log(`[findNearbyFacilities] Searching near ${lat},${lng} with limit ${limit}, filters: ${filters.join(',')}`);
  
  try {
    let allResults: GooglePlace[] = [];
    const seenPlaceIds = new Set<string>();
    
    console.log('[Zone 1] Fetching with rankby=distance...');
    let response = await fetchPlacesNearby(lat, lng, undefined, 'distance', keyword);
    
    response.results.forEach(r => {
      if (!seenPlaceIds.has(r.place_id)) {
        allResults.push(r);
        seenPlaceIds.add(r.place_id);
      }
    });
    
    let pageToken = response.next_page_token;
    let pageCount = 0;
    
    while (pageToken && allResults.length < limit && pageCount < 2) {
      await sleep(2000);
      console.log(`[Zone 1] Fetching page ${pageCount + 2}...`);
      response = await fetchPlacesNearby(lat, lng, undefined, 'distance', keyword, pageToken);
      
      response.results.forEach(r => {
        if (!seenPlaceIds.has(r.place_id)) {
          allResults.push(r);
          seenPlaceIds.add(r.place_id);
        }
      });
      
      pageToken = response.next_page_token;
      pageCount++;
    }
    
    console.log(`[Zone 1 Loaded] Found ${allResults.length} results`);
    
    const minWanted = 15;
    const radii = [5000, 20000, 50000, 100000, 200000];
    
    if (allResults.length < minWanted) {
      for (const radius of radii) {
        if (allResults.length >= limit) break;
        
        console.log(`[Zone ${radius/1000}km] Fetching...`);
        await sleep(400);
        
        const radiusResponse = await fetchPlacesNearby(lat, lng, radius, undefined, keyword);
        
        radiusResponse.results.forEach(r => {
          if (!seenPlaceIds.has(r.place_id) && allResults.length < limit) {
            allResults.push(r);
            seenPlaceIds.add(r.place_id);
          }
        });
        
        console.log(`[Zone ${radius/1000}km Loaded] Total: ${allResults.length}`);
        
        let zonePageToken = radiusResponse.next_page_token;
        if (zonePageToken && allResults.length < limit) {
          await sleep(2000);
          const pageResponse = await fetchPlacesNearby(lat, lng, radius, undefined, keyword, zonePageToken);
          pageResponse.results.forEach(r => {
            if (!seenPlaceIds.has(r.place_id) && allResults.length < limit) {
              allResults.push(r);
              seenPlaceIds.add(r.place_id);
            }
          });
        }
        
        if (allResults.length >= limit) break;
      }
    }
    
    const mapped: FacilityResult[] = allResults.slice(0, limit).map(place => ({
      name: place.name,
      address: place.vicinity || place.formatted_address || '',
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      rating: place.rating,
      place_id: place.place_id,
      user_ratings_total: place.user_ratings_total,
      types: place.types,
      photo_reference: place.photos?.[0]?.photo_reference
    }));
    
    mapped.forEach(f => {
      f.distance = {
        text: `${(calculateDistance(lat, lng, f.lat, f.lng) / 1000).toFixed(1)} km`,
        value: calculateDistance(lat, lng, f.lat, f.lng)
      };
    });
    
    mapped.sort((a, b) => (a.distance?.value || 0) - (b.distance?.value || 0));
    
    const topN = Math.min(10, mapped.length);
    const topResults = mapped.slice(0, topN);
    
    console.log(`[Place Details] Fetching for top ${topN} results...`);
    for (const result of topResults) {
      const details = await fetchPlaceDetails(result.place_id);
      if (details) {
        result.phone = details.formatted_phone_number;
        result.opening_hours = details.opening_hours;
        if (details.photos?.[0]) {
          result.photo_reference = details.photos[0].photo_reference;
        }
      }
      await sleep(100);
    }
    
    console.log(`[Distance Matrix] Computing for top ${topN} results...`);
    const destinations = topResults.map(r => ({ lat: r.lat, lng: r.lng }));
    const distanceData = await fetchDistanceMatrix({ lat, lng }, destinations);
    
    topResults.forEach((result, i) => {
      if (distanceData[i].distance) {
        result.distance = distanceData[i].distance;
      }
      if (distanceData[i].duration) {
        result.duration = distanceData[i].duration;
      }
    });
    
    const maxDistance = 200000;
    const weightDistance = 0.5;
    const weightRating = 0.35;
    const weightEmergency = 0.15;
    
    mapped.forEach(result => {
      const distanceNorm = Math.min((result.distance?.value || 0) / maxDistance, 1);
      const ratingNorm = (result.rating || 0) / 5;
      
      const hasEmergency = filters.some(f => 
        f.toLowerCase().includes('emergency') || 
        f.toLowerCase().includes('24h')
      ) || result.types?.some(t => t.includes('emergency'));
      
      const score = 
        weightDistance * (1 - distanceNorm) +
        weightRating * ratingNorm +
        weightEmergency * (hasEmergency ? 1 : 0);
      
      result.score = score;
      result.recommendation = [];
      
      if (hasEmergency) {
        result.recommendation.push('Emergency');
      }
      
      if ((result.rating || 0) >= 4.5) {
        result.recommendation.push('Best Rated');
      }
    });
    
    mapped.sort((a, b) => (b.score || 0) - (a.score || 0));
    
    const top3 = mapped.slice(0, 3);
    top3.forEach(r => {
      if (!r.recommendation?.includes('Top Pick')) {
        r.recommendation = [...(r.recommendation || []), 'Top Pick'];
      }
    });
    
    mapped.sort((a, b) => (a.distance?.value || 0) - (b.distance?.value || 0));
    
    console.log(`[Completed] Returning ${mapped.length} results`);
    
    return {
      results: mapped,
      meta: {
        cached: false,
        source: 'google',
        fetched_at: Date.now()
      }
    };
    
  } catch (error) {
    console.error('[findNearbyFacilities] Error:', error);
    return {
      results: [],
      meta: {
        cached: false,
        source: 'google',
        fetched_at: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
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
