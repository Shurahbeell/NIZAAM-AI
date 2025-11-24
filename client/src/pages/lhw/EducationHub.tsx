import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useSubmitEducationSession } from "@/lib/useLHWData";
import { useToast } from "@/hooks/use-toast";

const TOPICS = [
  "maternal-health",
  "child-nutrition",
  "family-planning",
  "hygiene-sanitation",
  "immunization-awareness",
];

export default function EducationHub() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    topic: "maternal-health",
    audienceSize: 0,
    notes: "",
  });

  const submitSession = useSubmitEducationSession();

  const handleSubmit = async () => {
    if (!formData.topic || formData.audienceSize < 1) {
      toast({
        title: "Incomplete Form",
        description: "Please select topic and enter audience size",
        variant: "destructive",
      });
      return;
    }

    await submitSession.mutateAsync({
      topic: formData.topic,
      audienceSize: formData.audienceSize,
      notes: formData.notes,
    });

    toast({
      title: "Session Logged",
      description: "Education session saved successfully",
    });

    setFormData({ topic: "maternal-health", audienceSize: 0, notes: "" });
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
            <h1 className="text-lg font-semibold">Education Hub</h1>
            <p className="text-xs text-muted-foreground">Log awareness sessions</p>
          </div>
        </div>
      </header>

      <div className="p-4 max-w-2xl mx-auto">
        <Card className="p-6 space-y-6">
          {/* Topic */}
          <div>
            <Label htmlFor="topic" className="text-base font-semibold mb-3 block">
              Topic
            </Label>
            <select
              id="topic"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              data-testid="select-topic"
            >
              {TOPICS.map((topic) => (
                <option key={topic} value={topic}>
                  {topic.replace(/-/g, " ").charAt(0).toUpperCase() +
                    topic.replace(/-/g, " ").slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Audience Size */}
          <div>
            <Label htmlFor="audience" className="text-base font-semibold mb-2 block">
              Audience Size
            </Label>
            <Input
              id="audience"
              type="number"
              min="1"
              placeholder="Number of people"
              value={formData.audienceSize || ""}
              onChange={(e) =>
                setFormData({ ...formData, audienceSize: parseInt(e.target.value) || 0 })
              }
              data-testid="input-audience"
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-base font-semibold mb-2 block">
              Session Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Key points discussed, response from audience, follow-up actions..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="min-h-32"
              data-testid="textarea-notes"
            />
          </div>

          {/* Submit */}
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={submitSession.isPending}
            data-testid="button-submit"
          >
            {submitSession.isPending ? "Saving..." : "Log Session"}
          </Button>
        </Card>

        {/* Educational Resources */}
        <Card className="mt-6 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Recommended Topics
          </h2>
          <div className="space-y-3">
            {[
              "Maternal and Child Health",
              "Immunization Programs",
              "Family Planning Services",
              "Hygiene and Sanitation",
              "Nutrition for Women and Children",
            ].map((resource) => (
              <div key={resource} className="text-sm text-muted-foreground p-2 border-l-2 border-primary">
                {resource}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
