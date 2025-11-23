import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MedicalHistoryCard from "@/components/MedicalHistoryCard";
import { useLanguage } from "@/lib/useLanguage";
import { useToast } from "@/hooks/use-toast";

interface MedicalReport {
  id: string;
  type: "appointment" | "emergency" | "note";
  title: string;
  date: string;
  summary: string;
  details?: string;
}

const DEFAULT_REPORTS: MedicalReport[] = [
  {
    id: "1",
    type: "appointment",
    title: "Cardiology Checkup",
    date: "Nov 5, 2025",
    summary: "Regular heart health screening with Dr. Sarah Johnson",
    details: "Blood pressure: 120/80. ECG normal. Doctor recommended continuing current medication and follow-up in 6 months."
  },
  {
    id: "2",
    type: "emergency",
    title: "Emergency Visit",
    date: "Oct 20, 2025",
    summary: "Minor accident - treated and released",
    details: "Patient arrived with minor cuts and bruises from a fall. Wounds cleaned and bandaged. X-ray showed no fractures. Prescribed pain medication."
  },
  {
    id: "3",
    type: "appointment",
    title: "General Checkup",
    date: "Sep 15, 2025",
    summary: "Annual physical examination",
    details: "All vital signs normal. Blood work results within normal range. Advised to maintain current diet and exercise routine."
  },
  {
    id: "4",
    type: "note",
    title: "Prescription Refill",
    date: "Aug 30, 2025",
    summary: "Blood pressure medication refill"
  }
];

export default function History() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [medicalReports, setMedicalReports] = useState<MedicalReport[]>(DEFAULT_REPORTS);

  const [newReport, setNewReport] = useState({
    type: "appointment" as const,
    title: "",
    date: "",
    summary: "",
    details: ""
  });

  useEffect(() => {
    const stored = localStorage.getItem("medicalReports");
    if (stored) {
      setMedicalReports(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("medicalReports", JSON.stringify(medicalReports));
  }, [medicalReports]);

  const addReport = () => {
    if (!newReport.title || !newReport.date || !newReport.summary) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const report: MedicalReport = {
      id: Date.now().toString(),
      type: newReport.type,
      title: newReport.title,
      date: newReport.date,
      summary: newReport.summary,
      details: newReport.details || undefined
    };

    setMedicalReports([report, ...medicalReports]);
    setNewReport({
      type: "appointment",
      title: "",
      date: "",
      summary: "",
      details: ""
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Report Added",
      description: "Medical report has been successfully added",
    });
  };

  const filterReports = (type?: string): MedicalReport[] => {
    if (!type || type === "all") return medicalReports;
    return medicalReports.filter(r => r.type === type);
  };

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
        <h1 className="text-xl font-semibold text-foreground flex-1">{t('medicalHistory.title')}</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="icon" data-testid="button-add-report">
              <Plus className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Medical Report</DialogTitle>
              <DialogDescription>
                Add a new medical report, appointment, or emergency record
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="report-type">Type</Label>
                <Select 
                  value={newReport.type}
                  onValueChange={(value: any) => setNewReport({ ...newReport, type: value })}
                >
                  <SelectTrigger data-testid="select-report-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appointment">Appointment</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="report-title">Title *</Label>
                <Input
                  id="report-title"
                  placeholder="e.g., Cardiology Checkup"
                  value={newReport.title}
                  onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                  data-testid="input-report-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="report-date">Date *</Label>
                <Input
                  id="report-date"
                  placeholder="e.g., Nov 10, 2025"
                  value={newReport.date}
                  onChange={(e) => setNewReport({ ...newReport, date: e.target.value })}
                  data-testid="input-report-date"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="report-summary">Summary *</Label>
                <Textarea
                  id="report-summary"
                  placeholder="Brief summary of the report"
                  value={newReport.summary}
                  onChange={(e) => setNewReport({ ...newReport, summary: e.target.value })}
                  data-testid="textarea-report-summary"
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="report-details">Details (Optional)</Label>
                <Textarea
                  id="report-details"
                  placeholder="Additional details about the report"
                  value={newReport.details}
                  onChange={(e) => setNewReport({ ...newReport, details: e.target.value })}
                  data-testid="textarea-report-details"
                  className="resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addReport} data-testid="button-save-report">
                Add Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <Tabs defaultValue="all" className="p-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" data-testid="tab-all">{t('medicalHistory.all')}</TabsTrigger>
          <TabsTrigger value="appointments" data-testid="tab-appointments">{t('medicalHistory.appointments')}</TabsTrigger>
          <TabsTrigger value="emergencies" data-testid="tab-emergencies">{t('medicalHistory.emergencies')}</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {filterReports("all").length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No medical reports yet</p>
            </div>
          ) : (
            filterReports("all").map((report) => (
              <MedicalHistoryCard
                key={report.id}
                type={report.type}
                title={report.title}
                date={report.date}
                summary={report.summary}
                details={report.details}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4 mt-6">
          {filterReports("appointment").length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No appointments found</p>
            </div>
          ) : (
            filterReports("appointment").map((report) => (
              <MedicalHistoryCard
                key={report.id}
                type={report.type}
                title={report.title}
                date={report.date}
                summary={report.summary}
                details={report.details}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="emergencies" className="space-y-4 mt-6">
          {filterReports("emergency").length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No emergency records found</p>
            </div>
          ) : (
            filterReports("emergency").map((report) => (
              <MedicalHistoryCard
                key={report.id}
                type={report.type}
                title={report.title}
                date={report.date}
                summary={report.summary}
                details={report.details}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
