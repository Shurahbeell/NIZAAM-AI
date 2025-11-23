import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, AlertTriangle, MapPin, Phone, User, Heart, Building2, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useAuthStore } from "@/lib/auth";

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

interface AssignmentInfo {
  type: "frontliner" | "hospital";
  name: string;
  id: string;
}

export default function Emergency() {
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const [emergencyType, setEmergencyType] = useState("");
  const [conditionDescription, setConditionDescription] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [progress, setProgress] = useState(0);
  const [assignment, setAssignment] = useState<AssignmentInfo | null>(null);

  const handleSendHelp = async () => {
    setIsSending(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 20;
      });
    }, 300);

    try {
      // Get current GPS location using Geolocation API
      let lat: string | null = null;
      let lng: string | null = null;
      let locationString = user?.address || "Location unavailable";

      if (navigator.geolocation) {
        const position = await new Promise<GeolocationCoordinates>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos.coords),
            (err) => reject(err),
            { timeout: 5000, enableHighAccuracy: true }
          );
        });
        lat = position.latitude.toString();
        lng = position.longitude.toString();
        locationString = `${lat}, ${lng}`;
        console.log(`[Emergency] Using current location: ${locationString}`);
      } else {
        console.warn("[Emergency] Geolocation API not available");
      }

      // Send emergency to backend with GPS coordinates
      const response = await apiRequest("POST", "/api/emergencies", {
        patientId: user?.id || null,
        patientName: user?.fullName || user?.username || "Unknown",
        patientPhone: user?.phone || "Phone not provided",
        location: locationString,
        emergencyType: emergencyType,
        priority: priorityMap[emergencyType] || "medium",
        symptoms: symptomsMap[emergencyType] || "Emergency medical attention required",
        status: "active",
        lat,
        lng,
        assignedHospitalId: null,
        notes: conditionDescription || null
      });

      const data = await response.json();
      
      // Store assignment info if available
      if (data.assignedTo) {
        setAssignment(data.assignedTo);
        console.log(`[Emergency] Routed to ${data.assignedTo.type}: ${data.assignedTo.name}`);
      }

      // If we reach here, the request was successful
      setTimeout(() => {
        setIsSending(false);
        setIsSent(true);
      }, 1500);
    } catch (error) {
      console.error("Failed to send emergency:", error);
      setIsSending(false);
      clearInterval(interval);
    }
  };

  if (isSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <Card className="w-full max-w-md p-8 text-center space-y-6 shadow-2xl border-none bg-white/95 backdrop-blur-sm rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto shadow-xl animate-in zoom-in duration-500">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
              Help is on the way!
            </h2>
            <p className="text-muted-foreground text-base">
              Emergency services have been notified. Stay calm and stay where you are.
            </p>
          </div>
          <Card className="p-5 bg-gradient-to-br from-accent to-accent/50 border-none rounded-2xl text-left space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Building2 className="w-5 h-5" />
              <p className="font-semibold">
                {assignment?.type === "frontliner" ? "Rescue 1122 Frontliner" : "Nearest Hospital"}
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-bold text-foreground text-lg">
                {assignment?.name || "Locating nearest service..."}
              </p>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-destructive animate-pulse" />
                <p className="text-sm text-muted-foreground">ETA: 8-10 minutes</p>
              </div>
            </div>
          </Card>
          <Button 
            className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-secondary hover:shadow-xl hover:scale-[1.02] transition-all duration-300" 
            onClick={() => setLocation("/dashboard")} 
            data-testid="button-back-dashboard"
          >
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-destructive/5 via-background to-destructive/10">
      {/* Header with gradient background */}
      <header className="sticky top-0 bg-gradient-to-r from-destructive to-destructive/80 shadow-lg z-20 backdrop-blur-sm">
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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white animate-pulse" />
            </div>
            <h1 className="text-xl font-bold text-white">Emergency</h1>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Emergency Alert Banner */}
        <Card className="p-6 bg-gradient-to-r from-destructive/10 to-destructive/5 border-2 border-destructive/30 shadow-xl rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-destructive to-destructive/70 flex items-center justify-center shadow-md flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-foreground mb-1 text-lg">Emergency Alert</h2>
              <p className="text-sm text-muted-foreground">
                Your information will be sent to nearby emergency services immediately
              </p>
            </div>
          </div>
        </Card>

        {/* User Information */}
        <Card className="p-6 shadow-xl border-none bg-gradient-to-br from-white to-accent/20 rounded-2xl">
          <div className="space-y-4">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Your Information
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-md border border-border/50">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground font-medium">Name</p>
                  <p className="font-bold text-foreground" data-testid="text-patient-name">
                    {user?.fullName || user?.username || "Not set"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-md border border-border/50">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md flex-shrink-0">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground font-medium">Phone</p>
                  <p className="font-bold text-foreground" data-testid="text-patient-phone">
                    {user?.phone || "Not set"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-md border border-border/50">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md flex-shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground font-medium">Location</p>
                  <p className="font-bold text-foreground" data-testid="text-patient-location">
                    {user?.address || "Not set"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Emergency Type Selection */}
        <div className="space-y-3">
          <Label htmlFor="emergency-type" className="text-sm font-bold text-foreground">
            Emergency Type
          </Label>
          <Select value={emergencyType} onValueChange={setEmergencyType}>
            <SelectTrigger 
              id="emergency-type" 
              data-testid="select-emergency-type"
              className="h-14 rounded-xl border-2 border-border text-base shadow-md bg-white"
            >
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

        {/* Condition Description */}
        <div className="space-y-3">
          <Label htmlFor="condition-description" className="text-sm font-bold text-foreground">
            Describe Your Condition
          </Label>
          <Textarea
            id="condition-description"
            placeholder="Please describe your condition thoroughly... (e.g., symptoms, severity, any medications you're taking, allergies, etc.)"
            value={conditionDescription}
            onChange={(e) => setConditionDescription(e.target.value)}
            data-testid="textarea-condition-description"
            className="rounded-xl border-2 border-border shadow-md bg-white min-h-32 resize-none text-base"
          />
        </div>

        {/* Progress Indicator */}
        {isSending && (
          <Card className="p-5 bg-gradient-to-br from-white to-accent/20 border-none shadow-lg rounded-2xl animate-in fade-in slide-in-from-top-2">
            <div className="space-y-3">
              <p className="text-sm text-center font-semibold text-foreground flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                Sending emergency alert...
              </p>
              <Progress value={progress} className="h-3 rounded-full" />
            </div>
          </Card>
        )}

        {/* Send Help Button */}
        <Button
          size="lg"
          variant="destructive"
          className="w-full h-16 text-lg font-bold rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-[1.02] active:scale-95 transition-all duration-300 relative overflow-hidden group"
          onClick={handleSendHelp}
          disabled={!emergencyType || isSending}
          data-testid="button-send-help"
        >
          <span className="absolute inset-0 bg-white/20 animate-pulse"></span>
          <AlertTriangle className="w-7 h-7 mr-2 relative z-10" />
          <span className="relative z-10">Send Help Now</span>
        </Button>

        {/* Safety Tips */}
        <Card className="p-5 bg-gradient-to-br from-accent to-accent/50 border-none rounded-2xl">
          <div className="space-y-2">
            <p className="text-sm font-bold text-foreground">Emergency Tips:</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Stay calm and keep your phone nearby</li>
              <li>Don't move if you have a serious injury</li>
              <li>Keep breathing slowly and steadily</li>
              <li>Help will arrive within minutes</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
