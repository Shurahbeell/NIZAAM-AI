import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Heart, Calendar, AlertTriangle, Baby, Search, Bell, Stethoscope, BookOpen, Activity } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PeriodEntry {
  startDate: string;
  endDate?: string;
  flow: "light" | "normal" | "heavy";
}

interface AwarenessTopic {
  id: string;
  topic: string;
  title: string;
  description: string;
  riskFactors: string[];
  preventionTips: string[];
  resources: string[];
  icon: any;
  color: string;
}

interface ScreeningReminder {
  id: string;
  topic: string;
  reminderType: string;
  nextDueDate: string;
  frequency: string;
  isEnabled: boolean;
}

interface SymptomCheckResult {
  riskLevel: "low" | "medium" | "high";
  recommendation: string;
  redFlags: string[];
  advice: string;
}

const awarenessTopics: AwarenessTopic[] = [
  {
    id: "1",
    topic: "breast-cancer",
    title: "Breast Cancer Awareness",
    description: "Breast cancer is one of the most common cancers affecting women worldwide. Early detection through regular screening and self-examination can significantly improve treatment outcomes.",
    riskFactors: [
      "Age (over 50 years)",
      "Family history of breast cancer",
      "Personal history of breast conditions",
      "Early menstruation (before 12) or late menopause",
      "Never having children or late pregnancy",
      "Obesity and sedentary lifestyle",
      "Hormone replacement therapy"
    ],
    preventionTips: [
      "Perform monthly breast self-examinations",
      "Get regular mammograms (age 40+)",
      "Maintain healthy weight through diet and exercise",
      "Limit alcohol consumption",
      "Breastfeed if possible",
      "Avoid prolonged hormone therapy",
      "Know your family history"
    ],
    resources: [
      "Pakistan Cancer Society - Breast Cancer Awareness",
      "Shaukat Khanum Memorial Cancer Hospital",
      "World Health Organization - Breast Cancer"
    ],
    icon: Heart,
    color: "pink"
  },
  {
    id: "2",
    topic: "cervical-cancer",
    title: "Cervical Cancer Prevention",
    description: "Cervical cancer is preventable through HPV vaccination and regular Pap smear screening. Most cases are caused by Human Papillomavirus (HPV) infection.",
    riskFactors: [
      "HPV infection",
      "Multiple sexual partners",
      "Early sexual activity",
      "Weakened immune system",
      "Smoking",
      "Long-term use of contraceptive pills"
    ],
    preventionTips: [
      "Get HPV vaccination (ages 9-26)",
      "Regular Pap smear tests (every 3 years for ages 21-65)",
      "Practice safe sex",
      "Quit smoking",
      "Maintain healthy immune system"
    ],
    resources: [
      "Pakistan Medical Association - Cervical Cancer Prevention",
      "WHO HPV Vaccination Program",
      "Ministry of Health Pakistan"
    ],
    icon: Activity,
    color: "purple"
  },
  {
    id: "3",
    topic: "maternal-health",
    title: "Pregnancy & Maternal Health",
    description: "Proper prenatal care and awareness of warning signs can ensure a healthy pregnancy and safe delivery for both mother and baby.",
    riskFactors: [
      "Age under 18 or over 35",
      "Pre-existing conditions (diabetes, hypertension)",
      "Previous pregnancy complications",
      "Multiple pregnancies (twins/triplets)",
      "Obesity or being underweight",
      "Smoking or substance use"
    ],
    preventionTips: [
      "Attend all antenatal checkups",
      "Take prenatal vitamins (folic acid, iron)",
      "Eat nutritious diet",
      "Get recommended vaccinations",
      "Avoid alcohol, smoking, and drugs",
      "Manage stress and get adequate rest",
      "Monitor fetal movements"
    ],
    resources: [
      "Lady Health Workers Program Pakistan",
      "UNICEF Pakistan - Maternal Health",
      "Ministry of Health - Mother & Child Care"
    ],
    icon: Baby,
    color: "blue"
  },
  {
    id: "4",
    topic: "menstrual-health",
    title: "Menstrual Health & Hygiene",
    description: "Understanding normal menstrual cycles and recognizing abnormal patterns is crucial for reproductive health.",
    riskFactors: [
      "Irregular periods (PCOS)",
      "Very heavy or prolonged bleeding",
      "Severe menstrual pain",
      "Missed periods (not pregnant)",
      "Bleeding between periods",
      "Hormonal imbalances"
    ],
    preventionTips: [
      "Track your menstrual cycle",
      "Maintain good menstrual hygiene",
      "Eat iron-rich foods",
      "Exercise regularly",
      "Manage stress",
      "Consult doctor for irregularities",
      "Use clean menstrual products"
    ],
    resources: [
      "Pakistan Society of Obstetricians & Gynecologists",
      "Menstrual Hygiene Day Pakistan",
      "UNICEF - Menstrual Health"
    ],
    icon: Calendar,
    color: "red"
  },
  {
    id: "5",
    topic: "reproductive-health",
    title: "Reproductive Health & STI Prevention",
    description: "Sexual and reproductive health includes prevention of sexually transmitted infections and family planning.",
    riskFactors: [
      "Unprotected sexual activity",
      "Multiple sexual partners",
      "History of STIs",
      "Drug use",
      "Lack of awareness"
    ],
    preventionTips: [
      "Practice safe sex",
      "Get regular STI screenings",
      "Use family planning methods",
      "Get vaccinated (HPV, Hepatitis B)",
      "Maintain open communication with healthcare provider",
      "Know your partner's health status"
    ],
    resources: [
      "Family Planning Association of Pakistan",
      "National AIDS Control Program",
      "WHO - Sexual & Reproductive Health"
    ],
    icon: Stethoscope,
    color: "green"
  },
  {
    id: "6",
    topic: "general-health",
    title: "General Preventive Health",
    description: "Overall wellness through nutrition, exercise, and mental health awareness is fundamental to women's health.",
    riskFactors: [
      "Sedentary lifestyle",
      "Poor nutrition",
      "Chronic stress",
      "Sleep deprivation",
      "Social isolation"
    ],
    preventionTips: [
      "Exercise 30 minutes daily",
      "Eat balanced diet (fruits, vegetables, whole grains)",
      "Get 7-8 hours of sleep",
      "Practice stress management",
      "Stay socially connected",
      "Regular health checkups",
      "Maintain healthy weight"
    ],
    resources: [
      "Pakistan Medical Association",
      "WHO Pakistan - Healthy Living",
      "Ministry of Health - Wellness Programs"
    ],
    icon: BookOpen,
    color: "orange"
  }
];

