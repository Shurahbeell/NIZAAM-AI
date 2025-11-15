import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Brain, TrendingUp, Wind, Phone } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MoodEntry {
  date: string;
  mood: "excellent" | "good" | "okay" | "bad" | "terrible";
  note: string;
}

const breathingExercises = [
  {
    name: "4-7-8 Breathing",
    description: "Calming technique for anxiety and sleep",
    steps: [
      "Exhale completely through your mouth",
      "Close your mouth and inhale through nose for 4 counts",
      "Hold your breath for 7 counts",
      "Exhale completely through mouth for 8 counts",
      "Repeat 3-4 times"
    ]
  },
  {
    name: "Box Breathing",
    description: "Reduces stress and improves focus",
    steps: [
      "Inhale for 4 counts",
      "Hold for 4 counts",
      "Exhale for 4 counts",
      "Hold for 4 counts",
      "Repeat for 5 minutes"
    ]
  },
  {
    name: "Deep Belly Breathing",
    description: "Activates relaxation response",
    steps: [
      "Place one hand on chest, one on belly",
      "Breathe in slowly through nose, feel belly rise",
      "Exhale slowly through mouth, feel belly fall",
      "Continue for 5-10 minutes"
    ]
  }
];

const emergencySupport = [
  { name: "Pakistan Mental Health Helpline", number: "0800-15-000", available: "24/7" },
  { name: "Umang Helpline", number: "0317-7781-786", available: "Mon-Sat 10 AM-6 PM" },
  { name: "Rozan Counseling", number: "0800-22-444", available: "24/7" },
  { name: "Emergency Services", number: "115", available: "24/7" }
];

export default function MentalHealth() {
  const [, setLocation] = useLocation();
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<MoodEntry["mood"] | null>(null);
  const [moodNote, setMoodNote] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("moodEntries");
    if (stored) {
      setMoodEntries(JSON.parse(stored));
    }
  }, []);

  const saveMood = () => {
    if (!selectedMood) return;

    const newEntry: MoodEntry = {
      date: new Date().toISOString(),
      mood: selectedMood,
      note: moodNote
    };

    const updated = [newEntry, ...moodEntries].slice(0, 30);
    setMoodEntries(updated);
    localStorage.setItem("moodEntries", JSON.stringify(updated));
    setSelectedMood(null);
    setMoodNote("");
  };

  const getMoodEmoji = (mood: MoodEntry["mood"]) => {
    const emojis = {
      excellent: "😊",
      good: "🙂",
      okay: "😐",
      bad: "😟",
      terrible: "😢"
    };
    return emojis[mood];
  };

  const getMoodColor = (mood: MoodEntry["mood"]) => {
    const colors = {
      excellent: "bg-green-500",
      good: "bg-blue-500",
      okay: "bg-yellow-500",
      bad: "bg-orange-500",
      terrible: "bg-red-500"
    };
    return colors[mood];
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
            <h1 className="text-xl font-semibold text-foreground">Mental Health</h1>
            <p className="text-xs text-muted-foreground">Track mood & manage stress</p>
          </div>
        </div>
      </header>

      <div className="p-4">
        <Tabs defaultValue="mood" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mood" data-testid="tab-mood">Mood Tracker</TabsTrigger>
            <TabsTrigger value="breathing" data-testid="tab-breathing">Breathing</TabsTrigger>
            <TabsTrigger value="support" data-testid="tab-support">Support</TabsTrigger>
          </TabsList>

          <TabsContent value="mood" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  How are you feeling today?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-5 gap-2">
                  {(["excellent", "good", "okay", "bad", "terrible"] as const).map((mood) => (
                    <button
                      key={mood}
                      onClick={() => setSelectedMood(mood)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedMood === mood ? "border-primary bg-primary/10" : "border-border"
                      }`}
                      data-testid={`button-mood-${mood}`}
                    >
                      <div className="text-2xl">{getMoodEmoji(mood)}</div>
                      <div className="text-xs mt-1 capitalize">{mood}</div>
                    </button>
                  ))}
                </div>

                {selectedMood && (
                  <>
                    <textarea
                      placeholder="Add a note (optional)..."
                      value={moodNote}
                      onChange={(e) => setMoodNote(e.target.value)}
                      className="w-full p-3 border rounded-lg resize-none"
                      rows={3}
                      data-testid="textarea-mood-note"
                    />
                    <Button onClick={saveMood} className="w-full" data-testid="button-save-mood">
                      Save Mood Entry
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <div>
              <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Recent Mood History
              </h2>
              {moodEntries.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Brain className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">No mood entries yet. Start tracking your mood!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {moodEntries.map((entry, index) => (
                    <Card key={index}>
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${getMoodColor(entry.mood)} flex items-center justify-center text-white`}>
                          {getMoodEmoji(entry.mood)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium capitalize">{entry.mood}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(entry.date).toLocaleDateString()} at {new Date(entry.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                          {entry.note && <p className="text-sm text-muted-foreground mt-1">{entry.note}</p>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="breathing" className="space-y-4">
            <div className="space-y-3">
              {breathingExercises.map((exercise, index) => (
                <Card key={index} data-testid={`exercise-card-${index}`}>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Wind className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{exercise.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{exercise.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-2">
                      {exercise.steps.map((step, i) => (
                        <li key={i} className="text-sm text-muted-foreground">
                          {i + 1}. {step}
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="support" className="space-y-4">
            <Card className="bg-destructive/10 border-destructive/20">
              <CardContent className="p-4">
                <p className="text-sm text-foreground font-semibold mb-2">
                  ⚠️ If you're in crisis or having thoughts of self-harm
                </p>
                <p className="text-sm text-muted-foreground">
                  Please call one of the helplines below immediately. You're not alone, and help is available 24/7.
                </p>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {emergencySupport.map((support, index) => (
                <Card key={index} data-testid={`support-card-${index}`}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{support.name}</p>
                      <p className="text-lg font-bold text-primary">{support.number}</p>
                      <Badge variant="outline" className="mt-1">{support.available}</Badge>
                    </div>
                    <Button asChild data-testid={`button-call-${index}`}>
                      <a href={`tel:${support.number.replace(/\s/g, '')}`}>Call</a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">
                  💚 <strong>Remember:</strong> Taking care of your mental health is as important as physical health. It's okay to ask for help.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
