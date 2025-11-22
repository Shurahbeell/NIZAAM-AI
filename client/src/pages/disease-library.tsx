import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Activity, Search, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { diseaseLibrary } from "@shared/disease-library";
import { useLanguage } from "@/lib/useLanguage";

export default function DiseaseLibrary() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDisease, setSelectedDisease] = useState<typeof diseaseLibrary[0] | null>(null);

  const filteredDiseases = diseaseLibrary.filter(disease =>
    disease.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    disease.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    disease.symptoms.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="p-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => selectedDisease ? setSelectedDisease(null) : setLocation("/dashboard")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground">{t('diseaseLibrary.title')}</h1>
            <p className="text-xs text-muted-foreground">{t('diseaseLibrary.subtitle')}</p>
          </div>
        </div>
      </header>

      {!selectedDisease ? (
        <div className="p-4 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('diseaseLibrary.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredDiseases.map((disease, index) => (
              <Card 
                key={index} 
                className="hover-elevate cursor-pointer"
                onClick={() => setSelectedDisease(disease)}
                data-testid={`disease-card-${index}`}
              >
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Activity className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{disease.name}</CardTitle>
                      <Badge variant="outline" className="mt-2">{disease.category}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {t('diseaseDetails.commonSymptoms')} {disease.symptoms.slice(0, 3).join(", ")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDiseases.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Activity className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">{t('diseaseLibrary.noResults')}</p>
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
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>{selectedDisease.name}</CardTitle>
                  <Badge variant="outline" className="mt-2">{selectedDisease.category}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">{t('diseaseDetails.symptoms')}</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDisease.symptoms.map((symptom, i) => (
                    <Badge key={i} variant="outline">{symptom}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">{t('diseaseDetails.riskFactors')}</h3>
                <ul className="space-y-1">
                  {selectedDisease.riskFactors.map((factor, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {factor}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">{t('diseaseDetails.complications')}</h3>
                <ul className="space-y-1">
                  {selectedDisease.complications.map((comp, i) => (
                    <li key={i} className="text-sm text-destructive">⚠️ {comp}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">{t('diseaseDetails.treatment')}</h3>
                <ul className="space-y-1">
                  {selectedDisease.treatments.map((treatment, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {treatment}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">{t('diseaseDetails.prevention')}</h3>
                <ul className="space-y-1">
                  {selectedDisease.prevention.map((prev, i) => (
                    <li key={i} className="text-sm text-accent-foreground">✓ {prev}</li>
                  ))}
                </ul>
              </div>

              <Card className="bg-destructive/10 border-destructive/20">
                <CardContent className="p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground mb-1">{t('diseaseDetails.whenToSeeDoctor')}</p>
                    <p className="text-sm text-muted-foreground">{selectedDisease.whenToSeeDoctor}</p>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">
                ⚕️ <strong>{t('diseaseDetails.disclaimer')}:</strong> {t('diseaseDetails.disclaimerText')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
