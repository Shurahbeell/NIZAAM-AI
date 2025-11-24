import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle2, Heart } from "lucide-react";

const donationSchema = z.object({
  causeId: z.string().min(1, "Please select a cause"),
  amount: z.coerce.number().min(100, "Minimum donation is 100 PKR"),
  paymentMethod: z.enum(["bank_transfer", "jazzcash", "easypaisa", "cash"]),
  receiptNumber: z.string().optional(),
});

type DonationFormData = z.infer<typeof donationSchema>;

interface DonationCause {
  id: string;
  title: string;
  description: string;
}

export default function DonatePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const { data: causes } = useQuery<DonationCause[]>({
    queryKey: ["/api/donations/causes"],
  });

  const form = useForm<DonationFormData>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      causeId: "",
      amount: 500,
      paymentMethod: "bank_transfer",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: DonationFormData) => {
      return apiRequest({
        endpoint: "/api/donations/create",
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      setTimeout(() => setLocation("/donations/history"), 2000);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process donation",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DonationFormData) => {
    mutation.mutate(data);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto animate-in spin-in" />
            <h2 className="text-2xl font-bold text-foreground">Thank You!</h2>
            <p className="text-muted-foreground">
              Your donation has been recorded successfully. We appreciate your support!
            </p>
            <Button onClick={() => setLocation("/donations/history")} data-testid="button-view-history">
              View Your Donations
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary" />
            Make a Donation
          </h1>
          <p className="text-muted-foreground">
            Your contribution directly helps support healthcare initiatives in underserved communities.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Donation Details</CardTitle>
            <CardDescription>
              Fill in the information below to proceed with your donation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="causeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select a Cause</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid="select-cause">
                            <SelectValue placeholder="Choose where your donation goes" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {causes?.map((cause) => (
                            <SelectItem key={cause.id} value={cause.id}>
                              {cause.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.causeId && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.causeId.message}
                        </p>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (PKR)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="500"
                          {...field}
                          data-testid="input-amount"
                        />
                      </FormControl>
                      <FormDescription>Minimum donation is 100 PKR</FormDescription>
                      {form.formState.errors.amount && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.amount.message}
                        </p>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid="select-payment-method">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="jazzcash">JazzCash</SelectItem>
                          <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                        </SelectContent>
                      </Select>
                      {form.formState.errors.paymentMethod && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.paymentMethod.message}
                        </p>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="receiptNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Receipt Number (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., RCP-123456"
                          {...field}
                          data-testid="input-receipt"
                        />
                      </FormControl>
                      <FormDescription>
                        If you have a receipt number from your payment
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={mutation.isPending}
                    data-testid="button-submit-donation"
                  >
                    {mutation.isPending ? "Processing..." : "Complete Donation"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setLocation("/donations")}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="mt-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-lg">How Your Donation Helps</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Provides essential vaccines and medicines to underserved communities</p>
            <p>• Supports LHW field operations and supplies</p>
            <p>• Funds awareness and education programs</p>
            <p>• Enables emergency health interventions</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
