import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useReportEmergency } from "@/lib/useLHWData";
import { useToast } from "@/hooks/use-toast";

export default function Emergencies() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    patientName: "",
    patientPhone: "",
    symptoms: "",
    severity: "medium", // low, medium, high, critical
  });

  const reportEmergency = useReportEmergency();

  const handleSubmit = async () => {
    if (!formData.patientName || !formData.symptoms || !formData.patientPhone) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    await reportEmergency.mutateAsync({
      patientName: formData.patientName,
      patientPhone: formData.patientPhone,
      symptoms: formData.symptoms,
      severity: formData.severity,
      reportedBy: "lhw",
    });

    toast({
      title: "Emergency Reported",
      description: "Emergency case reported and authorities notified",
      variant: "default",
    });

    setFormData({
      patientName: "",
      patientPhone: "",
      symptoms: "",
      severity: "medium",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="p-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/lhw/dashboard")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Report Emergency</h1>
            <p className="text-xs text-muted-foreground">Alert medical authorities</p>
          </div>
        </div>
      </header>

      <div className="p-4 max-w-2xl mx-auto">
        <Card className="p-6 space-y-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <div className="flex items-start gap-3 text-amber-900 dark:text-amber-100">
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold">Emergency Report</p>
              <p className="text-xs mt-1">
                Use this form to immediately alert medical authorities and hospitals
              </p>
            </div>
          </div>
        </Card>

        <Card className="mt-6 p-6 space-y-6">
          {/* Patient Name */}
          <div>
            <Label htmlFor="name" className="text-base font-semibold mb-2 block">
              Patient Name *
            </Label>
            <Input
              id="name"
              placeholder="Full name"
              value={formData.patientName}
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              data-testid="input-name"
            />
          </div>

          {/* Patient Phone */}
          <div>
            <Label htmlFor="phone" className="text-base font-semibold mb-2 block">
              Contact Phone *
            </Label>
            <Input
              id="phone"
              placeholder="Phone number"
              type="tel"
              value={formData.patientPhone}
              onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
              data-testid="input-phone"
            />
          </div>

          {/* Symptoms */}
          <div>
            <Label htmlFor="symptoms" className="text-base font-semibold mb-2 block">
              Symptoms & Condition *
            </Label>
            <Textarea
              id="symptoms"
              placeholder="Describe symptoms, vital signs, and current condition..."
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              className="min-h-32"
              data-testid="textarea-symptoms"
            />
          </div>

          {/* Severity */}
          <div>
            <Label htmlFor="severity" className="text-base font-semibold mb-3 block">
              Severity Level
            </Label>
            <select
              id="severity"
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              data-testid="select-severity"
            >
              <option value="low">Low - Can wait a few hours</option>
              <option value="medium">Medium - Should see doctor today</option>
              <option value="high">High - Urgent attention needed</option>
              <option value="critical">Critical - Life-threatening</option>
            </select>
          </div>

          {/* Submit */}
          <Button
            className="w-full bg-destructive hover:bg-destructive/90"
            onClick={handleSubmit}
            disabled={reportEmergency.isPending}
            data-testid="button-submit"
          >
            {reportEmergency.isPending ? "Reporting..." : "Report Emergency"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
