export interface Disease {
  name: string;
  symptoms: string[];
}

export interface TriageResponse {
  severity: "mild" | "moderate" | "severe" | "emergency";
  possible_causes: { disease: string; match_percentage: number }[];
  red_flags: string[];
  follow_up_questions: string[];
  advice: string;
  recommendation: string;
}

export const diseases: Disease[] = [
  {
    name: "Flu / Viral Infection",
    symptoms: ["fever", "cough", "sore throat", "body pain", "runny nose", "fatigue"]
  },
  {
    name: "COVID-19",
    symptoms: ["fever", "dry cough", "shortness of breath", "loss of smell", "loss of taste", "fatigue"]
  },
  {
    name: "Dengue",
    symptoms: ["high fever", "severe body pain", "eye pain", "rash", "low platelets", "headache"]
  },
  {
    name: "Malaria",
    symptoms: ["fever", "chills", "sweating", "body pain", "headache"]
  },
  {
    name: "Typhoid",
    symptoms: ["continuous fever", "stomach pain", "vomiting", "weakness"]
  },
  {
    name: "Pneumonia",
    symptoms: ["severe cough", "difficulty breathing", "chest pain", "high fever"]
  },
  {
    name: "Asthma Attack",
    symptoms: ["wheezing", "shortness of breath", "chest tightness"]
  },
  {
    name: "Heart Attack",
    symptoms: ["chest pain", "arm pain", "jaw pain", "sweating", "nausea"]
  },
  {
    name: "Stroke",
    symptoms: ["face drooping", "arm weakness", "slurred speech", "confusion"]
  },
  {
    name: "Hepatitis",
    symptoms: ["yellow eyes", "yellow skin", "dark urine", "fatigue", "abdominal pain"]
  },
  {
    name: "Gastroenteritis",
    symptoms: ["vomiting", "diarrhea", "stomach cramps", "nausea"]
  },
  {
    name: "Migraine",
    symptoms: ["headache", "light sensitivity", "nausea", "one sided pain"]
  },
  {
    name: "UTI (Urinary Tract Infection)",
    symptoms: ["burning urination", "frequent urination", "lower stomach pain", "cloudy urine"]
  },
  {
    name: "Kidney Stone",
    symptoms: ["sharp lower back pain", "blood in urine", "vomiting", "severe pain"]
  },
  {
    name: "Diabetes Symptoms",
    symptoms: ["excessive thirst", "frequent urination", "weight loss", "fatigue"]
  },
  {
    name: "Hypertension",
    symptoms: ["headache", "nosebleed", "dizziness", "blurred vision"]
  },
  {
    name: "Allergies",
    symptoms: ["sneezing", "itchy eyes", "runny nose", "skin rash"]
  },
  {
    name: "Anemia",
    symptoms: ["fatigue", "pale skin", "dizziness", "weakness"]
  },
  {
    name: "Appendicitis",
    symptoms: ["severe right side abdominal pain", "fever", "nausea", "vomiting"]
  },
  {
    name: "Measles",
    symptoms: ["fever", "rash", "cough", "runny nose", "red eyes"]
  }
];

const emergencySymptoms = [
  "unconscious", "unconsciousness", "chest pain", "heart attack", "stroke", 
  "face drooping", "arm weakness", "slurred speech", "severe bleeding", 
  "can't breathe", "unable to breathe", "oxygen"
];

const severeSymptoms = [
  "shortness of breath", "difficulty breathing", "severe pain", "fainting", 
  "severe dehydration", "high fever 3 days", "blood in", "severe bleeding"
];

const moderateSymptoms = [
  "high fever", "persistent vomiting", "severe cough", "rash", 
  "moderate breathing difficulty", "diarrhea"
];

