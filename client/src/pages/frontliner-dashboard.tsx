import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/lib/auth";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ambulance, MapPin, Clock, AlertCircle, User, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmergencyCaseWithPatient {
  id: string;
  patientId: string;
  patientName?: string;
  originLat: string;
  originLng: string;
  priority: number;
  status: string;
  createdAt: string;
  notes?: string | null;
  emergencyType?: string;
  symptoms?: string;
}

interface DirectionsMapProps {
  originLat: string;
  originLng: string;
  frontlinerLat?: string;
  frontlinerLng?: string;
}

// Directions Map Component
function DirectionsMap({ originLat, originLng, frontlinerLat, frontlinerLng }: DirectionsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);

  useEffect(() => {
    if (!mapRef.current || map) return;

    const google = (window as any).google;
    if (!google) {
      console.warn("Google Maps API not loaded");
      return;
    }

    const originLat_num = parseFloat(originLat);
    const originLng_num = parseFloat(originLng);

    // Create map centered on emergency location
    const mapInstance = new google.maps.Map(mapRef.current, {
      zoom: 15,
      center: { lat: originLat_num, lng: originLng_num },
      mapTypeControl: false,
    });

    // Mark emergency location
    new google.maps.Marker({
      position: { lat: originLat_num, lng: originLng_num },
      map: mapInstance,
      title: "Emergency Location",
      icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
    });

    // Mark frontliner location if available
    if (frontlinerLat && frontlinerLng) {
      const frontlinerLat_num = parseFloat(frontlinerLat);
      const frontlinerLng_num = parseFloat(frontlinerLng);
      new google.maps.Marker({
        position: { lat: frontlinerLat_num, lng: frontlinerLng_num },
        map: mapInstance,
        title: "Your Location",
        icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      });
    }

    setMap(mapInstance);
  }, [originLat, originLng, frontlinerLat, frontlinerLng, map]);

  return <div ref={mapRef} className="w-full h-64 rounded-lg border border-border" />;
}

// Case Card Component - Renders a single emergency case
function CaseCard({
  emergencyCase,
  frontlinerData,
  handleAction,
  updateStatusMutation,
}: {
  emergencyCase: EmergencyCaseWithPatient;
  frontlinerData: any;
  handleAction: (caseId: string, status: string) => void;
  updateStatusMutation: any;
}) {
  return (
    <Card key={emergencyCase.id} className="overflow-hidden" data-testid={`card-case-${emergencyCase.id}`}>
      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
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

            {/* Patient Name */}
            <div className="flex items-center gap-2 mb-3 bg-blue-50 dark:bg-blue-950 p-2 rounded">
              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-xs text-muted-foreground">Patient</p>
                <p className="font-semibold text-foreground" data-testid={`text-patient-name-${emergencyCase.id}`}>
                  {emergencyCase.patientName || "Unknown Patient"}
                </p>
              </div>
            </div>

            <div className="space-y-1 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Location: {emergencyCase.originLat}, {emergencyCase.originLng}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Created: {new Date(emergencyCase.createdAt).toLocaleString()}
              </div>
            </div>

            {/* Emergency Type and Symptoms */}
            {(emergencyCase.emergencyType || emergencyCase.symptoms) && (
              <div className="mt-3 mb-3 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md space-y-2">
                {emergencyCase.emergencyType && (
                  <div>
                    <p className="text-xs font-semibold text-red-900 dark:text-red-100">Emergency Type:</p>
                    <p className="text-sm text-red-900 dark:text-red-200 font-semibold">{emergencyCase.emergencyType}</p>
                  </div>
                )}
                {emergencyCase.symptoms && (
                  <div>
                    <p className="text-xs font-semibold text-red-900 dark:text-red-100">Symptoms:</p>
                    <p className="text-sm text-red-900 dark:text-red-200">{emergencyCase.symptoms}</p>
                  </div>
                )}
              </div>
            )}

            {/* Condition Description */}
            {emergencyCase.notes && (
              <div className="mt-3 mb-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md">
                <p className="text-xs font-semibold text-amber-900 dark:text-amber-100 mb-1">Patient's Detailed Description:</p>
                <p className="text-sm text-amber-900 dark:text-amber-200 whitespace-pre-wrap">{emergencyCase.notes}</p>
              </div>
            )}

            {/* Map */}
            <div className="mt-3 mb-3">
              <p className="text-xs font-semibold mb-2 text-muted-foreground">Directions to Emergency</p>
              <DirectionsMap 
                originLat={emergencyCase.originLat} 
                originLng={emergencyCase.originLng}
                frontlinerLat={frontlinerData?.frontliner?.currentLat}
                frontlinerLng={frontlinerData?.frontliner?.currentLng}
              />
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
      </div>
    </Card>
  );
}

