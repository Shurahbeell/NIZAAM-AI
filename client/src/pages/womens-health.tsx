import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Heart, Calendar, AlertTriangle, Baby } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PeriodEntry {
  startDate: string;
  endDate?: string;
  flow: "light" | "normal" | "heavy";
}

export default function WomensHealth() {
  const [, setLocation] = useLocation();
  const [periodEntries, setPeriodEntries] = useState<PeriodEntry[]>([]);
  const [lastPeriodDate, setLastPeriodDate] = useState("");
  const [isPregnant, setIsPregnant] = useState(false);
  const [dueDate, setDueDate] = useState("");

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

  const nextPeriod = calculateNextPeriod();
  const pregnancyWeek = calculatePregnancyWeek();

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
            <p className="text-xs text-muted-foreground">Period & pregnancy tracker</p>
          </div>
        </div>
      </header>

      <div className="p-4">
        <Tabs defaultValue="period" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="period" data-testid="tab-period">Period Tracker</TabsTrigger>
            <TabsTrigger value="pregnancy" data-testid="tab-pregnancy">Pregnancy</TabsTrigger>
          </TabsList>

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
        </Tabs>
      </div>
    </div>
  );
}
