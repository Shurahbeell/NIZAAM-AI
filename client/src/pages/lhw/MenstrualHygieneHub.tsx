import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Users, Activity, BookOpen, Package, LogOut } from "lucide-react";
import { useMenstrualDashboardStats, useMenstrualPadRequests, useLHWHouseholds } from "@/lib/useLHWData";
import { Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/lib/auth";
import { useLocation } from "wouter";

export default function MenstrualHygieneHub() {
  const { logout } = useAuthStore();
  const [, setLocation] = useLocation();
  const { data: stats, isLoading: statsLoading } = useMenstrualDashboardStats();
  const { data: requests, isLoading: requestsLoading } = useMenstrualPadRequests();
  const { data: households } = useLHWHouseholds();

  const statCards = [
    {
      label: "Households Tracked",
      value: stats?.householdsTracked || 0,
      icon: Users,
      color: "text-blue-600",
    },
    {
      label: "Using Unsafe Materials",
      value: stats?.householdsUsingUnsafeMaterials || 0,
      icon: AlertTriangle,
      color: "text-red-600",
    },
    {
      label: "Pending Pad Requests",
      value: stats?.pendingPadRequests || 0,
      icon: Package,
      color: "text-amber-600",
    },
    {
      label: "Education Sessions",
      value: stats?.educationSessionsHeld || 0,
      icon: BookOpen,
      color: "text-green-600",
    },
    {
      label: "Pads Delivered",
      value: stats?.padsDelivered || 0,
      icon: Activity,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-gradient-to-r from-primary to-secondary shadow-lg z-20">
        <div className="p-4 max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-white">Menstrual Hygiene Support</h1>
              <p className="text-xs text-white/80">LHW Management Module</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                logout();
                setLocation("/login");
              }}
              className="text-white hover:bg-white/20"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 max-w-6xl mx-auto">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6 md:grid-cols-5">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-3" data-testid={`card-${stat.label.replace(" ", "-").toLowerCase()}`}>
                {statsLoading ? (
                  <Skeleton className="h-16 w-full" />
                ) : (
                  <>
                    <div className="flex flex-col items-center text-center">
                      <Icon className={`w-6 h-6 ${stat.color} mb-2`} />
                      <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  </>
                )}
              </Card>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button
            className="w-full"
            onClick={() => setLocation("/lhw/menstrual-profile")}
            data-testid="button-household-profile"
          >
            <Users className="w-4 h-4 mr-2" />
            Household Profiles
          </Button>
          <Button
            className="w-full"
            onClick={() => setLocation("/lhw/menstrual-education")}
            variant="outline"
            data-testid="button-education"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Education Sessions
          </Button>
          <Button
            className="w-full"
            onClick={() => setLocation("/lhw/pad-distribution")}
            variant="outline"
            data-testid="button-distribution"
          >
            <Package className="w-4 h-4 mr-2" />
            Pad Distribution
          </Button>
          <Button
            className="w-full"
            onClick={() => setLocation("/lhw/menstrual-advisor")}
            variant="secondary"
            data-testid="button-ai-advisor"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Advisor
          </Button>
          <Button
            className="w-full col-span-2"
            onClick={() => setLocation("/lhw/dashboard")}
            variant="outline"
            data-testid="button-back"
          >
            Back to Dashboard
          </Button>
        </div>

        {/* Pending Requests Alert */}
        {(requests?.filter((r) => r.status === "pending").length || 0) > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {requests?.filter((r) => r.status === "pending").length || 0} pending pad request(s) need attention
            </AlertDescription>
          </Alert>
        )}

        {/* High Risk Households */}
        {(stats?.householdsUsingUnsafeMaterials || 0) > 0 && (
          <Card className="p-4 mb-6 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
            <h3 className="font-semibold text-red-900 dark:text-red-300 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              High-Risk Households
            </h3>
            <p className="text-sm text-red-700 dark:text-red-400 mb-3">
              {stats?.householdsUsingUnsafeMaterials} household(s) identified using unsafe menstrual materials. Priority education and pad support needed.
            </p>
            <Button
              size="sm"
              onClick={() => setLocation("/lhw/menstrual-profile")}
              className="w-full"
              data-testid="button-view-profiles"
            >
              View All Profiles
            </Button>
          </Card>
        )}

        {/* Recent Requests */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2" data-testid="text-recent-requests">
            <Package className="w-4 h-4" />
            Recent Pad Requests
          </h3>
          {requestsLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : requests && requests.length > 0 ? (
            <div className="space-y-2">
              {requests.slice(0, 5).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex-1">
                    <p className="text-sm font-medium">Request for {request.quantityRequested} pads</p>
                    <p className="text-xs text-muted-foreground">Household: {request.householdId}</p>
                  </div>
                  <Badge variant={request.status === "pending" ? "destructive" : "default"}>
                    {request.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No pad requests yet</p>
          )}
        </Card>
      </div>
    </div>
  );
}
