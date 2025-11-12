import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MedicalHistoryCard from "@/components/MedicalHistoryCard";

export default function History() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b p-4 flex items-center gap-3 sticky top-0 bg-background z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/dashboard")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-semibold text-foreground">Medical History</h1>
      </header>

      <Tabs defaultValue="all" className="p-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
          <TabsTrigger value="appointments" data-testid="tab-appointments">Appointments</TabsTrigger>
          <TabsTrigger value="emergencies" data-testid="tab-emergencies">Emergencies</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          <MedicalHistoryCard
            type="appointment"
            title="Cardiology Checkup"
            date="Nov 5, 2025"
            summary="Regular heart health screening with Dr. Sarah Johnson"
            details="Blood pressure: 120/80. ECG normal. Doctor recommended continuing current medication and follow-up in 6 months."
          />
          <MedicalHistoryCard
            type="emergency"
            title="Emergency Visit"
            date="Oct 20, 2025"
            summary="Minor accident - treated and released"
            details="Patient arrived with minor cuts and bruises from a fall. Wounds cleaned and bandaged. X-ray showed no fractures. Prescribed pain medication."
          />
          <MedicalHistoryCard
            type="appointment"
            title="General Checkup"
            date="Sep 15, 2025"
            summary="Annual physical examination"
            details="All vital signs normal. Blood work results within normal range. Advised to maintain current diet and exercise routine."
          />
          <MedicalHistoryCard
            type="note"
            title="Prescription Refill"
            date="Aug 30, 2025"
            summary="Blood pressure medication refill"
          />
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4 mt-6">
          <MedicalHistoryCard
            type="appointment"
            title="Cardiology Checkup"
            date="Nov 5, 2025"
            summary="Regular heart health screening with Dr. Sarah Johnson"
            details="Blood pressure: 120/80. ECG normal. Doctor recommended continuing current medication and follow-up in 6 months."
          />
          <MedicalHistoryCard
            type="appointment"
            title="General Checkup"
            date="Sep 15, 2025"
            summary="Annual physical examination"
            details="All vital signs normal. Blood work results within normal range. Advised to maintain current diet and exercise routine."
          />
        </TabsContent>

        <TabsContent value="emergencies" className="space-y-4 mt-6">
          <MedicalHistoryCard
            type="emergency"
            title="Emergency Visit"
            date="Oct 20, 2025"
            summary="Minor accident - treated and released"
            details="Patient arrived with minor cuts and bruises from a fall. Wounds cleaned and bandaged. X-ray showed no fractures. Prescribed pain medication."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
