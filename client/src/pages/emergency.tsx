import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, AlertTriangle, MapPin, Phone, User } from "lucide-react";
import { useLocation } from "wouter";
import { Progress } from "@/components/ui/progress";

interface EmergencyData {
  id: string;
  patientName: string;
  patientPhone: string;
  location: string;
  emergencyType: string;
  priority: string;
  symptoms: string;
  status: string;
  createdAt: string;
}

const priorityMap: Record<string, string> = {
  "heart-attack": "critical",
  "breathing": "critical",
  "accident": "high",
  "fall": "medium",
  "other": "medium"
};

const symptomsMap: Record<string, string> = {
  "heart-attack": "Chest pain, difficulty breathing, severe discomfort",
  "breathing": "Shortness of breath, wheezing, cannot breathe normally",
  "accident": "Trauma, injury, bleeding",
  "fall": "Fall injury, possible fracture, pain",
  "other": "Emergency medical attention required"
};

export default function Emergency() {
  const [, setLocation] = useLocation();
  const [emergencyType, setEmergencyType] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSendHelp = () => {
    setIsSending(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSending(false);
          setIsSent(true);
          
          // Save emergency to localStorage
          const emergency: EmergencyData = {
            id: Date.now().toString(),
            patientName: "Ali Ahmed",
            patientPhone: "+92 300 1234567",
            location: "24.8607° N, 67.0011° E",
            emergencyType: emergencyType,
            priority: priorityMap[emergencyType] || "medium",
            symptoms: symptomsMap[emergencyType] || "Emergency medical attention required",
            status: "active",
            createdAt: new Date().toISOString()
          };
          
          const stored = localStorage.getItem("emergencies");
          const emergencies = stored ? JSON.parse(stored) : [];
          emergencies.unshift(emergency);
          localStorage.setItem("emergencies", JSON.stringify(emergencies));
          
          return 100;
        }
        return prev + 20;
      });
    }, 300);
  };

  if (isSent) {
    return (
      <div className="min-h-screen bg-destructive/5 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-10 h-10 text-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Help is on the way!</h2>
            <p className="text-muted-foreground">Emergency services have been notified. Stay calm and stay where you are.</p>
          </div>
          <div className="space-y-2 text-sm text-left">
            <p className="text-muted-foreground">Nearest hospital:</p>
            <p className="font-semibold text-foreground">City General Hospital</p>
            <p className="text-muted-foreground">ETA: 8-10 minutes</p>
          </div>
          <Button className="w-full" onClick={() => setLocation("/dashboard")} data-testid="button-back-dashboard">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-destructive/5">
      <header className="border-b p-4 flex items-center gap-3 bg-background sticky top-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/dashboard")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <h1 className="text-xl font-semibold text-foreground">Emergency</h1>
        </div>
      </header>

      <div className="p-4 space-y-6">
        <Card className="p-6 bg-destructive/10 border-destructive">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
            <div>
              <h2 className="font-semibold text-foreground mb-1">Emergency Alert</h2>
              <p className="text-sm text-muted-foreground">
                Your information will be sent to nearby emergency services immediately
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Your Information</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium text-foreground">Ali Ahmed</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium text-foreground">+92 300 1234567</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium text-foreground">24.8607° N, 67.0011° E</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-2">
          <Label htmlFor="emergency-type">Emergency Type</Label>
          <Select value={emergencyType} onValueChange={setEmergencyType}>
            <SelectTrigger id="emergency-type" data-testid="select-emergency-type">
              <SelectValue placeholder="Select emergency type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="heart-attack">Heart Attack</SelectItem>
              <SelectItem value="accident">Accident</SelectItem>
              <SelectItem value="fall">Fall / Injury</SelectItem>
              <SelectItem value="breathing">Breathing Difficulty</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isSending && (
          <div className="space-y-2">
            <p className="text-sm text-center text-muted-foreground">Sending emergency alert...</p>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <Button
          size="lg"
          variant="destructive"
          className="w-full py-6 text-lg font-semibold"
          onClick={handleSendHelp}
          disabled={!emergencyType || isSending}
          data-testid="button-send-help"
        >
          <AlertTriangle className="w-6 h-6 mr-2" />
          Send Help Now
        </Button>
      </div>
    </div>
  );
}
