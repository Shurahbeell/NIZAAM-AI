import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileText, QrCode, CheckCircle, XCircle } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";

interface Prescription {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  medications: { name: string; dosage: string; duration: string }[];
  instructions: string;
  isFulfilled: boolean;
  qrCode?: string;
}

export default function HospitalPrescriptions() {
  const [, setLocation] = useLocation();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("hospitalPrescriptions");
    if (stored) {
      setPrescriptions(JSON.parse(stored));
    } else {
      // Demo data
      const demoData: Prescription[] = [
        {
          id: "1",
          patientName: "Ahmed Ali",
          doctorName: "Dr. Sarah Khan",
          date: "2024-01-19",
          diagnosis: "Hypertension",
          medications: [
            { name: "Amlodipine 5mg", dosage: "1 tablet daily", duration: "30 days" },
            { name: "Aspirin 75mg", dosage: "1 tablet daily", duration: "30 days" }
          ],
          instructions: "Take after breakfast. Monitor blood pressure daily.",
          isFulfilled: false,
          qrCode: "RX-2024-001"
        },
        {
          id: "2",
          patientName: "Fatima Hassan",
          doctorName: "Dr. Ali Raza",
          date: "2024-01-18",
          diagnosis: "Viral Fever",
          medications: [
            { name: "Paracetamol 500mg", dosage: "1 tablet every 6 hours", duration: "5 days" }
          ],
          instructions: "Take with food. Increase fluid intake.",
          isFulfilled: true,
          qrCode: "RX-2024-002"
        }
      ];
      setPrescriptions(demoData);
      localStorage.setItem("hospitalPrescriptions", JSON.stringify(demoData));
    }
  }, []);

  const toggleFulfilled = (id: string) => {
    const updated = prescriptions.map(p =>
      p.id === id ? { ...p, isFulfilled: !p.isFulfilled } : p
    );
    setPrescriptions(updated);
    localStorage.setItem("hospitalPrescriptions", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="p-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/hospital/dashboard")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground">Prescriptions</h1>
            <p className="text-xs text-muted-foreground">
              {prescriptions.filter(p => !p.isFulfilled).length} pending fulfillment
            </p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-3">
        {prescriptions.map((prescription) => (
          <Card key={prescription.id} data-testid={`prescription-card-${prescription.id}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{prescription.patientName}</h3>
                      <p className="text-sm text-muted-foreground">Dr. {prescription.doctorName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(prescription.date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={prescription.isFulfilled ? "default" : "outline"}>
                      {prescription.isFulfilled ? "Fulfilled" : "Pending"}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Diagnosis:</p>
                      <p className="text-sm text-muted-foreground">{prescription.diagnosis}</p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-foreground">Medications:</p>
                      <ul className="space-y-1">
                        {prescription.medications.map((med, index) => (
                          <li key={index} className="text-sm text-muted-foreground">
                            • {med.name} - {med.dosage} for {med.duration}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-foreground">Instructions:</p>
                      <p className="text-sm text-muted-foreground">{prescription.instructions}</p>
                    </div>

                    {prescription.qrCode && (
                      <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                        <QrCode className="w-4 h-4 text-primary" />
                        <span className="text-xs font-mono">{prescription.qrCode}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant={prescription.isFulfilled ? "outline" : "default"}
                      onClick={() => toggleFulfilled(prescription.id)}
                      data-testid={`button-toggle-${prescription.id}`}
                    >
                      {prescription.isFulfilled ? (
                        <>
                          <XCircle className="w-4 h-4 mr-1" />
                          Mark as Pending
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark as Fulfilled
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {prescriptions.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">No prescriptions yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