export default function WomensHealth() {
  const [, setLocation] = useLocation();
  const [periodEntries, setPeriodEntries] = useState<PeriodEntry[]>([]);
  const [lastPeriodDate, setLastPeriodDate] = useState("");
  const [isPregnant, setIsPregnant] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<AwarenessTopic | null>(null);
  const [reminders, setReminders] = useState<ScreeningReminder[]>([]);
  const [symptomInput, setSymptomInput] = useState("");
  const [symptomResult, setSymptomResult] = useState<SymptomCheckResult | null>(null);

  useEffect(() => {
    const storedPeriods = localStorage.getItem("periodEntries");
    if (storedPeriods) {
      setPeriodEntries(JSON.parse(storedPeriods));
    }
    
    const storedPregnancy = localStorage.getItem("pregnancyInfo");
    if (storedPregnancy) {
      const info = JSON.parse(storedPregnancy);
      setIsPregnant(info.isPregnant);
      setDueDate(info.dueDate);
    }

    const storedReminders = localStorage.getItem("screeningReminders");
    if (storedReminders) {
      setReminders(JSON.parse(storedReminders));
    }
  }, []);

  const calculateNextPeriod = () => {
    if (periodEntries.length === 0) return null;
    const lastEntry = periodEntries[0];
    const lastDate = new Date(lastEntry.startDate);
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + 28);
    return nextDate;
  };

  const calculatePregnancyWeek = () => {
    if (!dueDate) return 0;
    const due = new Date(dueDate);
    const today = new Date();
    const conceptionDate = new Date(due);
    conceptionDate.setDate(conceptionDate.getDate() - 280);
    const diffTime = Math.abs(today.getTime() - conceptionDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7);
  };

  const savePeriod = () => {
    if (!lastPeriodDate) return;
    
    const newEntry: PeriodEntry = {
      startDate: lastPeriodDate,
      flow: "normal"
    };
    
    const updated = [newEntry, ...periodEntries].slice(0, 12);
    setPeriodEntries(updated);
    localStorage.setItem("periodEntries", JSON.stringify(updated));
    setLastPeriodDate("");
  };

  const savePregnancyInfo = () => {
    const info = { isPregnant, dueDate };
    localStorage.setItem("pregnancyInfo", JSON.stringify(info));
  };

  const addReminder = (topic: string, type: string, frequency: string) => {
    const nextDate = new Date();
    if (frequency === "monthly") {
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else if (frequency === "yearly") {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    }

    const newReminder: ScreeningReminder = {
      id: Date.now().toString(),
      topic,
      reminderType: type,
      nextDueDate: nextDate.toISOString(),
      frequency,
      isEnabled: true
    };

    const updated = [...reminders, newReminder];
    setReminders(updated);
    localStorage.setItem("screeningReminders", JSON.stringify(updated));
  };

  const toggleReminder = (id: string) => {
    const updated = reminders.map(r =>
      r.id === id ? { ...r, isEnabled: !r.isEnabled } : r
    );
    setReminders(updated);
    localStorage.setItem("screeningReminders", JSON.stringify(updated));
  };

  const analyzeSymptoms = () => {
    if (!symptomInput.trim()) return;

    const input = symptomInput.toLowerCase();
    let result: SymptomCheckResult;

    // Simple rule-based analysis
    const criticalSymptoms = ["lump", "bleeding", "severe pain", "discharge", "fever"];
    const moderateSymptoms = ["irregular", "missed period", "pain", "cramps"];
    
    const hasCritical = criticalSymptoms.some(s => input.includes(s));
    const hasModerate = moderateSymptoms.some(s => input.includes(s));

    if (hasCritical) {
      result = {
        riskLevel: "high",
        recommendation: "Seek immediate medical consultation",
        redFlags: ["Abnormal symptoms detected"],
        advice: "Please visit a gynecologist or healthcare provider as soon as possible for proper examination and diagnosis."
      };
    } else if (hasModerate) {
      result = {
        riskLevel: "medium",
        recommendation: "Schedule a doctor's appointment",
        redFlags: [],
        advice: "Monitor your symptoms and consult with a healthcare provider for evaluation. Keep track of when symptoms occur."
      };
    } else {
      result = {
        riskLevel: "low",
        recommendation: "Continue monitoring",
        redFlags: [],
        advice: "Your symptoms appear mild. Continue self-monitoring and maintain healthy lifestyle habits. Consult a doctor if symptoms persist or worsen."
      };
    }

    setSymptomResult(result);
  };

  const filteredTopics = awarenessTopics.filter(topic =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const nextPeriod = calculateNextPeriod();
  const pregnancyWeek = calculatePregnancyWeek();
  const activeReminders = reminders.filter(r => r.isEnabled);

  const dangerSigns = [
    "Severe abdominal pain",
    "Vaginal bleeding",
    "Severe headache with blurred vision",
    "Sudden swelling of face/hands",
    "Decreased fetal movement",
    "Fever with chills",
    "Severe vomiting (unable to keep food down)",
    "Water breaking before 37 weeks",
    "Contractions before 37 weeks"
  ];

  const maternalReminders = [
    { week: "4-8", reminder: "First antenatal visit - blood tests, BP check, ultrasound" },
    { week: "12-16", reminder: "Second visit - urine test, weight check, baby's heartbeat" },
    { week: "20-24", reminder: "Detailed ultrasound scan, iron/calcium supplements" },
    { week: "28-32", reminder: "Blood tests (Hb, blood group), glucose screening" },
    { week: "36-40", reminder: "Weekly visits, monitor baby position, prepare for delivery" }
  ];

  if (selectedTopic) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="border-b sticky top-0 bg-background z-10">
          <div className="p-4 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedTopic(null)}
              data-testid="button-back-topic"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-foreground">{selectedTopic.title}</h1>
            </div>
          </div>
        </header>

        <div className="p-4 space-y-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground leading-relaxed">{selectedTopic.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Risk Factors</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {selectedTopic.riskFactors.map((factor, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-destructive mt-1">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Prevention Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {selectedTopic.preventionTips.map((tip, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Symptom Checker</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="symptoms">Describe your symptoms</Label>
                <Textarea
                  id="symptoms"
                  placeholder="E.g., irregular periods, breast lump, unusual discharge..."
                  value={symptomInput}
                  onChange={(e) => setSymptomInput(e.target.value)}
                  rows={4}
                  data-testid="textarea-symptoms"
                />
              </div>
              <Button onClick={analyzeSymptoms} className="w-full" data-testid="button-analyze">
                Analyze Symptoms
              </Button>

              {symptomResult && (
                <Card className={`${
                  symptomResult.riskLevel === "high" ? "border-destructive bg-destructive/10" :
                  symptomResult.riskLevel === "medium" ? "border-orange-500 bg-orange-500/10" :
                  "border-primary bg-primary/10"
                }`}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        symptomResult.riskLevel === "high" ? "destructive" :
                        symptomResult.riskLevel === "medium" ? "default" :
                        "secondary"
                      } className="uppercase">
                        {symptomResult.riskLevel} Risk
                      </Badge>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">Recommendation:</p>
                      <p className="text-sm text-muted-foreground">{symptomResult.recommendation}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">Advice:</p>
                      <p className="text-sm text-muted-foreground">{symptomResult.advice}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Set Screening Reminders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedTopic.topic === "breast-cancer" && (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => addReminder(selectedTopic.topic, "Breast Self-Exam", "monthly")}
                    data-testid="button-reminder-self-exam"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Monthly Breast Self-Exam
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => addReminder(selectedTopic.topic, "Mammogram", "yearly")}
                    data-testid="button-reminder-mammogram"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Annual Mammogram (Age 40+)
                  </Button>
                </>
              )}
              {selectedTopic.topic === "cervical-cancer" && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => addReminder(selectedTopic.topic, "Pap Smear", "yearly")}
                  data-testid="button-reminder-pap"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Annual Pap Smear Test
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {selectedTopic.resources.map((resource, index) => (
                  <li key={index} className="text-sm text-primary">• {resource}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
            <h1 className="text-xl font-semibold text-foreground">Women's Health</h1>
            <p className="text-xs text-muted-foreground">Complete health & awareness center</p>
          </div>
        </div>
      </header>

      <div className="p-4">
        <Tabs defaultValue="awareness" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="awareness" data-testid="tab-awareness">Awareness</TabsTrigger>
            <TabsTrigger value="period" data-testid="tab-period">Period</TabsTrigger>
            <TabsTrigger value="pregnancy" data-testid="tab-pregnancy">Pregnancy</TabsTrigger>
            <TabsTrigger value="reminders" data-testid="tab-reminders">
              Reminders
              {activeReminders.length > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs px-1">{activeReminders.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="awareness" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search health topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-topics"
              />
            </div>

            <div className="grid gap-3">
              {filteredTopics.map((topic) => {
                const Icon = topic.icon;
                return (
                  <Card
                    key={topic.id}
                    className="cursor-pointer hover-elevate"
                    onClick={() => setSelectedTopic(topic)}
                    data-testid={`topic-card-${topic.topic}`}
                  >
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-full bg-${topic.color}-500/10 flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-6 h-6 text-${topic.color}-500`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">{topic.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{topic.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="period" className="space-y-4">
            {nextPeriod && (
              <Card className="border-primary bg-primary/5">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Next Period Expected</p>
                    <p className="text-sm text-muted-foreground">
                      {nextPeriod.toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Log Period</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="period-date">Last Period Start Date</Label>
                  <Input
                    id="period-date"
                    type="date"
                    value={lastPeriodDate}
                    onChange={(e) => setLastPeriodDate(e.target.value)}
                    data-testid="input-period-date"
                  />
                </div>
                <Button onClick={savePeriod} className="w-full" data-testid="button-save-period">
                  Log Period
                </Button>
              </CardContent>
            </Card>

            <div>
              <h2 className="text-sm font-semibold text-foreground mb-3">Period History</h2>
              {periodEntries.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Heart className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">No period data yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {periodEntries.map((entry, index) => (
                    <Card key={index}>
                      <CardContent className="p-3">
                        <p className="text-sm font-medium">
                          {new Date(entry.startDate).toLocaleDateString()}
                        </p>
                        <Badge variant="outline" className="mt-1 capitalize">{entry.flow} flow</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="pregnancy" className="space-y-4">
            {isPregnant && dueDate && (
              <Card className="border-primary bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Baby className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">Week {pregnancyWeek} of Pregnancy</p>
                      <p className="text-sm text-muted-foreground">
                        Due date: {new Date(dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${(pregnancyWeek / 40) * 100}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Pregnancy Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="pregnant"
                    checked={isPregnant}
                    onChange={(e) => setIsPregnant(e.target.checked)}
                    className="w-4 h-4"
                    data-testid="checkbox-pregnant"
                  />
                  <Label htmlFor="pregnant">I am currently pregnant</Label>
                </div>

                {isPregnant && (
                  <div className="space-y-2">
                    <Label htmlFor="due-date">Expected Due Date</Label>
                    <Input
                      id="due-date"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      data-testid="input-due-date"
                    />
                  </div>
                )}

                <Button onClick={savePregnancyInfo} className="w-full" data-testid="button-save-pregnancy">
                  Save Information
                </Button>
              </CardContent>
            </Card>

            {isPregnant && (
              <>
                <Card className="bg-destructive/10 border-destructive/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="w-5 h-5" />
                      Danger Signs - Seek Immediate Care
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {dangerSigns.map((sign, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          • {sign}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <div>
                  <h2 className="text-sm font-semibold text-foreground mb-3">Antenatal Care Schedule</h2>
                  <div className="space-y-2">
                    {maternalReminders.map((reminder, index) => (
                      <Card key={index}>
                        <CardContent className="p-3">
                          <p className="text-sm font-medium">Week {reminder.week}</p>
                          <p className="text-sm text-muted-foreground">{reminder.reminder}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="reminders" className="space-y-4">
            {reminders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground mb-2">No screening reminders set</p>
                  <p className="text-sm text-muted-foreground">
                    Visit awareness topics to set up reminders for screenings
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {reminders.map((reminder) => (
                  <Card key={reminder.id} data-testid={`reminder-card-${reminder.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Bell className="w-4 h-4 text-primary" />
                            <h3 className="font-semibold text-foreground">{reminder.reminderType}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1 capitalize">
                            Topic: {reminder.topic.replace("-", " ")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Next due: {new Date(reminder.nextDueDate).toLocaleDateString()}
                          </p>
                          <Badge variant="outline" className="mt-2 capitalize">{reminder.frequency}</Badge>
                        </div>
                        <Button
                          variant={reminder.isEnabled ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleReminder(reminder.id)}
                          data-testid={`button-toggle-${reminder.id}`}
                        >
                          {reminder.isEnabled ? "Enabled" : "Disabled"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
