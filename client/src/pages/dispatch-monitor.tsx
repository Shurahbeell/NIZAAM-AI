import { useAuthStore } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Activity, MapPin, Clock, User, Ambulance, Building2 } from "lucide-react";

export default function DispatchMonitor() {
  const { user } = useAuthStore();

  // Get all emergency cases
  const { data: casesData, isLoading } = useQuery({
    queryKey: ["/api/dispatch/cases"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/dispatch/cases");
      return response as any;
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const cases = casesData?.cases || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "destructive";
      case "assigned":
        return "default";
      case "ack":
        return "secondary";
      case "in_progress":
        return "default";
      case "completed":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-page-title">
          <Activity className="h-8 w-8" />
          Dispatch Monitor
        </h1>
        <p className="text-muted-foreground mt-2">
          Real-time view of all emergency cases
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Cases</div>
          <div className="text-2xl font-bold" data-testid="text-total-cases">{cases.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">New Cases</div>
          <div className="text-2xl font-bold text-destructive" data-testid="text-new-cases">
            {cases.filter((c: any) => c.status === "new").length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">In Progress</div>
          <div className="text-2xl font-bold text-primary" data-testid="text-in-progress-cases">
            {cases.filter((c: any) => c.status === "in_progress").length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Completed</div>
          <div className="text-2xl font-bold text-muted-foreground" data-testid="text-completed-cases">
            {cases.filter((c: any) => c.status === "completed").length}
          </div>
        </Card>
      </div>

      {/* Cases List */}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">All Emergency Cases</h2>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading cases...</div>
      ) : cases.length === 0 ? (
        <Card className="p-8">
          <div className="text-center text-muted-foreground">
            No emergency cases found
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {cases.map((emergencyCase: any) => (
            <Card key={emergencyCase.id} className="p-4" data-testid={`card-case-${emergencyCase.id}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold" data-testid={`text-case-id-${emergencyCase.id}`}>
                      Case #{emergencyCase.id.substring(0, 8)}
                    </h3>
                    <Badge variant={emergencyCase.priority >= 3 ? "destructive" : "secondary"}>
                      Priority {emergencyCase.priority}
                    </Badge>
                    <Badge variant={getStatusColor(emergencyCase.status)}>
                      {emergencyCase.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      Patient: {emergencyCase.patientId.substring(0, 8)}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {emergencyCase.originLat}, {emergencyCase.originLng}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(emergencyCase.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {emergencyCase.assignedToType && (
                    <div className="mt-2 flex items-center gap-1 text-sm">
                      {emergencyCase.assignedToType === "frontliner" ? (
                        <Ambulance className="h-4 w-4 text-primary" />
                      ) : (
                        <Building2 className="h-4 w-4 text-primary" />
                      )}
                      <span className="text-muted-foreground">
                        Assigned to {emergencyCase.assignedToType}: {emergencyCase.assignedToId.substring(0, 8)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
