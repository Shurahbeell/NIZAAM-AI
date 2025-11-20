import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Ambulance, MapPin, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function FrontlinerDashboard() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [frontlinerId, setFrontlinerId] = useState<string | null>(null);

  // Get frontliner profile
  const { data: frontlinerData, isLoading: loadingFrontliner } = useQuery({
    queryKey: ["/api/frontliners/user", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await apiRequest("GET", `/api/frontliners/user/${user.id}`);
      return response as any;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (frontlinerData?.frontliner) {
      setFrontlinerId(frontlinerData.frontliner.id);
    }
  }, [frontlinerData]);

  // Get cases for frontliner
  const { data: casesData, isLoading: loadingCases } = useQuery({
    queryKey: ["/api/frontliners", frontlinerId, "cases"],
    queryFn: async () => {
      if (!frontlinerId) return { cases: [] };
      const response = await apiRequest("GET", `/api/frontliners/${frontlinerId}/cases`);
      return response as any;
    },
    enabled: !!frontlinerId,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Update case status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ caseId, status, note }: { caseId: string; status: string; note?: string }) => {
      return await apiRequest("PATCH", `/api/dispatch/${caseId}/status`, { status, note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/frontliners", frontlinerId, "cases"] });
      toast({
        title: "Status Updated",
        description: "Case status has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update case status",
        variant: "destructive",
      });
    },
  });

  const handleAction = (caseId: string, status: "ack" | "in_progress" | "completed") => {
    const statusMessages = {
      ack: "Acknowledged",
      in_progress: "En route to location",
      completed: "Completed successfully",
    };
    updateStatusMutation.mutate({ caseId, status, note: statusMessages[status] });
  };

  const cases = casesData?.cases || [];

  if (loadingFrontliner) {
    return (
      <div className="p-6">
        <div className="text-center">Loading frontliner profile...</div>
      </div>
    );
  }

  if (!frontlinerData?.frontliner) {
    return (
      <div className="p-6">
        <Card className="p-6">
          <div className="text-center">
            <Ambulance className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Frontliner Profile Not Found</h2>
            <p className="text-muted-foreground">
              You don't have a frontliner profile yet. Please contact your administrator.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const frontliner = frontlinerData.frontliner;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-page-title">
          <Ambulance className="h-8 w-8" />
          Frontliner Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage emergency cases assigned to you
        </p>
      </div>

      {/* Frontliner Info */}
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Your Profile</h3>
            <p className="text-sm text-muted-foreground">
              {frontliner.vehicleType && `Vehicle: ${frontliner.vehicleType}`}
              {frontliner.organization && ` | ${frontliner.organization}`}
            </p>
          </div>
          <Badge variant={frontliner.isAvailable ? "default" : "secondary"} data-testid={`status-available-${frontliner.isAvailable}`}>
            {frontliner.isAvailable ? "Available" : "Unavailable"}
          </Badge>
        </div>
      </Card>

      {/* Cases */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Active Cases</h2>
        <Badge variant="outline" data-testid="text-case-count">{cases.length} case(s)</Badge>
      </div>

      {loadingCases ? (
        <div className="text-center py-8 text-muted-foreground">Loading cases...</div>
      ) : cases.length === 0 ? (
        <Card className="p-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No active cases assigned to you</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
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
                    <Badge variant="outline">{emergencyCase.status}</Badge>
                  </div>

                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Location: {emergencyCase.originLat}, {emergencyCase.originLng}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Created: {new Date(emergencyCase.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {emergencyCase.status === "assigned" && (
                    <>
                      <Button
                        onClick={() => handleAction(emergencyCase.id, "ack")}
                        disabled={updateStatusMutation.isPending}
                        size="sm"
                        data-testid={`button-acknowledge-${emergencyCase.id}`}
                      >
                        Acknowledge
                      </Button>
                      <Button
                        onClick={() => handleAction(emergencyCase.id, "in_progress")}
                        disabled={updateStatusMutation.isPending}
                        variant="secondary"
                        size="sm"
                        data-testid={`button-in-progress-${emergencyCase.id}`}
                      >
                        Start Response
                      </Button>
                    </>
                  )}
                  {(emergencyCase.status === "ack" || emergencyCase.status === "in_progress") && (
                    <Button
                      onClick={() => handleAction(emergencyCase.id, "completed")}
                      disabled={updateStatusMutation.isPending}
                      variant="default"
                      size="sm"
                      data-testid={`button-complete-${emergencyCase.id}`}
                    >
                      Mark Complete
                    </Button>
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
