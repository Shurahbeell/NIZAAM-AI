import { useAuthStore } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Heart } from "lucide-react";

interface Donation {
  id: string;
  amount: number;
  paymentMethod: string;
  receiptNumber?: string;
  createdAt: string;
  causeId: string;
}

export default function DonationHistoryPage() {
  const user = useAuthStore((state) => state.user);

  const { data: donations, isLoading } = useQuery<Donation[]>({
    queryKey: ["/api/donations/user", user?.id],
    enabled: !!user?.id,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary" />
            Your Donation History
          </h1>
          <p className="text-muted-foreground">
            Track all your contributions to community health initiatives
          </p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="pt-8 text-center text-muted-foreground">
              Loading your donations...
            </CardContent>
          </Card>
        ) : donations && donations.length > 0 ? (
          <div className="space-y-4">
            {donations.map((donation) => (
              <Card key={donation.id} data-testid={`card-donation-${donation.id}`}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(donation.createdAt), "PPP p")}
                      </p>
                      <p className="font-medium">{donation.paymentMethod.replace(/_/g, " ")}</p>
                      {donation.receiptNumber && (
                        <p className="text-xs text-muted-foreground">
                          Receipt: {donation.receiptNumber}
                        </p>
                      )}
                    </div>
                    <p className="text-lg font-bold text-primary">
                      PKR {donation.amount.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-8 text-center space-y-4">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
              <div>
                <p className="text-muted-foreground">You haven't made any donations yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start by making your first contribution to community health
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
