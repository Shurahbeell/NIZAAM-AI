import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const supplyRequestSchema = z.object({
  supplyType: z.enum(["pad", "vaccine", "medicine", "contraceptive", "teaching_material", "other"]),
  quantity: z.coerce.number().min(1),
  priorityLevel: z.enum(["low", "medium", "high"]),
  reason: z.string().min(10),
});

type SupplyRequestData = z.infer<typeof supplyRequestSchema>;

export default function LHWSupplyRequestPage() {
  const { toast } = useToast();
  const form = useForm<SupplyRequestData>({
    resolver: zodResolver(supplyRequestSchema),
    defaultValues: {
      priorityLevel: "medium",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: SupplyRequestData) => {
      const response = await apiRequest(
        "POST",
        "/api/donations/supply-request",
        data
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Supply request submitted successfully",
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to submit supply request",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SupplyRequestData) => {
    mutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Request Supplies</h1>
        <p className="text-muted-foreground">Submit a request for health supplies or funding</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supply Request Form</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="supplyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supply Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger data-testid="select-supply-type">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pad">Sanitary Pads</SelectItem>
                        <SelectItem value="vaccine">Vaccines</SelectItem>
                        <SelectItem value="medicine">Medicines</SelectItem>
                        <SelectItem value="contraceptive">Contraceptives</SelectItem>
                        <SelectItem value="teaching_material">Teaching Materials</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity Needed</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 100" {...field} data-testid="input-quantity" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priorityLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority Level</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger data-testid="select-priority">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Request</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe why you need these supplies..."
                        {...field}
                        data-testid="textarea-reason"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={mutation.isPending} className="w-full" data-testid="button-submit-request">
                {mutation.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
