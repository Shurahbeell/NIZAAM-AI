export interface Medicine {
  name: string;
  genericName: string;
  category: string;
  usage: string;
  dosage: string;
  sideEffects: string[];
  interactions: string[];
  contraindications: string[];
  precautions: string;
}

export const medicineLibrary: Medicine[] = [
  {
    name: "Panadol / Paracetamol",
    genericName: "Acetaminophen",
    category: "Analgesic / Antipyretic",
    usage: "Relieves pain (headache, body pain, toothache) and reduces fever",
    dosage: "Adults: 500-1000mg every 4-6 hours. Max: 4000mg/day. Children: Consult doctor",
    sideEffects: ["Rare: Nausea", "Skin rash", "Liver damage (overdose)"],
    interactions: ["Alcohol (increases liver toxicity)", "Warfarin (blood thinner)"],
    contraindications: ["Severe liver disease", "Alcohol dependence"],
    precautions: "Do not exceed recommended dose. Overdose can cause severe liver damage"
  },
  {
    name: "Brufen / Ibuprofen",
    genericName: "Ibuprofen",
    category: "NSAID (Non-Steroidal Anti-Inflammatory Drug)",
    usage: "Relieves pain, reduces inflammation and fever",
    dosage: "Adults: 200-400mg every 4-6 hours. Max: 1200mg/day. Take with food",
    sideEffects: ["Stomach upset", "Nausea", "Heartburn", "Stomach ulcers"],
    interactions: ["Aspirin", "Blood thinners (Warfarin)", "Blood pressure medications"],
    contraindications: ["Stomach ulcers", "Kidney disease", "Heart disease", "Pregnancy (3rd trimester)"],
    precautions: "Take with food or milk. Do not use long-term without medical supervision"
  },
  {
    name: "Disprin / Aspirin",
    genericName: "Acetylsalicylic Acid",
    category: "NSAID / Antiplatelet",
    usage: "Relieves pain, reduces fever, prevents blood clots (heart attack/stroke prevention)",
    dosage: "Pain: 300-600mg every 4-6 hours. Heart protection: 75-100mg daily",
    sideEffects: ["Stomach upset", "Bleeding risk", "Ulcers"],
    interactions: ["Warfarin", "Other NSAIDs", "Alcohol"],
    contraindications: ["Children under 16 (Reye's syndrome risk)", "Bleeding disorders", "Stomach ulcers"],
    precautions: "Do not give to children/teenagers with viral infections. Increases bleeding risk"
  },
  {
    name: "Flagyl / Metronidazole",
    genericName: "Metronidazole",
    category: "Antibiotic / Antiprotozoal",
    usage: "Treats bacterial infections (stomach, intestines, skin, dental) and parasites (amoeba, giardia)",
    dosage: "Adults: 400-500mg twice or thrice daily for 5-10 days",
    sideEffects: ["Metallic taste", "Nausea", "Dark urine", "Dizziness"],
    interactions: ["Alcohol (severe reaction)", "Warfarin", "Lithium"],
    contraindications: ["First trimester of pregnancy", "Alcohol consumption"],
    precautions: "Avoid alcohol during treatment and for 48 hours after. Complete full course"
  },
  {
    name: "Augmentin / Co-Amoxiclav",
    genericName: "Amoxicillin + Clavulanic Acid",
    category: "Antibiotic (Penicillin)",
    usage: "Treats bacterial infections (respiratory, urinary, skin, ear, sinus)",
    dosage: "Adults: 625mg three times daily or 1000mg twice daily. Take with food",
    sideEffects: ["Diarrhea", "Nausea", "Skin rash", "Vaginal yeast infection"],
    interactions: ["Oral contraceptives (reduces effectiveness)", "Warfarin"],
    contraindications: ["Penicillin allergy", "Severe kidney disease"],
    precautions: "Complete full course even if feeling better. Report severe diarrhea immediately"
  },
  {
    name: "Arinac / Pseudoephedrine + Chlorpheniramine",
    genericName: "Pseudoephedrine + Chlorpheniramine",
    category: "Decongestant + Antihistamine",
    usage: "Relieves cold and flu symptoms (runny nose, congestion, sneezing)",
    dosage: "Adults: 1 tablet every 4-6 hours. Max: 4 tablets/day",
    sideEffects: ["Drowsiness", "Dry mouth", "Dizziness", "Insomnia"],
    interactions: ["MAO inhibitors", "Blood pressure medications", "Sedatives"],
    contraindications: ["Severe hypertension", "Heart disease", "Glaucoma"],
    precautions: "May cause drowsiness - do not drive. Avoid alcohol"
  },
  {
    name: "Omeprazole / Omez",
    genericName: "Omeprazole",
    category: "Proton Pump Inhibitor (PPI)",
    usage: "Reduces stomach acid. Treats heartburn, GERD, stomach ulcers",
    dosage: "Adults: 20-40mg once daily before breakfast",
    sideEffects: ["Headache", "Diarrhea", "Nausea", "Abdominal pain"],
    interactions: ["Clopidogrel", "Warfarin", "Antifungals"],
    contraindications: ["Severe liver disease"],
    precautions: "Long-term use may reduce calcium/magnesium absorption. Take before meals"
  },
  {
    name: "Cetirizine / Zyrtec",
    genericName: "Cetirizine",
    category: "Antihistamine",
    usage: "Relieves allergy symptoms (sneezing, runny nose, itchy eyes, skin rash)",
    dosage: "Adults: 10mg once daily",
    sideEffects: ["Drowsiness", "Dry mouth", "Headache", "Fatigue"],
    interactions: ["Alcohol", "Sedatives"],
    contraindications: ["Severe kidney disease"],
    precautions: "May cause drowsiness in some people. Use caution when driving"
  },
  {
    name: "Metformin / Glucophage",
    genericName: "Metformin",
    category: "Antidiabetic (Biguanide)",
    usage: "Controls blood sugar in Type 2 diabetes",
    dosage: "Adults: Start 500mg twice daily with meals. Max: 2000-2500mg/day",
    sideEffects: ["Diarrhea", "Nausea", "Abdominal pain", "Metallic taste", "Vitamin B12 deficiency"],
    interactions: ["Alcohol", "Contrast dyes (stop before CT scans)", "Diuretics"],
    contraindications: ["Kidney disease", "Liver disease", "Heart failure", "Alcoholism"],
    precautions: "Take with food. Monitor kidney function regularly. Avoid excessive alcohol"
  },
  {
    name: "Amlodipine / Norvasc",
    genericName: "Amlodipine",
    category: "Calcium Channel Blocker",
    usage: "Treats high blood pressure and angina (chest pain)",
    dosage: "Adults: 5-10mg once daily",
    sideEffects: ["Ankle swelling", "Headache", "Dizziness", "Flushing", "Fatigue"],
    interactions: ["Simvastatin", "Grapefruit juice", "Other blood pressure medications"],
    contraindications: ["Severe low blood pressure", "Severe aortic stenosis"],
    precautions: "Rise slowly from sitting/lying position. Monitor blood pressure regularly"
  },
  {
    name: "Salbutamol / Ventolin",
    genericName: "Salbutamol / Albuterol",
    category: "Bronchodilator (Beta-2 Agonist)",
    usage: "Relieves asthma and breathing problems (wheezing, shortness of breath)",
    dosage: "Inhaler: 1-2 puffs as needed. Max: 4 times daily",
    sideEffects: ["Tremor", "Increased heart rate", "Headache", "Nervousness"],
    interactions: ["Beta-blockers", "Diuretics"],
    contraindications: ["Severe heart disease"],
    precautions: "Rinse mouth after use. Seek help if using more frequently than prescribed"
  },
  {
    name: "Losartan / Cozaar",
    genericName: "Losartan",
    category: "Angiotensin Receptor Blocker (ARB)",
    usage: "Treats high blood pressure and protects kidneys in diabetes",
    dosage: "Adults: 50-100mg once daily",
    sideEffects: ["Dizziness", "Headache", "Fatigue", "High potassium"],
    interactions: ["Potassium supplements", "NSAIDs", "Lithium"],
    contraindications: ["Pregnancy", "Severe kidney disease"],
    precautions: "Avoid potassium supplements. Monitor blood pressure and kidney function"
  },
  {
    name: "Ciprofloxacin / Cipro",
    genericName: "Ciprofloxacin",
    category: "Antibiotic (Fluoroquinolone)",
    usage: "Treats bacterial infections (urinary tract, respiratory, skin, bone, joint)",
    dosage: "Adults: 250-750mg twice daily depending on infection. Take with plenty of water",
    sideEffects: ["Nausea", "Diarrhea", "Dizziness", "Tendon rupture risk", "Sun sensitivity"],
    interactions: ["Antacids", "Iron/zinc supplements", "Dairy products", "Warfarin"],
    contraindications: ["Children/teenagers (affects bone growth)", "Pregnancy", "Tendon problems history"],
    precautions: "Avoid sunlight. Stop immediately if tendon pain occurs. Stay well hydrated"
  },
  {
    name: "Atorvastatin / Lipitor",
    genericName: "Atorvastatin",
    category: "Statin (Cholesterol-lowering)",
    usage: "Lowers cholesterol and reduces risk of heart attack and stroke",
    dosage: "Adults: 10-80mg once daily at bedtime",
    sideEffects: ["Muscle pain", "Headache", "Nausea", "Liver enzyme elevation"],
    interactions: ["Grapefruit juice", "Some antibiotics", "Antifungals"],
    contraindications: ["Pregnancy", "Breastfeeding", "Active liver disease"],
    precautions: "Avoid grapefruit juice. Report unexplained muscle pain. Monitor liver function"
  }
];
