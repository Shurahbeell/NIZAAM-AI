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

function mapNewPlaceToLegacy(p: any): GooglePlace {
  return {
    name: p.displayName?.text || '',
    vicinity: p.formattedAddress || '',
    formatted_address: p.formattedAddress || '',
    geometry: {
      location: {
        lat: p.location?.latitude || 0,
        lng: p.location?.longitude || 0
      }
    },
    rating: p.rating,
    place_id: p.id || '',
    user_ratings_total: p.userRatingCount,
    types: p.types || [],
    photos: p.photos?.map((ph: any) => ({ photo_reference: ph.name })) || [],
    formatted_phone_number: p.nationalPhoneNumber,
    opening_hours: p.regularOpeningHours
  };
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

const PLACES_NEW_API = 'https://places.googleapis.com/v1/places:searchNearby';
const PLACES_FIELD_MASK = 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.types,places.photos,places.nationalPhoneNumber,places.regularOpeningHours,places.primaryType';

async function fetchPlacesNearby(
  lat: number,
  lng: number,
  radius?: number,
  rankBy?: 'distance'
): Promise<{ results: GooglePlace[] }> {
  try {
    const body: any = {
      includedTypes: ['hospital', 'medical_center'],
      maxResultCount: 20,
      rankPreference: 'DISTANCE'
    };

    if (rankBy === 'distance') {
      body.locationBias = {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: 50000.0
        }
      };
    } else {
      body.locationRestriction = {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: radius || 5000
        }
      };
    }

    const response = await axios.post(PLACES_NEW_API, body, {
      headers: {
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': PLACES_FIELD_MASK,
        'Content-Type': 'application/json'
      }
    });

    const places: any[] = response.data.places || [];
    return { results: places.map(mapNewPlaceToLegacy) };
  } catch (error: any) {
    console.error('[Places API New] Error:', error.response?.data?.error?.message || error.message);
    return { results: [] };
  }
}

async function fetchPlaceDetails(placeId: string): Promise<Partial<GooglePlace> | null> {
  try {
    const response = await axios.get(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        headers: {
          'X-Goog-Api-Key': GOOGLE_API_KEY,
          'X-Goog-FieldMask': 'nationalPhoneNumber,regularOpeningHours,photos'
        }
      }
    );
    const p = response.data;
    return {
      formatted_phone_number: p.nationalPhoneNumber,
      opening_hours: p.regularOpeningHours,
      photos: p.photos?.map((ph: any) => ({ photo_reference: ph.name })) || []
    };
  } catch (error: any) {
    console.error('[fetchPlaceDetails New] Error:', error.response?.data?.error?.message || error.message);
    return null;
  }
}

function fetchDistanceMatrix(
  origin: { lat: number; lng: number },
  destinations: Array<{ lat: number; lng: number }>
): Array<{ distance?: { text: string; value: number }; duration?: { text: string; value: number } }> {
  return destinations.map(dest => {
    const distM = calculateDistance(origin.lat, origin.lng, dest.lat, dest.lng);
    const distKm = distM / 1000;
    const speedKmH = 40;
    const durationMin = Math.round((distKm / speedKmH) * 60);
    return {
      distance: { text: `${distKm.toFixed(1)} km`, value: Math.round(distM) },
      duration: { text: `${durationMin} min`, value: durationMin * 60 }
    };
  });
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
    
    console.log('[Zone 1] Fetching by distance...');
    const zone1 = await fetchPlacesNearby(lat, lng, undefined, 'distance');
    zone1.results.forEach(r => {
      if (r.place_id && !seenPlaceIds.has(r.place_id)) {
        allResults.push(r);
        seenPlaceIds.add(r.place_id);
      }
    });
    console.log(`[Zone 1 Loaded] Found ${allResults.length} results`);

    const radii = [5000, 20000, 50000, 100000, 200000];
    for (const radius of radii) {
      if (allResults.length >= limit) break;
      console.log(`[Zone ${radius/1000}km] Fetching...`);
      await sleep(300);
      const radiusResponse = await fetchPlacesNearby(lat, lng, radius);
      radiusResponse.results.forEach(r => {
        if (r.place_id && !seenPlaceIds.has(r.place_id) && allResults.length < limit) {
          allResults.push(r);
          seenPlaceIds.add(r.place_id);
        }
      });
      console.log(`[Zone ${radius/1000}km Loaded] Total: ${allResults.length}`);
      if (allResults.length >= 10) break;
    }

    // Filter out non-hospital places (pharmacies, vets, etc.)
    const blockedKeywords = [
      "pet", "vet", "veterinary", "animal", "pharmacy", "chemist",
      "drug store", "dentist", "dental", "salon", "beauty", "barber",
      "acupuncture", "massage", "spa", "store", "shop", "dawaakhana"
    ];

    console.log(`[Filter] Starting filter on ${allResults.length} total results...`);
    allResults = allResults.filter(place => {
      const nameLC = place.name.toLowerCase();
      for (const kw of blockedKeywords) {
        if (nameLC.includes(kw)) {
          console.log(`[Filter] REJECTING "${place.name}" - keyword: "${kw}"`);
          return false;
        }
      }
      // Accept anything tagged as hospital or medical_center by Google
      const hasHospitalType = place.types?.some(t =>
        t === 'hospital' || t === 'medical_center'
      );
      if (hasHospitalType) return true;
      // Also accept by name clues
      if (nameLC.includes('hospital') || nameLC.includes('medical') ||
          nameLC.includes('clinic') || nameLC.includes('health') ||
          nameLC.includes('centre') || nameLC.includes('center')) {
        return true;
      }
      console.log(`[Filter] REJECTING "${place.name}" - not clearly a medical facility`);
      return false;
    });

    console.log(`[Filter COMPLETE] ${allResults.length} results remain after filtering`);
    
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
    const distanceData = fetchDistanceMatrix({ lat, lng }, destinations);
    
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
