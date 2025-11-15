import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Beaker, Search } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";

interface LabTest {
  name: string;
  fullName: string;
  purpose: string;
  normalRange: string;
  symptoms: string[];
}

const labTests: LabTest[] = [
  {
    name: "CBC",
    fullName: "Complete Blood Count",
    purpose: "Measures red blood cells, white blood cells, hemoglobin, and platelets. Used to detect anemia, infection, blood disorders",
    normalRange: "WBC: 4,500-11,000/μL, Hemoglobin: 12-16 g/dL (women), 14-18 g/dL (men), Platelets: 150,000-400,000/μL",
    symptoms: ["fatigue", "weakness", "fever", "infection", "bleeding", "bruising", "anemia"]
  },
  {
    name: "LFT",
    fullName: "Liver Function Test",
    purpose: "Checks liver health by measuring enzymes, proteins, and bilirubin. Detects liver damage, hepatitis, cirrhosis",
    normalRange: "ALT: 7-56 U/L, AST: 10-40 U/L, Bilirubin: 0.1-1.2 mg/dL",
    symptoms: ["yellow skin", "yellow eyes", "jaundice", "abdominal pain", "dark urine", "fatigue", "nausea"]
  },
  {
    name: "RFT/KFT",
    fullName: "Renal/Kidney Function Test",
    purpose: "Evaluates kidney health by measuring creatinine, urea, and electrolytes. Detects kidney disease, dehydration",
    normalRange: "Creatinine: 0.7-1.3 mg/dL, Urea: 7-20 mg/dL",
    symptoms: ["swelling", "decreased urination", "blood in urine", "fatigue", "nausea", "high blood pressure"]
  },
  {
    name: "Thyroid Panel",
    fullName: "Thyroid Function Tests (TSH, T3, T4)",
    purpose: "Measures thyroid hormones to detect hypothyroidism or hyperthyroidism",
    normalRange: "TSH: 0.4-4.0 mIU/L, T3: 80-200 ng/dL, T4: 5-12 μg/dL",
    symptoms: ["weight gain", "weight loss", "fatigue", "hair loss", "cold intolerance", "heat intolerance", "anxiety"]
  },
  {
    name: "Lipid Profile",
    fullName: "Cholesterol and Triglycerides",
    purpose: "Measures cholesterol levels to assess heart disease risk",
    normalRange: "Total Cholesterol: <200 mg/dL, LDL: <100 mg/dL, HDL: >40 mg/dL, Triglycerides: <150 mg/dL",
    symptoms: ["chest pain", "family history of heart disease", "high blood pressure", "diabetes"]
  },
  {
    name: "Blood Glucose",
    fullName: "Fasting Blood Sugar / HbA1c",
    purpose: "Tests for diabetes and prediabetes by measuring blood sugar levels",
    normalRange: "Fasting: 70-100 mg/dL, HbA1c: <5.7%",
    symptoms: ["excessive thirst", "frequent urination", "weight loss", "fatigue", "blurred vision"]
  },
  {
    name: "Dengue Test",
    fullName: "Dengue NS1 Antigen / IgG/IgM",
    purpose: "Detects dengue fever infection",
    normalRange: "Negative for NS1, IgG, IgM",
    symptoms: ["high fever", "severe body pain", "eye pain", "rash", "low platelets", "bleeding"]
  },
  {
    name: "Malaria Test",
    fullName: "Malaria Parasite Test (MP) / Rapid Diagnostic Test",
    purpose: "Detects malaria parasites in blood",
    normalRange: "Negative",
    symptoms: ["fever with chills", "sweating", "body pain", "headache", "nausea"]
  },
  {
    name: "Typhoid Test",
    fullName: "Widal Test / Typhoid IgM/IgG",
    purpose: "Detects typhoid fever caused by Salmonella typhi",
    normalRange: "Negative",
    symptoms: ["continuous fever", "stomach pain", "vomiting", "weakness", "constipation"]
  },
  {
    name: "Chest X-Ray",
    fullName: "Chest Radiograph",
    purpose: "Images the chest to detect pneumonia, tuberculosis, lung infections, heart problems",
    normalRange: "Normal lung fields, normal heart size",
    symptoms: ["persistent cough", "chest pain", "difficulty breathing", "shortness of breath", "tuberculosis"]
  },
  {
    name: "Urine R/E",
    fullName: "Urine Routine Examination",
    purpose: "Detects urinary tract infections, kidney problems, diabetes",
    normalRange: "Clear, pH: 4.5-8.0, No protein, glucose, or blood",
    symptoms: ["burning urination", "frequent urination", "cloudy urine", "blood in urine", "abdominal pain"]
  },
  {
    name: "Hepatitis Panel",
    fullName: "Hepatitis A, B, C Tests",
    purpose: "Detects hepatitis virus infections",
    normalRange: "Negative for HBsAg, Anti-HCV",
    symptoms: ["yellow skin", "yellow eyes", "dark urine", "fatigue", "abdominal pain"]
  }
];

export default function LabTests() {
  const [, setLocation] = useLocation();
  const [symptoms, setSymptoms] = useState("");
  const [recommendedTests, setRecommendedTests] = useState<LabTest[]>([]);
  const [showResults, setShowResults] = useState(false);

  const analyzeSymptoms = () => {
    if (!symptoms.trim()) return;

    const input = symptoms.toLowerCase();
    const matched: LabTest[] = [];

    labTests.forEach(test => {
      const score = test.symptoms.filter(symptom => input.includes(symptom)).length;
      if (score > 0) {
        matched.push(test);
      }
    });

    matched.sort((a, b) => {
      const scoreA = a.symptoms.filter(s => input.includes(s)).length;
      const scoreB = b.symptoms.filter(s => input.includes(s)).length;
      return scoreB - scoreA;
    });

    setRecommendedTests(matched.slice(0, 5));
    setShowResults(true);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="p-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/dashboard")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground">Lab Test Advisor</h1>
            <p className="text-xs text-muted-foreground">Recommended tests based on symptoms</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Describe Your Symptoms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="e.g., fever, fatigue, yellow eyes, body pain..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && analyzeSymptoms()}
              data-testid="input-symptoms"
            />
            <Button onClick={analyzeSymptoms} className="w-full" data-testid="button-analyze">
              <Search className="w-4 h-4 mr-2" />
              Find Recommended Tests
            </Button>
          </CardContent>
        </Card>

        {showResults && recommendedTests.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Recommended Tests</h2>
            {recommendedTests.map((test, index) => (
              <Card key={index} data-testid={`test-card-${index}`}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Beaker className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{test.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{test.fullName}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">Purpose:</p>
                    <p className="text-sm text-muted-foreground">{test.purpose}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">Normal Range:</p>
                    <p className="text-sm text-muted-foreground">{test.normalRange}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-2">Detects symptoms like:</p>
                    <div className="flex flex-wrap gap-2">
                      {test.symptoms.map((symptom, i) => (
                        <Badge 
                          key={i} 
                          variant={symptoms.toLowerCase().includes(symptom) ? "default" : "outline"}
                        >
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {showResults && recommendedTests.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Beaker className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">
                No specific tests matched your symptoms. Please consult a doctor for proper evaluation.
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              ⚕️ <strong>Important:</strong> This is for informational purposes only. Always consult a qualified healthcare provider for proper diagnosis and treatment. Lab tests should be ordered by a doctor based on clinical evaluation.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
