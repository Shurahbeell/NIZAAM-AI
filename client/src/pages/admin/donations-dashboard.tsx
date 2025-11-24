import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Heart, Users } from "lucide-react";

interface Donation {
  id: string;
  amount: number;
  causeId: string;
  createdAt: string;
}

interface SupplyRequest {
  id: string;
  status: string;
  priorityLevel: string;
}

export default function DonationsDashboardPage() {
  const { data: donations } = useQuery<Donation[]>({
    queryKey: ["/api/donations/all"],
  });

  const { data: supplyRequests } = useQuery<SupplyRequest[]>({
    queryKey: ["/api/donations/supply-requests"],
  });

  const totalDonated = donations?.reduce((sum, d) => sum + d.amount, 0) || 0;
  const totalRequests = supplyRequests?.length || 0;
  const pendingRequests = supplyRequests?.filter((r) => r.status === "pending").length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Donations Dashboard</h1>
        <p className="text-muted-foreground">Track donations and allocations</p>
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
            <p className="text-xs text-muted-foreground">From all donors</p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-requests">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Supply Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
            <p className="text-xs text-muted-foreground">{pendingRequests} pending</p>
          </CardContent>
        </Card>

        <Card data-testid="card-pending-requests">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Pending Allocations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests}</div>
            <p className="text-xs text-muted-foreground">Awaiting admin review</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
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
                  <span className="capitalize text-foreground">{status}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No requests yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Priority Overview */}
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
                    <span className="font-semibold">{count}</span>
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
