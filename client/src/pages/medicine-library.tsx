import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Pill, Search, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { medicineLibrary } from "@shared/medicine-library";

export default function MedicineLibrary() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState<typeof medicineLibrary[0] | null>(null);

  const filteredMedicines = medicineLibrary.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="p-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => selectedMedicine ? setSelectedMedicine(null) : setLocation("/dashboard")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground">Medicine Library</h1>
            <p className="text-xs text-muted-foreground">Complete drug information</p>
          </div>
        </div>
      </header>

      {!selectedMedicine ? (
        <div className="p-4 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredMedicines.map((medicine, index) => (
              <Card 
                key={index} 
                className="hover-elevate cursor-pointer"
                onClick={() => setSelectedMedicine(medicine)}
                data-testid={`medicine-card-${index}`}
              >
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Pill className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{medicine.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{medicine.genericName}</p>
                      <Badge variant="outline" className="mt-2">{medicine.category}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{medicine.usage}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredMedicines.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Pill className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No medicines found</p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="p-4 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Pill className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>{selectedMedicine.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{selectedMedicine.genericName}</p>
                  <Badge variant="outline" className="mt-2">{selectedMedicine.category}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Usage</h3>
                <p className="text-sm text-muted-foreground">{selectedMedicine.usage}</p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Dosage</h3>
                <p className="text-sm text-muted-foreground">{selectedMedicine.dosage}</p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Side Effects</h3>
                <ul className="space-y-1">
                  {selectedMedicine.sideEffects.map((effect, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {effect}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Drug Interactions</h3>
                <ul className="space-y-1">
                  {selectedMedicine.interactions.map((interaction, i) => (
                    <li key={i} className="text-sm text-destructive">⚠️ {interaction}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Contraindications</h3>
                <ul className="space-y-1">
                  {selectedMedicine.contraindications.map((contra, i) => (
                    <li key={i} className="text-sm text-destructive">⛔ {contra}</li>
                  ))}
                </ul>
              </div>

              <Card className="bg-destructive/10 border-destructive/20">
                <CardContent className="p-4 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground mb-1">Important Precautions</p>
                    <p className="text-sm text-muted-foreground">{selectedMedicine.precautions}</p>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">
                ⚕️ <strong>Disclaimer:</strong> This information is for educational purposes only. Always consult a qualified healthcare provider before taking any medication.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
