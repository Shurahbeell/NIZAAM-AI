import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Baby, TrendingUp, CheckCircle2, Apple } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

interface GrowthRecord {
  date: string;
  weight: number;
  height: number;
  headCircumference?: number;
}

const milestones = [
  { age: "1 month", physical: ["Lifts head briefly", "Follows objects"], social: ["Makes eye contact", "Responds to sounds"] },
  { age: "3 months", physical: ["Holds head steady", "Pushes up on arms"], social: ["Smiles at people", "Coos and babbles"] },
  { age: "6 months", physical: ["Rolls over", "Sits with support"], social: ["Recognizes familiar faces", "Responds to name"] },
  { age: "9 months", physical: ["Sits without support", "Crawls"], social: ["Stranger anxiety", "Says 'mama' 'dada'"] },
  { age: "12 months", physical: ["Stands alone", "May walk"], social: ["Waves bye-bye", "Simple words"] },
  { age: "18 months", physical: ["Walks independently", "Runs"], social: ["Points to objects", "2-word phrases"] },
  { age: "2 years", physical: ["Kicks ball", "Climbs stairs"], social: ["Plays alongside others", "2-3 word sentences"] },
  { age: "3 years", physical: ["Pedals tricycle", "Catches ball"], social: ["Takes turns", "Uses 4-5 word sentences"] }
];

const nutritionGuidance = [
  { age: "0-6 months", food: "Exclusive breastfeeding", notes: "Breast milk provides all nutrients. No water or other foods needed" },
  { age: "6-8 months", food: "Breast milk + mashed foods", notes: "Introduce pureed fruits, vegetables, rice cereal. 2-3 meals/day" },
  { age: "9-11 months", food: "Breast milk + soft foods", notes: "Finely chopped family foods. 3-4 meals + 1-2 snacks/day" },
  { age: "12-24 months", food: "Breast milk + family foods", notes: "Continue breastfeeding. Full meals with variety. Avoid added sugar/salt" },
  { age: "2-5 years", food: "Balanced diet", notes: "5 food groups daily: grains, protein, dairy, fruits, vegetables. Limit junk food" }
];

export default function ChildHealth() {
  const [, setLocation] = useLocation();
  const [childName, setChildName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([]);
  const [newWeight, setNewWeight] = useState("");
  const [newHeight, setNewHeight] = useState("");

  useEffect(() => {
    const storedChild = localStorage.getItem("childInfo");
    if (storedChild) {
      const info = JSON.parse(storedChild);
      setChildName(info.name);
      setDateOfBirth(info.dob);
    }

    const storedGrowth = localStorage.getItem("growthRecords");
    if (storedGrowth) {
      setGrowthRecords(JSON.parse(storedGrowth));
    }
  }, []);

  const saveChildInfo = () => {
    const info = { name: childName, dob: dateOfBirth };
    localStorage.setItem("childInfo", JSON.stringify(info));
  };

  const saveGrowthRecord = () => {
    if (!newWeight || !newHeight) return;

    const record: GrowthRecord = {
      date: new Date().toISOString(),
      weight: parseFloat(newWeight),
      height: parseFloat(newHeight)
    };

    const updated = [record, ...growthRecords].slice(0, 20);
    setGrowthRecords(updated);
    localStorage.setItem("growthRecords", JSON.stringify(updated));
    setNewWeight("");
    setNewHeight("");
  };

  const calculateAge = () => {
    if (!dateOfBirth) return null;
    const dob = new Date(dateOfBirth);
    const today = new Date();
    const months = (today.getFullYear() - dob.getFullYear()) * 12 + (today.getMonth() - dob.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    }
    return `${months} month${months !== 1 ? 's' : ''}`;
  };

  const age = calculateAge();

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
            <h1 className="text-xl font-semibold text-foreground">Child Health</h1>
            <p className="text-xs text-muted-foreground">Growth & development tracker</p>
          </div>
        </div>
      </header>

      <div className="p-4">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Baby className="w-5 h-5 text-primary" />
              Child Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="child-name">Child's Name</Label>
              <Input
                id="child-name"
                placeholder="Enter name"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                data-testid="input-child-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                data-testid="input-dob"
              />
            </div>
            {age && (
              <div className="p-3 bg-primary/10 rounded-lg">
                <p className="text-sm font-semibold text-foreground">Current Age: {age}</p>
              </div>
            )}
            <Button onClick={saveChildInfo} className="w-full" data-testid="button-save-child">
              Save Information
            </Button>
          </CardContent>
        </Card>

        <Tabs defaultValue="growth" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="growth" data-testid="tab-growth">Growth</TabsTrigger>
            <TabsTrigger value="milestones" data-testid="tab-milestones">Milestones</TabsTrigger>
            <TabsTrigger value="nutrition" data-testid="tab-nutrition">Nutrition</TabsTrigger>
          </TabsList>

          <TabsContent value="growth" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Record Growth
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 12.5"
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                      data-testid="input-weight"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 85.0"
                      value={newHeight}
                      onChange={(e) => setNewHeight(e.target.value)}
                      data-testid="input-height"
                    />
                  </div>
                </div>
                <Button onClick={saveGrowthRecord} className="w-full" data-testid="button-save-growth">
                  Save Record
                </Button>
              </CardContent>
            </Card>

            <div>
              <h2 className="text-sm font-semibold text-foreground mb-3">Growth History</h2>
              {growthRecords.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">No growth records yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {growthRecords.map((record, index) => (
                    <Card key={index}>
                      <CardContent className="p-3">
                        <p className="text-sm font-medium">
                          {new Date(record.date).toLocaleDateString()}
                        </p>
                        <div className="flex gap-4 mt-2">
                          <Badge variant="outline">Weight: {record.weight} kg</Badge>
                          <Badge variant="outline">Height: {record.height} cm</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="milestones" className="space-y-3">
            {milestones.map((milestone, index) => (
              <Card key={index} data-testid={`milestone-card-${index}`}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{milestone.age}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">Physical:</p>
                    <ul className="space-y-1">
                      {milestone.physical.map((item, i) => (
                        <li key={i} className="text-sm text-muted-foreground">• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">Social/Cognitive:</p>
                    <ul className="space-y-1">
                      {milestone.social.map((item, i) => (
                        <li key={i} className="text-sm text-muted-foreground">• {item}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="nutrition" className="space-y-3">
            {nutritionGuidance.map((guide, index) => (
              <Card key={index} data-testid={`nutrition-card-${index}`}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Apple className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{guide.age}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{guide.food}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{guide.notes}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        <Card className="bg-muted/30 mt-4">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              👶 <strong>Important:</strong> Regular growth monitoring and developmental assessments are essential. Visit your pediatrician if you have concerns about your child's development.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
