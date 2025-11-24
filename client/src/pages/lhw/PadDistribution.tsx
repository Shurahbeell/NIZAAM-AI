import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMenstrualPadRequests } from "@/lib/useLHWData";
import { useLocation } from "wouter";
import { ArrowLeft, Package, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PadDistribution() {
  const [, setLocation] = useLocation();
  const { data: requests, isLoading } = useMenstrualPadRequests();

  const pendingRequests = requests?.filter((r) => r.status === "pending") || [];
  const approvedRequests = requests?.filter((r) => r.status === "approved") || [];
  const deliveredRequests = requests?.filter((r) => r.status === "delivered") || [];

  const totalPadsRequested = requests?.reduce((sum, r) => sum + r.quantityRequested, 0) || 0;
  const totalPadsDelivered =
    deliveredRequests.reduce((sum, r) => sum + r.quantityRequested, 0) || 0;

  const RequestCard = ({ request }: { request: any }) => {
    const getIcon = () => {
      if (request.status === "pending") return <Clock className="w-4 h-4" />;
      if (request.status === "approved") return <AlertCircle className="w-4 h-4" />;
      return <CheckCircle className="w-4 h-4" />;
    };

    const getColor = () => {
      if (request.status === "pending") return "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800";
      if (request.status === "approved") return "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800";
      return "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800";
    };

    return (
      <div className={`p-4 rounded-lg border ${getColor()}`} data-testid={`card-request-${request.id}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getIcon()}
            <h4 className="font-semibold">Request #{request.id.slice(0, 8)}</h4>
          </div>
          <Badge
            variant={request.status === "pending" ? "destructive" : request.status === "approved" ? "default" : "outline"}
          >
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Household:</span> {request.householdId}
          </p>
          <p>
            <span className="font-medium">Quantity:</span> {request.quantityRequested} pads
          </p>
          <p>
            <span className="font-medium">Urgency:</span>
            <Badge
              variant="outline"
              className="ml-2"
              data-testid={`badge-urgency-${request.urgencyLevel}`}
            >
              {request.urgencyLevel.charAt(0).toUpperCase() + request.urgencyLevel.slice(1)}
            </Badge>
          </p>
          <p className="text-xs text-muted-foreground">
            Requested: {new Date(request.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/lhw/menstrual-hub")} data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">Sanitary Pad Distribution</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Requested</p>
                <p className="text-2xl font-bold">{totalPadsRequested}</p>
              </div>
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold">{totalPadsDelivered}</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingRequests.length}</p>
              </div>
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Completion %</p>
                <p className="text-2xl font-bold">
                  {requests && requests.length > 0
                    ? Math.round((deliveredRequests.length / requests.length) * 100)
                    : 0}
                  %
                </p>
              </div>
              <AlertCircle className="w-6 h-6 text-purple-600" />
            </div>
          </Card>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              Pending Requests ({pendingRequests.length})
            </h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {pendingRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          </div>
        )}

        {/* Approved Requests */}
        {approvedRequests.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              Approved - Ready to Distribute ({approvedRequests.length})
            </h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {approvedRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          </div>
        )}

        {/* Delivered Requests */}
        {deliveredRequests.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Completed Deliveries ({deliveredRequests.length})
            </h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {deliveredRequests.slice(0, 4).map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : requests && requests.length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No pad requests yet</p>
            <Button onClick={() => setLocation("/lhw/menstrual-profile")}>
              Go to Household Profiles
            </Button>
          </Card>
        ) : null}

        {/* Action Button */}
        <div className="mt-6">
          <Button className="w-full" onClick={() => setLocation("/lhw/menstrual-hub")} data-testid="button-back-hub">
            Back to Menstrual Hygiene Hub
          </Button>
        </div>
      </div>
    </div>
  );
}
