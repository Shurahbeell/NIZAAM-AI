import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLHWHouseholds, useMenstrualHygieneStatus, useUpdateMenstrualStatus, useRequestPads } from "@/lib/useLHWData";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

const statusFormSchema = z.object({
  householdId: z.string().min(1, "Household is required"),
  usesSafeProducts: z.boolean().default(false),
  lastCycleDate: z.string().optional(),
  notes: z.string().optional(),
});

const padRequestSchema = z.object({
  householdId: z.string().min(1, "Household is required"),
  quantityRequested: z.number().min(1, "Quantity must be at least 1"),
  urgencyLevel: z.enum(["low", "medium", "high"]),
});

type StatusFormValues = z.infer<typeof statusFormSchema>;
type PadRequestValues = z.infer<typeof padRequestSchema>;

export default function HouseholdMenstrualProfile() {
  const [, setLocation] = useLocation();
  const [selectedHousehold, setSelectedHousehold] = useState<string>("");
  const [showPadForm, setShowPadForm] = useState(false);

  const { data: households, isLoading: householdsLoading } = useLHWHouseholds();
  const { data: status, isLoading: statusLoading } = useMenstrualHygieneStatus(selectedHousehold);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateMenstrualStatus();
  const { mutate: requestPads, isPending: isRequesting } = useRequestPads();

  const statusForm = useForm<StatusFormValues>({
    resolver: zodResolver(statusFormSchema),
    defaultValues: {
      householdId: selectedHousehold,
      usesSafeProducts: status?.usesSafeProducts || false,
      lastCycleDate: status?.lastCycleDate ? new Date(status.lastCycleDate).toISOString().split("T")[0] : "",
      notes: status?.notes || "",
    },
  });

  const padForm = useForm<PadRequestValues>({
    resolver: zodResolver(padRequestSchema),
    defaultValues: {
      householdId: selectedHousehold,
      quantityRequested: 10,
      urgencyLevel: "medium",
    },
  });

  const onStatusSubmit = (data: StatusFormValues) => {
    updateStatus(
      {
        householdId: data.householdId,
        usesSafeProducts: data.usesSafeProducts,
        lastCycleDate: data.lastCycleDate,
        notes: data.notes,
      },
      {
        onSuccess: () => {
          alert("Menstrual health status updated successfully");
        },
      }
    );
  };

  const onPadRequestSubmit = (data: PadRequestValues) => {
    requestPads(
      {
        householdId: data.householdId,
        quantityRequested: data.quantityRequested,
        urgencyLevel: data.urgencyLevel,
      },
      {
        onSuccess: () => {
          alert("Pad request submitted successfully");
          setShowPadForm(false);
          padForm.reset();
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
          <h1 className="text-2xl font-bold">Household Menstrual Health Profile</h1>
        </div>

        {/* Household Selection */}
        <Card className="p-4 mb-6">
          <FormLabel className="mb-2 block">Select Household</FormLabel>
          {householdsLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={selectedHousehold} onValueChange={setSelectedHousehold}>
              <SelectTrigger data-testid="select-household">
                <SelectValue placeholder="Choose a household" />
              </SelectTrigger>
              <SelectContent>
                {households?.map((h) => (
                  <SelectItem key={h.id} value={h.id}>
                    {h.householdName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </Card>

        {selectedHousehold && (
          <>
            {/* Menstrual Health Status Form */}
            <Card className="p-4 mb-6">
              <h2 className="text-lg font-semibold mb-4">Menstrual Health Status</h2>

              {statusLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : (
                <Form {...statusForm}>
                  <form onSubmit={statusForm.handleSubmit(onStatusSubmit)} className="space-y-4">
                    <FormField
                      control={statusForm.control}
                      name="lastCycleDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Cycle Date (optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-cycle-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={statusForm.control}
                      name="usesSafeProducts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} data-testid="checkbox-safe-products" />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Uses Safe Menstrual Products</FormLabel>
                            <p className="text-sm text-muted-foreground">Sanitary pads, tampons, or menstrual cups</p>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={statusForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Any observations or concerns..." {...field} data-testid="textarea-notes" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isUpdating} className="w-full" data-testid="button-save-status">
                      <Save className="w-4 h-4 mr-2" />
                      {isUpdating ? "Saving..." : "Save Status"}
                    </Button>
                  </form>
                </Form>
              )}
            </Card>

            {/* Pad Request Card */}
            <Card className="p-4 mb-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                Request Sanitary Pads
              </h2>
              <p className="text-sm text-muted-foreground mb-4">Submit a request for pad donation support for this household</p>

              {!showPadForm ? (
                <Button onClick={() => setShowPadForm(true)} className="w-full" data-testid="button-show-pad-form">
                  Request Pads
                </Button>
              ) : (
                <Form {...padForm}>
                  <form onSubmit={padForm.handleSubmit(onPadRequestSubmit)} className="space-y-4">
                    <FormField
                      control={padForm.control}
                      name="quantityRequested"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity Needed</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              data-testid="input-quantity"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={padForm.control}
                      name="urgencyLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Urgency Level</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger data-testid="select-urgency">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High (Immediate Need)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={isRequesting}
                        className="flex-1"
                        data-testid="button-submit-request"
                      >
                        {isRequesting ? "Submitting..." : "Submit Request"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowPadForm(false)}
                        data-testid="button-cancel-request"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
