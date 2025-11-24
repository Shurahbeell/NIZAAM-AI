import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLHWHouseholds, useCreateEducationSession } from "@/lib/useLHWData";
import { useLocation } from "wouter";
import { ArrowLeft, Save } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const educationSessionSchema = z.object({
  householdId: z.string().min(1, "Household is required"),
  materialsProvided: z.array(z.string()),
  topicsCovered: z.array(z.string()).min(1, "Select at least one topic"),
  feedback: z.string().optional(),
});

type EducationSessionValues = z.infer<typeof educationSessionSchema>;

const MATERIALS = [
  { id: "handout_cycles", label: "Menstrual Cycle Handout" },
  { id: "safe_products_demo", label: "Safe Products Demo" },
  { id: "hygiene_guide", label: "Hygiene Guide" },
  { id: "infection_prevention", label: "Infection Prevention Guide" },
];

const TOPICS = [
  { id: "cycle_basics", label: "Understanding Menstrual Cycles" },
  { id: "safe_products", label: "Safe vs. Unsafe Products" },
  { id: "hygiene", label: "Hygiene & Sanitation" },
  { id: "infections", label: "Preventing Infections" },
  { id: "tracking", label: "Cycle Tracking Methods" },
  { id: "adolescent", label: "Adolescent Health" },
];

export default function MenstrualEducationForm() {
  const [, setLocation] = useLocation();
  const { data: households, isLoading: householdsLoading } = useLHWHouseholds();
  const { mutate: createSession, isPending: isCreating } = useCreateEducationSession();

  const form = useForm<EducationSessionValues>({
    resolver: zodResolver(educationSessionSchema),
    defaultValues: {
      householdId: "",
      materialsProvided: [],
      topicsCovered: [],
      feedback: "",
    },
  });

  const onSubmit = (data: EducationSessionValues) => {
    createSession(
      {
        householdId: data.householdId,
        materialsProvided: data.materialsProvided,
        topicsCovered: data.topicsCovered,
        feedbackForm: data.feedback ? { notes: data.feedback } : null,
      },
      {
        onSuccess: () => {
          alert("Education session recorded successfully");
          form.reset();
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/lhw/menstrual-hub")} data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">Menstrual Health Education Session</h1>
        </div>

        <Card className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Household Selection */}
              <FormField
                control={form.control}
                name="householdId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Household</FormLabel>
                    {householdsLoading ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid="select-household">
                            <SelectValue placeholder="Choose a household" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {households?.map((h) => (
                            <SelectItem key={h.id} value={h.id}>
                              {h.householdName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Materials Provided */}
              <FormField
                control={form.control}
                name="materialsProvided"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Materials Provided</FormLabel>
                    <div className="space-y-2">
                      {MATERIALS.map((material) => (
                        <FormItem key={material.id} className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value.includes(material.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...field.value, material.id]);
                                } else {
                                  field.onChange(field.value.filter((id) => id !== material.id));
                                }
                              }}
                              data-testid={`checkbox-material-${material.id}`}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{material.label}</FormLabel>
                        </FormItem>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Topics Covered */}
              <FormField
                control={form.control}
                name="topicsCovered"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topics Covered *</FormLabel>
                    <div className="space-y-2">
                      {TOPICS.map((topic) => (
                        <FormItem key={topic.id} className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value.includes(topic.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...field.value, topic.id]);
                                } else {
                                  field.onChange(field.value.filter((id) => id !== topic.id));
                                }
                              }}
                              data-testid={`checkbox-topic-${topic.id}`}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{topic.label}</FormLabel>
                        </FormItem>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Feedback */}
              <FormField
                control={form.control}
                name="feedback"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Notes (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Document session outcomes, attendee feedback, follow-up needs..."
                        {...field}
                        data-testid="textarea-feedback"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="flex gap-2">
                <Button type="submit" disabled={isCreating} className="flex-1" data-testid="button-save-session">
                  <Save className="w-4 h-4 mr-2" />
                  {isCreating ? "Saving..." : "Record Session"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/lhw/menstrual-hub")}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