export function analyzeSymptoms(userInput: string): TriageResponse {
  const input = userInput.toLowerCase();
  
  // Check for emergency symptoms
  if (emergencySymptoms.some(s => input.includes(s))) {
    return {
      severity: "emergency",
      possible_causes: [
        { disease: input.includes("chest pain") || input.includes("heart") ? "Heart Attack" : "Stroke", match_percentage: 85 }
      ],
      red_flags: ["IMMEDIATE EMERGENCY - Call ambulance or go to ER now"],
      follow_up_questions: [],
      advice: "⚠️ THIS IS AN EMERGENCY. This is not medical advice — seek immediate emergency care.",
      recommendation: "🚨 GO TO EMERGENCY ROOM IMMEDIATELY or call ambulance (115 / 1122)"
    };
  }
  
  // Match symptoms to diseases
  const matches: { disease: string; match_percentage: number }[] = [];
  
  diseases.forEach(disease => {
    let matchCount = 0;
    disease.symptoms.forEach(symptom => {
      if (input.includes(symptom)) {
        matchCount++;
      }
    });
    
    if (matchCount > 0) {
      const percentage = Math.round((matchCount / disease.symptoms.length) * 100);
      matches.push({ disease: disease.name, match_percentage: percentage });
    }
  });
  
  // Sort by match percentage
  matches.sort((a, b) => b.match_percentage - a.match_percentage);
  const topMatches = matches.slice(0, 3);
  
  // Determine severity
  let severity: "mild" | "moderate" | "severe" | "emergency" = "mild";
  
  if (severeSymptoms.some(s => input.includes(s))) {
    severity = "severe";
  } else if (moderateSymptoms.some(s => input.includes(s))) {
    severity = "moderate";
  }
  
  // Generate red flags
  const redFlags: string[] = [];
  if (input.includes("fever") && (input.includes("3 days") || input.includes("three days"))) {
    redFlags.push("High fever for more than 3 days");
  }
  if (input.includes("shortness of breath") || input.includes("difficulty breathing")) {
    redFlags.push("Breathing difficulties - seek medical attention");
  }
  if (input.includes("chest pain")) {
    redFlags.push("Chest pain - possible cardiac issue");
  }
  if (input.includes("severe pain")) {
    redFlags.push("Severe pain requires immediate evaluation");
  }
  
  // Generate follow-up questions
  const followUpQuestions = generateFollowUpQuestions(input);
  
  // Generate recommendation
  let recommendation = "";
  if (severity === "severe") {
    recommendation = "⚠️ Visit doctor/hospital TODAY - this requires urgent medical attention";
  } else if (severity === "moderate") {
    recommendation = "📋 Schedule doctor appointment within 24-48 hours";
  } else {
    recommendation = "🏠 Self-care at home, monitor symptoms. Visit doctor if symptoms worsen or persist beyond 3 days";
  }
  
  return {
    severity,
    possible_causes: topMatches.length > 0 ? topMatches : [{ disease: "Unable to match - need more information", match_percentage: 0 }],
    red_flags: redFlags.length > 0 ? redFlags : ["No immediate red flags identified"],
    follow_up_questions: followUpQuestions,
    advice: "⚕️ This is not medical advice — please consult a doctor for proper diagnosis.",
    recommendation
  };
}

function generateFollowUpQuestions(input: string): string[] {
  const questions: string[] = [];
  
  if (input.includes("fever")) {
    questions.push("How many days have you had the fever?");
    questions.push("What is your highest recorded temperature?");
    questions.push("Do you have any rash along with the fever?");
  }
  
  if (input.includes("stomach") || input.includes("vomit") || input.includes("diarrhea")) {
    questions.push("Are you able to drink water and keep it down?");
    questions.push("Have you noticed any blood in stool or vomit?");
    questions.push("When did the symptoms start?");
  }
  
  if (input.includes("breath") || input.includes("cough")) {
    questions.push("Do you have any wheezing sounds when breathing?");
    questions.push("Is there chest tightness?");
    questions.push("Do you have a history of asthma?");
  }
  
  if (input.includes("headache") || input.includes("head pain")) {
    questions.push("Is the pain on one side or across your whole head?");
    questions.push("Are you sensitive to light or sound?");
    questions.push("Do you have any neck stiffness?");
  }
  
  if (input.includes("child") || input.includes("baby") || input.includes("kid")) {
    questions.push("What is the child's age?");
    questions.push("Is the child's vaccination status up to date?");
    questions.push("Is the child able to drink fluids and eat?");
  }
  
  if (questions.length === 0) {
    questions.push("Can you describe your symptoms in more detail?");
    questions.push("When did the symptoms start?");
    questions.push("Have the symptoms gotten worse or better?");
  }
  
  return questions.slice(0, 5);
}

export const SYMPTOM_TRIAGE_SYSTEM_PROMPT = `You are a medical triage assistant. Help users understand their symptoms and guide them to appropriate care.

SAFETY RULES:
• You are NOT a doctor
• Never diagnose - only provide possible causes
• Always include: "This is not medical advice — please consult a doctor"
• Only suggest OTC medications that are generally safe (e.g., Panadol for fever)
• Never give exact dosages

CAPABILITIES:
1. Symptom recognition
2. Disease matching
3. Severity scoring (Mild / Moderate / Severe / Emergency)
4. Follow-up questioning
5. Risk flagging

Always use bullet points and simple language.`;
