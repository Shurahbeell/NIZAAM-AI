import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Syringe, Calendar, MapPin, Bell } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";

interface Vaccine {
  name: string;
  ageGroup: string;
  doses: number;
  schedule: string;
  protectsAgainst: string;
}

interface VaccinationRecord {
  vaccineName: string;
  dateGiven: string;
  doseNumber: number;
  nextDueDate?: string;
}

const epiVaccines: Vaccine[] = [
  { name: "BCG", ageGroup: "Birth", doses: 1, schedule: "At birth or as soon as possible", protectsAgainst: "Tuberculosis (TB)" },
  { name: "Hepatitis B (Birth Dose)", ageGroup: "Birth", doses: 1, schedule: "Within 24 hours of birth", protectsAgainst: "Hepatitis B" },
  { name: "OPV-0 (Polio)", ageGroup: "Birth", doses: 1, schedule: "At birth", protectsAgainst: "Poliomyelitis" },
  { name: "Pentavalent (DPT-HepB-Hib)", ageGroup: "6, 10, 14 weeks", doses: 3, schedule: "6 weeks, 10 weeks, 14 weeks", protectsAgainst: "Diphtheria, Pertussis, Tetanus, Hepatitis B, Haemophilus influenzae type b" },
  { name: "OPV (Polio)", ageGroup: "6, 10, 14 weeks", doses: 3, schedule: "6 weeks, 10 weeks, 14 weeks", protectsAgainst: "Poliomyelitis" },
  { name: "PCV (Pneumococcal)", ageGroup: "6, 10, 14 weeks", doses: 3, schedule: "6 weeks, 10 weeks, 14 weeks", protectsAgainst: "Pneumonia, Meningitis" },
  { name: "Measles 1", ageGroup: "9 months", doses: 1, schedule: "At 9 months", protectsAgainst: "Measles" },
  { name: "Measles 2", ageGroup: "15 months", doses: 1, schedule: "At 15 months", protectsAgainst: "Measles" },
  { name: "Typhoid", ageGroup: "9 months", doses: 1, schedule: "From 9 months onwards", protectsAgainst: "Typhoid fever" },
  { name: "COVID-19", ageGroup: "12+ years", doses: 2, schedule: "As per national guidelines", protectsAgainst: "COVID-19" }
];

export default function VaccinationTracker() {
  const [, setLocation] = useLocation();
  const [records, setRecords] = useState<VaccinationRecord[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("vaccinationRecords");
    if (stored) {
      setRecords(JSON.parse(stored));
    }
  }, []);

  const getNextDueVaccine = () => {
    const today = new Date();
    const upcomingRecords = records.filter(r => {
      if (!r.nextDueDate) return false;
      const dueDate = new Date(r.nextDueDate);
      return dueDate > today;
    }).sort((a, b) => {
      const dateA = new Date(a.nextDueDate!);
      const dateB = new Date(b.nextDueDate!);
      return dateA.getTime() - dateB.getTime();
    });

    return upcomingRecords[0];
  };

  const nextDue = getNextDueVaccine();

  const nearbyVaccinationCenters = [
    { name: "Government Hospital Vaccination Center", address: "Main Road, City Center", distance: "1.2 km", timings: "Mon-Sat: 9 AM - 4 PM" },
    { name: "Rural Health Center", address: "Station Road", distance: "3.5 km", timings: "Mon-Fri: 8 AM - 2 PM" },
    { name: "EPI Center - District Hospital", address: "Hospital Road", distance: "5.0 km", timings: "Daily: 9 AM - 5 PM" }
  ];

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
            <h1 className="text-xl font-semibold text-foreground">Vaccination Tracker</h1>
            <p className="text-xs text-muted-foreground">EPI immunization schedule</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {nextDue && (
          <Card className="border-primary bg-primary/5">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Next Due Vaccine</p>
                <p className="text-sm text-muted-foreground">
                  {nextDue.vaccineName} - Due on {new Date(nextDue.nextDueDate!).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">EPI Vaccination Schedule</h2>
          <div className="space-y-3">
            {epiVaccines.map((vaccine, index) => (
              <Card key={index} data-testid={`vaccine-card-${index}`}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Syringe className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{vaccine.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Age: {vaccine.ageGroup}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline">{vaccine.doses} dose{vaccine.doses > 1 ? 's' : ''}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Schedule:</p>
                    <p className="text-sm text-muted-foreground">{vaccine.schedule}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Protects Against:</p>
                    <p className="text-sm text-muted-foreground">{vaccine.protectsAgainst}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Nearest Vaccination Centers</h2>
          <div className="space-y-3">
            {nearbyVaccinationCenters.map((center, index) => (
              <Card key={index} data-testid={`center-card-${index}`}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{center.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{center.address}</p>
                      <Badge variant="outline" className="mt-2">{center.distance} away</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {center.timings}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              ⚕️ <strong>Important:</strong> Follow the EPI vaccination schedule to protect your child from preventable diseases. All EPI vaccines are FREE at government health facilities.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
