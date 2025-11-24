import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, TrendingUp, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/lib/auth";

interface DonationCause {
  id: string;
  title: string;
  description: string;
  iconUrl?: string;
  active: boolean;
}

interface DonationAccount {
  id: string;
  accountTitle: string;
  bankName?: string;
  accountNumber?: string;
  iban?: string;
  jazzcashNumber?: string;
  easypaisaNumber?: string;
  qrMediaUrl?: string;
}

export default function DonationsPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();

  const { data: causes, isLoading: causesLoading } = useQuery<DonationCause[]>({
    queryKey: ["/api/donations/causes"],
  });

  const { data: accounts, isLoading: accountsLoading } = useQuery<DonationAccount[]>({
    queryKey: ["/api/donations/accounts"],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Back Button */}
        {user && (
          <Button
            variant="ghost"
            onClick={() => setLocation("/dashboard")}
            className="mb-2"
            data-testid="button-back-dashboard"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        )}

        {/* Hero Section */}
        <div className="text-center space-y-4 py-8">
          <div className="flex justify-center">
            <Heart className="w-16 h-16 text-primary animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Support Community Health</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your donation directly supports healthcare initiatives, supplies, and awareness programs in underserved communities.
          </p>
          <Button
            size="lg"
            onClick={() => setLocation("/donations/donate")}
            data-testid="button-donate-now"
          >
            <Heart className="w-4 h-4 mr-2" />
            Donate Now
          </Button>
        </div>

        {/* Donation Causes Grid */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Where Your Donation Goes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {causesLoading ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                Loading causes...
              </div>
            ) : causes && causes.length > 0 ? (
              causes.map((cause) => (
                <Card
                  key={cause.id}
                  className="hover-elevate cursor-pointer transition-all"
                  data-testid={`card-cause-${cause.id}`}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {cause.iconUrl && (
                        <img
                          src={cause.iconUrl}
                          alt={cause.title}
                          className="w-6 h-6"
                        />
                      )}
                      {cause.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {cause.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No active causes at this time
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Donation Methods</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accountsLoading ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                Loading payment methods...
              </div>
            ) : accounts && accounts.length > 0 ? (
              accounts.map((account) => (
                <Card key={account.id} data-testid={`card-account-${account.id}`}>
                  <CardHeader>
                    <CardTitle>{account.accountTitle}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {account.bankName && (
                      <div>
                        <p className="text-sm text-muted-foreground">Bank</p>
                        <p className="font-medium">{account.bankName}</p>
                      </div>
                    )}
                    {account.accountNumber && (
                      <div>
                        <p className="text-sm text-muted-foreground">Account Number</p>
                        <p className="font-mono">{account.accountNumber}</p>
                      </div>
                    )}
                    {account.iban && (
                      <div>
                        <p className="text-sm text-muted-foreground">IBAN</p>
                        <p className="font-mono">{account.iban}</p>
                      </div>
                    )}
                    {account.jazzcashNumber && (
                      <div>
                        <p className="text-sm text-muted-foreground">JazzCash</p>
                        <p className="font-mono">{account.jazzcashNumber}</p>
                      </div>
                    )}
                    {account.easypaisaNumber && (
                      <div>
                        <p className="text-sm text-muted-foreground">EasyPaisa</p>
                        <p className="font-mono">{account.easypaisaNumber}</p>
                      </div>
                    )}
                    {account.qrMediaUrl && (
                      <div>
                        <p className="text-sm text-muted-foreground">QR Code</p>
                        <img
                          src={account.qrMediaUrl}
                          alt="QR Code"
                          className="w-32 h-32 border rounded"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No payment methods available
              </div>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-8 text-center space-y-4">
          <h3 className="text-2xl font-bold text-foreground">Ready to Make a Difference?</h3>
          <p className="text-muted-foreground">
            Every donation, no matter the amount, helps us provide essential health services to communities that need it most.
          </p>
          <Button
            size="lg"
            onClick={() => setLocation("/donations/donate")}
            data-testid="button-donate-cta"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Start Your Donation
          </Button>
        </div>
      </div>
    </div>
  );
}