// Tab Content Component - Renders cases for a specific status
function TabCasesContent({
  cases,
  statuses,
  frontlinerData,
  handleAction,
  updateStatusMutation,
  emptyMessage,
  limit = 3,
}: {
  cases: EmergencyCaseWithPatient[];
  statuses: string[];
  frontlinerData: any;
  handleAction: (caseId: string, status: string) => void;
  updateStatusMutation: any;
  emptyMessage: string;
  limit?: number;
}) {
  const filteredCases = cases
    .filter((c) => statuses.includes(c.status))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);

  if (filteredCases.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {filteredCases.map((emergencyCase) => (
        <CaseCard
          key={emergencyCase.id}
          emergencyCase={emergencyCase}
          frontlinerData={frontlinerData}
          handleAction={handleAction}
          updateStatusMutation={updateStatusMutation}
        />
      ))}
    </div>
  );
}

export default function FrontlinerDashboard() {
  const user = useAuthStore((state) => state.user);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [frontlinerId, setFrontlinerId] = useState<string>("");

  // Get frontliner profile
  const { data: frontlinerData, isLoading: loadingFrontliner } = useQuery({
    queryKey: ["/api/frontliners/me"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/frontliners/me");
      const data = await response.json();
      return data;
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
      const data = await response.json();
      return data;
    },
    enabled: !!frontlinerId,
    refetchInterval: 3000, // Refresh every 3 seconds
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

  const handleAction = async (caseId: string, status: string) => {
    // If status is "in_progress", find nearest hospital and assign the case
    if (status === "in_progress") {
      try {
        // Get emergency case details
        const caseResponse = await apiRequest("GET", `/api/emergency-cases/${caseId}`);
        const emergencyCase = await caseResponse.json();
        
        // Find nearest hospitals
        const hospitalsResponse = await apiRequest("GET", `/api/nearby-hospitals?lat=${emergencyCase.originLat}&lng=${emergencyCase.originLng}&limit=1`);
        const { hospitals } = await hospitalsResponse.json();
        
        if (hospitals && hospitals.length > 0) {
          const nearestHospital = hospitals[0];
          // Assign case to the nearest hospital
          await apiRequest("PATCH", `/api/emergency-cases/${caseId}/assign`, {
            assignedToType: "hospital",
            assignedToId: nearestHospital.id,
          });
          toast({
            title: "Hospital Notified",
            description: `${nearestHospital.name} has been notified about incoming patient`,
          });
        }
      } catch (error: any) {
        console.error("Failed to assign hospital:", error);
        toast({
          title: "Warning",
          description: "Could not notify hospital, continuing with status update",
          variant: "default",
        });
      }
    }

    const statusMessages: Record<string, string> = {
      ack: "Acknowledged",
      in_progress: "En route to location",
      completed: "Completed successfully",
    };
    updateStatusMutation.mutate({ caseId, status, note: statusMessages[status] || status });
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
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background pb-24">
      {/* Header with logout button */}
      <header className="sticky top-0 bg-gradient-to-r from-primary to-secondary shadow-lg z-20 backdrop-blur-sm">
        <div className="p-4 max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shadow-md">
                <Ambulance className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Frontliner Dashboard</h1>
                <p className="text-xs text-white/80">Rescue 1122</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                localStorage.removeItem("userRole");
                setLocation("/login");
              }}
              data-testid="button-logout"
              className="text-white hover:bg-white/20 gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2" data-testid="text-page-title">
            <Ambulance className="h-8 w-8" />
            Active Cases
          </h2>
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

      {/* Cases organized by status */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Emergency Cases</h2>
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
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="active" data-testid="tab-active-cases">
              Active ({cases.filter((c: EmergencyCaseWithPatient) => ["new", "assigned", "ack", "in_progress"].includes(c.status)).length})
            </TabsTrigger>
            <TabsTrigger value="completed" data-testid="tab-completed-cases">
              Completed ({cases.filter((c: EmergencyCaseWithPatient) => c.status === "completed").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <TabCasesContent
              cases={cases}
              statuses={["new", "assigned", "ack", "in_progress"]}
              frontlinerData={frontlinerData}
              handleAction={handleAction}
              updateStatusMutation={updateStatusMutation}
              emptyMessage="No active cases"
              limit={3}
            />
          </TabsContent>

          <TabsContent value="completed">
            <TabCasesContent
              cases={cases}
              statuses={["completed"]}
              frontlinerData={frontlinerData}
              handleAction={handleAction}
              updateStatusMutation={updateStatusMutation}
              emptyMessage="No completed cases"
              limit={3}
            />
          </TabsContent>
        </Tabs>
      )}
      </div>
    </div>
  );
}
