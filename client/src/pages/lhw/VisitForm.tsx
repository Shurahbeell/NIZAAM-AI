import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check } from "lucide-react";
import { useSubmitVisit } from "@/lib/useLHWData";
import { useToast } from "@/hooks/use-toast";

const VISIT_TYPES = ["maternal", "child", "chronic", "vaccination"];
const VITALS_FIELDS = ["weight", "height", "bp", "temp"];

export default function VisitForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    visitType: "maternal",
    notes: "",
    vitals: {} as Record<string, string>,
    nextVisitDate: "",
    followUpNeeded: false,
  });

  const submitVisit = useSubmitVisit();

  const handleSubmit = async () => {
    if (!formData.visitType || !formData.notes.trim()) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in visit type and notes",
        variant: "destructive",
      });
      return;
    }

    await submitVisit.mutateAsync({
      visitType: formData.visitType,
      notes: formData.notes,
      vitals: formData.vitals,
      nextVisitDate: formData.nextVisitDate || null,
    });

    toast({
      title: "Visit Logged",
      description: "Visit information saved successfully",
    });

    setLocation("/lhw/dashboard");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="p-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/lhw/households")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Household Visit Form</h1>
        </div>
      </header>

      <div className="p-4 max-w-2xl mx-auto">
        <Card className="p-6 space-y-6">
          {/* Visit Type */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Visit Type
            </Label>
            <div className="space-y-2">
              {VISIT_TYPES.map((type) => (
                <label key={type} className="flex items-center gap-3 p-2 hover-elevate rounded cursor-pointer">
                  <Checkbox
                    checked={formData.visitType === type}
                    onCheckedChange={() => setFormData({ ...formData, visitType: type })}
                    data-testid={`checkbox-visittype-${type}`}
                  />
                  <span className="capitalize text-sm">{type.replace("-", " ")}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Visit Notes */}
          <div>
            <Label htmlFor="notes" className="text-base font-semibold mb-2 block">
              Visit Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Describe observations, findings, counseling provided..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="min-h-32"
              data-testid="textarea-notes"
            />
          </div>

          {/* Vitals */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Vitals (Optional)</Label>
            <div className="grid grid-cols-2 gap-4">
              {VITALS_FIELDS.map((field) => (
                <div key={field}>
                  <Label htmlFor={field} className="text-xs capitalize mb-2 block">
                    {field === "bp" ? "Blood Pressure" : field.charAt(0).toUpperCase() + field.slice(1)}
                  </Label>
                  <Input
                    id={field}
                    placeholder={field === "weight" ? "kg" : field === "height" ? "cm" : "value"}
                    value={formData.vitals[field] || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        vitals: { ...formData.vitals, [field]: e.target.value },
                      })
                    }
                    data-testid={`input-vital-${field}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Next Visit */}
          <div>
            <Label htmlFor="nextVisit" className="text-base font-semibold mb-2 block">
              Next Visit Date (Optional)
            </Label>
            <Input
              id="nextVisit"
              type="date"
              value={formData.nextVisitDate}
              onChange={(e) => setFormData({ ...formData, nextVisitDate: e.target.value })}
              data-testid="input-nextvisit"
            />
          </div>

          {/* Follow-up Needed */}
          <label className="flex items-center gap-3 p-3 hover-elevate rounded cursor-pointer">
            <Checkbox
              checked={formData.followUpNeeded}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, followUpNeeded: checked as boolean })
              }
              data-testid="checkbox-followup"
            />
            <span className="text-sm">Follow-up needed</span>
          </label>

          {/* Submit */}
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={submitVisit.isPending}
            data-testid="button-submit"
          >
            {submitVisit.isPending ? "Saving..." : "Log Visit"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
