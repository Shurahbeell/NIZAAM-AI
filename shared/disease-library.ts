export interface Disease {
  name: string;
  category: string;
  symptoms: string[];
  riskFactors: string[];
  complications: string[];
  treatments: string[];
  prevention: string[];
  whenToSeeDoctor: string;
}

export const diseaseLibrary: Disease[] = [
  {
    name: "Dengue Fever",
    category: "Viral Infection",
    symptoms: ["High fever (104°F)", "Severe headache", "Eye pain", "Severe body/joint pain", "Rash", "Bleeding (nose, gums)"],
    riskFactors: ["Mosquito bites (Aedes)", "Rainy season", "Stagnant water near home", "Urban areas"],
    complications: ["Dengue hemorrhagic fever", "Dengue shock syndrome", "Low platelet count", "Internal bleeding", "Organ failure"],
    treatments: ["Rest and fluids", "Paracetamol for fever (avoid aspirin/ibuprofen)", "Monitor platelet count", "Hospital admission if severe"],
    prevention: ["Use mosquito nets", "Apply mosquito repellent", "Eliminate stagnant water", "Wear long sleeves", "Use mosquito screens"],
    whenToSeeDoctor: "Immediately if severe abdominal pain, persistent vomiting, bleeding, difficulty breathing, or platelet count <100,000"
  },
  {
    name: "Malaria",
    category: "Parasitic Infection",
    symptoms: ["Fever with chills and sweating", "Headache", "Body pain", "Nausea and vomiting", "Fatigue"],
    riskFactors: ["Mosquito bites (Anopheles)", "Rural/jungle areas", "No mosquito protection", "Rainy season"],
    complications: ["Cerebral malaria", "Kidney failure", "Severe anemia", "Respiratory distress", "Death if untreated"],
    treatments: ["Antimalarial medications (Chloroquine, Artemisinin combinations)", "Hospitalization if severe", "Supportive care"],
    prevention: ["Use mosquito nets (especially at night)", "Take antimalarial prophylaxis if traveling", "Apply repellent", "Eliminate mosquito breeding sites"],
    whenToSeeDoctor: "Within 24-48 hours of fever if living in/traveling from malaria-endemic area"
  },
  {
    name: "Typhoid Fever",
    category: "Bacterial Infection",
    symptoms: ["Continuous fever (gradually increasing)", "Stomach pain", "Headache", "Weakness", "Loss of appetite", "Constipation or diarrhea"],
    riskFactors: ["Contaminated food/water", "Poor hygiene", "Lack of sanitation", "Crowded areas"],
    complications: ["Intestinal perforation", "Intestinal bleeding", "Peritonitis", "Sepsis"],
    treatments: ["Antibiotics (Azithromycin, Ciprofloxacin, Ceftriaxone)", "Hydration", "Rest", "Hospitalization if severe"],
    prevention: ["Typhoid vaccination", "Drink boiled/filtered water", "Eat hot, freshly cooked food", "Wash hands frequently", "Avoid street food"],
    whenToSeeDoctor: "If fever persists for more than 3 days or severe abdominal pain develops"
  },
  {
    name: "Hepatitis (A, B, C)",
    category: "Viral Infection (Liver)",
    symptoms: ["Jaundice (yellow skin/eyes)", "Dark urine", "Fatigue", "Abdominal pain", "Nausea", "Loss of appetite"],
    riskFactors: ["Contaminated food/water (Hep A)", "Unprotected sex (Hep B, C)", "Sharing needles", "Blood transfusion", "Poor hygiene"],
    complications: ["Chronic hepatitis", "Liver cirrhosis", "Liver cancer", "Liver failure"],
    treatments: ["Rest and hydration", "Antivirals (Hep B, C)", "Avoid alcohol", "Healthy diet", "Liver transplant (severe cases)"],
    prevention: ["Hepatitis A & B vaccination", "Boil drinking water", "Practice safe sex", "Avoid sharing needles/razors", "Screen blood transfusions"],
    whenToSeeDoctor: "Immediately if jaundice, dark urine, or severe abdominal pain develops"
  },
  {
    name: "Tuberculosis (TB)",
    category: "Bacterial Infection",
    symptoms: ["Persistent cough >3 weeks", "Coughing up blood", "Chest pain", "Weight loss", "Night sweats", "Fever", "Fatigue"],
    riskFactors: ["Close contact with TB patient", "Weak immune system (HIV, diabetes)", "Malnutrition", "Crowded living conditions", "Smoking"],
    complications: ["Spread to spine, brain, kidneys", "Lung damage", "Death if untreated"],
    treatments: ["Long-term antibiotics (6-9 months)", "Directly Observed Therapy (DOT)", "Isolation initially", "Nutritional support"],
    prevention: ["BCG vaccination", "Screen close contacts", "Improve ventilation", "Cover mouth when coughing", "Complete treatment to prevent drug resistance"],
    whenToSeeDoctor: "If cough persists >3 weeks, coughing blood, or unexplained weight loss"
  },
  {
    name: "Diabetes Mellitus (Type 2)",
    category: "Metabolic Disorder",
    symptoms: ["Excessive thirst", "Frequent urination", "Unexplained weight loss", "Fatigue", "Blurred vision", "Slow wound healing"],
    riskFactors: ["Obesity", "Family history", "Sedentary lifestyle", "Age >45", "High blood pressure", "Unhealthy diet"],
    complications: ["Heart disease", "Stroke", "Kidney failure", "Blindness", "Nerve damage", "Foot ulcers/amputation"],
    treatments: ["Lifestyle modification (diet, exercise)", "Metformin and other oral medications", "Insulin (if needed)", "Blood sugar monitoring"],
    prevention: ["Maintain healthy weight", "Regular exercise (30 min/day)", "Healthy diet (low sugar, high fiber)", "Avoid smoking", "Regular screening"],
    whenToSeeDoctor: "If excessive thirst, frequent urination, or blood sugar >200 mg/dL"
  },
  {
    name: "Hypertension (High Blood Pressure)",
    category: "Cardiovascular Disorder",
    symptoms: ["Usually no symptoms", "Headache (severe cases)", "Dizziness", "Blurred vision", "Nosebleeds"],
    riskFactors: ["Obesity", "High salt intake", "Lack of exercise", "Smoking", "Alcohol", "Stress", "Family history", "Age"],
    complications: ["Heart attack", "Stroke", "Heart failure", "Kidney disease", "Vision loss"],
    treatments: ["Lifestyle changes (diet, exercise, weight loss)", "Reduce salt", "Antihypertensive medications (Amlodipine, Losartan)", "Stress management"],
    prevention: ["Limit salt intake", "Regular exercise", "Maintain healthy weight", "Avoid smoking/alcohol", "Manage stress", "Regular BP monitoring"],
    whenToSeeDoctor: "If BP consistently >140/90 mmHg or symptoms of stroke/heart attack"
  },
  {
    name: "Asthma",
    category: "Respiratory Disorder",
    symptoms: ["Wheezing", "Shortness of breath", "Chest tightness", "Coughing (especially at night)"],
    riskFactors: ["Family history", "Allergies", "Respiratory infections in childhood", "Exposure to smoke/pollution", "Obesity"],
    complications: ["Severe asthma attack (status asthmaticus)", "Respiratory failure", "Permanent airway narrowing"],
    treatments: ["Inhalers (Salbutamol for relief, steroids for control)", "Avoid triggers", "Allergy medications", "Emergency medications"],
    prevention: ["Identify and avoid triggers", "Use air purifiers", "Get flu/pneumonia vaccines", "Manage allergies", "Regular check-ups"],
    whenToSeeDoctor: "Immediately if severe difficulty breathing, blue lips, or inhaler not helping"
  },
  {
    name: "Gastroenteritis (Stomach Flu)",
    category: "Gastrointestinal Infection",
    symptoms: ["Diarrhea", "Vomiting", "Stomach cramps", "Nausea", "Fever", "Dehydration"],
    riskFactors: ["Contaminated food/water", "Poor hand hygiene", "Close contact with infected person"],
    complications: ["Severe dehydration", "Electrolyte imbalance", "Kidney failure (in severe cases)"],
    treatments: ["Oral rehydration solution (ORS)", "Rest", "Bland diet (bananas, rice, toast)", "Avoid dairy temporarily", "Zinc supplements (children)"],
    prevention: ["Wash hands frequently", "Drink safe water", "Cook food properly", "Avoid street food", "Practice good hygiene"],
    whenToSeeDoctor: "If severe dehydration, blood in stool, vomiting >24 hours, or unable to keep fluids down"
  },
  {
    name: "Pneumonia",
    category: "Respiratory Infection",
    symptoms: ["Severe cough with phlegm", "High fever", "Difficulty breathing", "Chest pain", "Rapid breathing", "Confusion (elderly)"],
    riskFactors: ["Young children and elderly", "Weak immune system", "Chronic diseases", "Smoking", "Recent viral infection"],
    complications: ["Respiratory failure", "Sepsis", "Lung abscess", "Pleural effusion", "Death"],
    treatments: ["Antibiotics", "Hospitalization (severe cases)", "Oxygen therapy", "Rest and fluids", "Pain relievers"],
    prevention: ["Pneumonia vaccine", "Flu vaccine", "Stop smoking", "Good hygiene", "Treat respiratory infections promptly"],
    whenToSeeDoctor: "Immediately if severe difficulty breathing, high fever, chest pain, or confusion"
  },
  {
    name: "Urinary Tract Infection (UTI)",
    category: "Bacterial Infection",
    symptoms: ["Burning during urination", "Frequent urination", "Urgent need to urinate", "Cloudy/bloody urine", "Lower abdominal pain"],
    riskFactors: ["Women (shorter urethra)", "Sexual activity", "Poor hygiene", "Holding urine too long", "Diabetes", "Pregnancy"],
    complications: ["Kidney infection (pyelonephritis)", "Sepsis", "Recurrent infections", "Pregnancy complications"],
    treatments: ["Antibiotics (Ciprofloxacin, Nitrofurantoin)", "Drink plenty of water", "Urinary alkalizers", "Pain relievers"],
    prevention: ["Drink plenty of water", "Urinate after sex", "Wipe front to back", "Avoid holding urine", "Good hygiene", "Avoid irritants"],
    whenToSeeDoctor: "If fever, back pain, blood in urine, or symptoms persist >2 days"
  },
  {
    name: "Migraine",
    category: "Neurological Disorder",
    symptoms: ["Severe one-sided headache", "Throbbing pain", "Nausea/vomiting", "Sensitivity to light/sound", "Visual disturbances (aura)"],
    riskFactors: ["Family history", "Hormonal changes", "Stress", "Certain foods (cheese, chocolate)", "Lack of sleep", "Alcohol"],
    complications: ["Chronic migraine", "Medication overuse headache", "Stroke (rare)"],
    treatments: ["Pain relievers (NSAIDs, Paracetamol)", "Triptans", "Anti-nausea medications", "Rest in dark, quiet room", "Preventive medications"],
    prevention: ["Identify triggers and avoid them", "Regular sleep schedule", "Stress management", "Stay hydrated", "Regular meals", "Exercise"],
    whenToSeeDoctor: "If sudden severe headache, fever with headache, vision changes, or headache after head injury"
  },
  {
    name: "COVID-19",
    category: "Viral Infection",
    symptoms: ["Fever", "Dry cough", "Shortness of breath", "Fatigue", "Loss of smell/taste", "Body aches"],
    riskFactors: ["Close contact with infected person", "Crowded indoor spaces", "Elderly age", "Chronic diseases (diabetes, heart disease)", "Weak immune system"],
    complications: ["Pneumonia", "Acute respiratory distress", "Organ failure", "Blood clots", "Long COVID", "Death"],
    treatments: ["Rest and isolation", "Hydration", "Oxygen therapy (severe cases)", "Antivirals (Paxlovid)", "Steroids (severe cases)", "Hospital care if needed"],
    prevention: ["Vaccination (primary and boosters)", "Wear masks in crowded places", "Hand hygiene", "Social distancing", "Avoid touching face", "Ventilation"],
    whenToSeeDoctor: "Immediately if difficulty breathing, persistent chest pain, confusion, blue lips, or oxygen saturation <94%"
  },
  {
    name: "Chronic Kidney Disease (CKD)",
    category: "Kidney Disorder",
    symptoms: ["Fatigue", "Swelling (feet, ankles)", "Decreased urination", "Nausea", "Loss of appetite", "High blood pressure"],
    riskFactors: ["Diabetes", "Hypertension", "Family history", "Age >60", "Obesity", "Smoking", "Prolonged NSAID use"],
    complications: ["Kidney failure", "Cardiovascular disease", "Anemia", "Bone disease", "Electrolyte imbalances"],
    treatments: ["Blood pressure control", "Diabetes management", "Low-protein diet", "Phosphate binders", "Erythropoietin for anemia", "Dialysis/transplant (advanced stages)"],
    prevention: ["Control blood pressure and diabetes", "Healthy diet (low salt, protein)", "Avoid NSAIDs long-term", "Regular check-ups", "Stay hydrated", "Don't smoke"],
    whenToSeeDoctor: "If swelling, decreased urination, blood in urine, or persistent fatigue with nausea"
  }
];
