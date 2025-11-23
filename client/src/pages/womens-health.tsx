import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Heart, Calendar, AlertTriangle, Baby, Search, Bell, Stethoscope, BookOpen, Activity, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [periodEntries, setPeriodEntries] = useState<PeriodEntry[]>([]);
  const [lastPeriodDate, setLastPeriodDate] = useState("");
  const [isPregnant, setIsPregnant] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<AwarenessTopic | null>(null);
  const [reminders, setReminders] = useState<ScreeningReminder[]>([]);
  const [symptomInput, setSymptomInput] = useState("");
  const [symptomResult, setSymptomResult] = useState<SymptomCheckResult | null>(null);
  const tabsRef = useRef<any>(null);

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
    
    // Show success toast
    toast({
      title: "Reminder Added!",
      description: `${type} reminder set for ${frequency} starting ${nextDate.toLocaleDateString()}`,
      variant: "default"
    });
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
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background pb-24">
        {/* Header */}
        <header className="sticky top-0 bg-gradient-to-r from-pink-500 to-purple-500 shadow-lg z-20 backdrop-blur-sm">
          <div className="p-4 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedTopic(null)}
              data-testid="button-back-topic"
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">{selectedTopic.title}</h1>
            </div>
          </div>
        </header>

        <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Description */}
          <Card className="p-6 border-none shadow-xl bg-gradient-to-br from-white to-accent/20 rounded-2xl">
            <p className="text-muted-foreground leading-relaxed">{selectedTopic.description}</p>
          </Card>

          {/* Risk Factors */}
          <Card className="border-2 border-destructive/20 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="pb-4 bg-gradient-to-r from-destructive/10 to-destructive/5">
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Risk Factors
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-3">
                {selectedTopic.riskFactors.map((factor, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-accent/30 rounded-xl">
                    <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-destructive text-sm font-bold">!</span>
                    </div>
                    <span className="text-sm text-foreground">{factor}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Prevention Tips */}
          <Card className="border-2 border-primary/20 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="pb-4 bg-gradient-to-r from-primary/10 to-primary/5">
              <CardTitle className="text-primary flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Prevention Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-3">
                {selectedTopic.preventionTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-accent/30 rounded-xl">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm text-foreground">{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* AI Symptom Checker */}
          <Card className="border-none shadow-xl rounded-2xl bg-gradient-to-br from-white to-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-primary" />
                AI Symptom Checker
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="symptoms" className="font-semibold">Describe your symptoms</Label>
                <Textarea
                  id="symptoms"
                  placeholder="E.g., irregular periods, breast lump, unusual discharge..."
                  value={symptomInput}
                  onChange={(e) => setSymptomInput(e.target.value)}
                  rows={4}
                  data-testid="textarea-symptoms"
                  className="rounded-xl border-2"
                />
              </div>
              <Button 
                onClick={analyzeSymptoms} 
                className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all duration-300" 
                data-testid="button-analyze"
              >
                Analyze Symptoms
              </Button>

              {symptomResult && (
                <Card className={`rounded-2xl border-2 ${
                  symptomResult.riskLevel === "high" ? "border-destructive/30 bg-gradient-to-br from-destructive/10 to-destructive/5" :
                  symptomResult.riskLevel === "medium" ? "border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-orange-500/5" :
                  "border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-500/5"
                }`}>
                  <CardContent className="p-5 space-y-4">
                    <Badge variant={
                      symptomResult.riskLevel === "high" ? "destructive" :
                      "default"
                    } className="uppercase text-xs px-3 py-1">
                      {symptomResult.riskLevel} Risk
                    </Badge>
                    <div>
                      <p className="font-bold text-foreground mb-2">Recommendation:</p>
                      <p className="text-sm text-muted-foreground">{symptomResult.recommendation}</p>
                    </div>
                    <div>
                      <p className="font-bold text-foreground mb-2">Advice:</p>
                      <p className="text-sm text-muted-foreground">{symptomResult.advice}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Set Reminders */}
          <Card className="border-none shadow-xl rounded-2xl bg-gradient-to-br from-white to-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Set Screening Reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedTopic.topic === "breast-cancer" && (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12 rounded-xl border-2 hover:bg-accent/50 hover:border-primary/30"
                    onClick={() => addReminder(selectedTopic.topic, "Breast Self-Exam", "monthly")}
                    data-testid="button-reminder-self-exam"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Monthly Breast Self-Exam
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12 rounded-xl border-2 hover:bg-accent/50 hover:border-primary/30"
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
                  className="w-full justify-start h-12 rounded-xl border-2 hover:bg-accent/50 hover:border-primary/30"
                  onClick={() => addReminder(selectedTopic.topic, "Pap Smear", "yearly")}
                  data-testid="button-reminder-pap"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Annual Pap Smear Test
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Resources */}
          <Card className="border-none shadow-xl rounded-2xl bg-gradient-to-br from-white to-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {selectedTopic.resources.map((resource, index) => (
                  <li key={index} className="text-sm text-primary flex items-start gap-2 p-2 bg-accent/30 rounded-lg">
                    <span className="text-primary mt-0.5">•</span>
                    {resource}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-gradient-to-r from-pink-500 to-purple-500 shadow-lg z-20 backdrop-blur-sm">
        <div className="p-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/dashboard")}
            data-testid="button-back"
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 flex items-center gap-2">
            <Heart className="w-6 h-6 text-white" />
            <div>
              <h1 className="text-xl font-bold text-white">Women's Health</h1>
              <p className="text-xs text-white/80">Complete health & awareness center</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Tabs ref={tabsRef} defaultValue="awareness" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 h-12 rounded-xl bg-muted p-1">
            <TabsTrigger value="awareness" data-testid="tab-awareness" className="rounded-lg">Awareness</TabsTrigger>
            <TabsTrigger value="period" data-testid="tab-period" className="rounded-lg">Period</TabsTrigger>
            <TabsTrigger value="pregnancy" data-testid="tab-pregnancy" className="rounded-lg">Pregnancy</TabsTrigger>
            <TabsTrigger value="reminders" data-testid="tab-reminders" className="rounded-lg">
              Reminders
              {activeReminders.length > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs px-1.5">{activeReminders.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="awareness" className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search health topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 rounded-xl border-2 text-base shadow-md"
                data-testid="input-search-topics"
              />
            </div>

            {/* Topics */}
            <div className="grid gap-4">
              {filteredTopics.map((topic) => {
                const Icon = topic.icon;
                return (
                  <Card
                    key={topic.id}
                    className="cursor-pointer border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] bg-gradient-to-br from-white to-accent/20 overflow-hidden relative group"
                    onClick={() => setSelectedTopic(topic)}
                    data-testid={`topic-card-${topic.topic}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardContent className="p-5 flex items-start gap-4 relative z-10">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground mb-1 text-base">{topic.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{topic.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Period Tracking Tab */}
          <TabsContent value="period" className="space-y-4">
            {nextPeriod && (
              <Card className="p-5 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-2 border-pink-500/20 shadow-lg rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Next Period Expected</p>
                    <p className="text-lg font-bold text-pink-600">{nextPeriod.toLocaleDateString()}</p>
                  </div>
                </div>
              </Card>
            )}

            <Card className="border-none shadow-xl rounded-2xl bg-gradient-to-br from-white to-accent/20">
              <CardHeader>
                <CardTitle>Log Period</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="period-date" className="font-semibold">Last Period Start Date</Label>
                  <Input
                    id="period-date"
                    type="date"
                    value={lastPeriodDate}
                    onChange={(e) => setLastPeriodDate(e.target.value)}
                    data-testid="input-period-date"
                    className="h-12 rounded-xl border-2"
                  />
                </div>
                <Button onClick={savePeriod} className="w-full h-11 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500" data-testid="button-save-period">
                  Save Period Entry
                </Button>
              </CardContent>
            </Card>

            {periodEntries.length > 0 && (
              <Card className="border-none shadow-xl rounded-2xl bg-gradient-to-br from-white to-accent/20">
                <CardHeader>
                  <CardTitle>Period History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {periodEntries.slice(0, 6).map((entry, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-accent/30 rounded-xl">
                        <span className="text-sm font-medium text-foreground">{new Date(entry.startDate).toLocaleDateString()}</span>
                        <Badge variant="outline" className="capitalize">{entry.flow} flow</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Pregnancy Tab */}
          <TabsContent value="pregnancy" className="space-y-4">
            {isPregnant && pregnancyWeek > 0 && (
              <Card className="p-5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-2 border-blue-500/20 shadow-lg rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Baby className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Pregnancy Progress</p>
                    <p className="text-2xl font-bold text-blue-600">Week {pregnancyWeek}</p>
                    <p className="text-xs text-muted-foreground">Due: {new Date(dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </Card>
            )}

            <Card className="border-none shadow-xl rounded-2xl bg-gradient-to-br from-white to-accent/20">
              <CardHeader>
                <CardTitle>Pregnancy Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isPregnant}
                    onChange={(e) => setIsPregnant(e.target.checked)}
                    id="is-pregnant"
                    className="w-4 h-4 rounded"
                    data-testid="checkbox-pregnant"
                  />
                  <Label htmlFor="is-pregnant" className="font-semibold cursor-pointer">I am currently pregnant</Label>
                </div>
                
                {isPregnant && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="due-date" className="font-semibold">Expected Due Date</Label>
                      <Input
                        id="due-date"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        data-testid="input-due-date"
                        className="h-12 rounded-xl border-2"
                      />
                    </div>
                    <Button onClick={savePregnancyInfo} className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500" data-testid="button-save-pregnancy">
                      Save Pregnancy Info
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {isPregnant && (
              <>
                <Card className="border-2 border-destructive/20 shadow-xl rounded-2xl bg-gradient-to-br from-destructive/5 to-transparent">
                  <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Danger Signs - Seek Help Immediately
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {dangerSigns.map((sign, idx) => (
                        <li key={idx} className="text-sm text-foreground flex items-start gap-2 p-2 bg-destructive/10 rounded-lg">
                          <span className="text-destructive mt-0.5">•</span>
                          {sign}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-xl rounded-2xl bg-gradient-to-br from-white to-accent/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Antenatal Care Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {maternalReminders.map((item, idx) => (
                        <div key={idx} className="p-4 bg-accent/30 rounded-xl">
                          <p className="font-bold text-primary text-sm">Week {item.week}</p>
                          <p className="text-sm text-muted-foreground mt-1">{item.reminder}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Reminders Tab */}
          <TabsContent value="reminders" className="space-y-4">
            {reminders.length === 0 ? (
              <Card className="p-8 text-center border-none shadow-xl rounded-2xl bg-gradient-to-br from-white to-accent/20">
                <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No screening reminders set yet.</p>
                <p className="text-sm text-muted-foreground mt-2">Browse awareness topics to set up reminders for regular screenings.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {reminders.map((reminder) => (
                  <Card key={reminder.id} className="border-none shadow-lg rounded-2xl bg-gradient-to-br from-white to-accent/20">
                    <CardContent className="p-4 flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{reminder.reminderType}</p>
                        <p className="text-sm text-muted-foreground">Due: {new Date(reminder.nextDueDate).toLocaleDateString()}</p>
                        <Badge variant="outline" className="mt-2 capitalize text-xs">{reminder.frequency}</Badge>
                      </div>
                      <Button
                        variant={reminder.isEnabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleReminder(reminder.id)}
                        data-testid={`button-toggle-reminder-${reminder.id}`}
                        className="rounded-lg"
                      >
                        {reminder.isEnabled ? "On" : "Off"}
                      </Button>
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
