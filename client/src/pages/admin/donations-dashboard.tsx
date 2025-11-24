import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Heart, Users, ArrowLeft, Package } from "lucide-react";
import { useLocation } from "wouter";
import { format } from "date-fns";

interface Donation {
  id: string;
  amount: number;
  paymentMethod: string;
  causeId: string;
  userId: string;
  createdAt: string;
  receiptNumber?: string;
}

interface SupplyRequest {
  id: string;
  supplyType: string;
  quantity: number;
  priorityLevel: string;
  reason: string;
  status: string;
  lhwId: string;
  createdAt: string;
}

export default function DonationsDashboardPage() {
  const [, setLocation] = useLocation();
  const { data: donations, isLoading: donationsLoading } = useQuery<Donation[]>({
    queryKey: ["/api/donations/all"],
  });

  const { data: supplyRequests, isLoading: requestsLoading } = useQuery<SupplyRequest[]>({
    queryKey: ["/api/donations/supply-requests"],
  });

  const totalDonated = donations?.reduce((sum, d) => sum + d.amount, 0) || 0;
  const totalRequests = supplyRequests?.length || 0;
  const pendingRequests = supplyRequests?.filter((r) => r.status === "pending").length || 0;

  const getPriorityColor = (level: string) => {
    if (level === "high") return "destructive";
    if (level === "medium") return "default";
    return "secondary";
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/admin-dashboard")}
          data-testid="button-back-admin"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Donations & Supplies Dashboard</h1>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card data-testid="card-total-donations">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Total Donated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">PKR {totalDonated.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{donations?.length || 0} donations</p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-requests">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="w-4 h-4" />
              Supply Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
            <p className="text-xs text-muted-foreground">{pendingRequests} pending</p>
          </CardContent>
        </Card>

        <Card data-testid="card-pending-allocations">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRequests > 0 ? Math.round(((totalRequests - pendingRequests) / totalRequests) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Fulfilled requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Donations Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-600" />
            All Donations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {donationsLoading ? (
            <p className="text-muted-foreground text-center py-8">Loading donations...</p>
          ) : donations && donations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Amount</th>
                    <th className="text-left py-2">Payment Method</th>
                    <th className="text-left py-2">Receipt</th>
                    <th className="text-left py-2">Donor ID</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((donation) => (
                    <tr key={donation.id} className="border-b hover:bg-muted/50" data-testid={`row-donation-${donation.id}`}>
                      <td className="py-3">{format(new Date(donation.createdAt), "PPP")}</td>
                      <td className="py-3 font-semibold text-primary">PKR {donation.amount.toLocaleString()}</td>
                      <td className="py-3">{donation.paymentMethod.replace(/_/g, " ")}</td>
                      <td className="py-3">{donation.receiptNumber || "-"}</td>
                      <td className="py-3 text-xs text-muted-foreground">{donation.userId ? donation.userId.slice(0, 8) : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No donations yet</p>
          )}
        </CardContent>
      </Card>

      {/* Supply Requests Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-600" />
            Supply Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requestsLoading ? (
            <p className="text-muted-foreground text-center py-8">Loading supply requests...</p>
          ) : supplyRequests && supplyRequests.length > 0 ? (
            <div className="space-y-3">
              {supplyRequests.map((request) => (
                <Card key={request.id} className="p-4" data-testid={`card-request-${request.id}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold capitalize">{request.supplyType.replace(/_/g, " ")}</h4>
                      <p className="text-sm text-muted-foreground">LHW: {request.lhwId ? request.lhwId.slice(0, 8) : "-"}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={getPriorityColor(request.priorityLevel)}>
                        {request.priorityLevel.charAt(0).toUpperCase() + request.priorityLevel.slice(1)}
                      </Badge>
                      <Badge variant={request.status === "pending" ? "destructive" : request.status === "approved" ? "default" : "secondary"}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Quantity:</span> {request.quantity} units</p>
                    <p><span className="font-medium">Reason:</span> {request.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      Requested: {format(new Date(request.createdAt), "PPP p")}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No supply requests yet</p>
          )}
        </CardContent>
      </Card>

      {/* Request Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Request Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {supplyRequests && supplyRequests.length > 0 ? (
              Object.entries(
                supplyRequests.reduce((acc, req) => {
                  acc[req.status] = (acc[req.status] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <span className="capitalize text-foreground font-medium">{status}</span>
                  <span className="text-lg font-semibold">{count}</span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No requests yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Priority Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Request Priority Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {supplyRequests && supplyRequests.length > 0 ? (
              Object.entries(
                supplyRequests.reduce((acc, req) => {
                  acc[req.priorityLevel] = (acc[req.priorityLevel] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              )
                .sort((a, b) => {
                  const order = { high: 0, medium: 1, low: 2 };
                  return (order[a[0] as keyof typeof order] || 999) - (order[b[0] as keyof typeof order] || 999);
                })
                .map(([priority, count]) => (
                  <div key={priority} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <span className="capitalize text-foreground font-medium">{priority} Priority</span>
                    <span className="text-lg font-semibold">{count}</span>
                  </div>
                ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No requests yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
