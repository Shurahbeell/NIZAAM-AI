import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, AlertTriangle, MapPin, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/lib/useLanguage";
import { useAuthStore } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface IncomingEmergency {
  id: string;
  patientId: string;
  patientName: string;
  originLat: string;
  originLng: string;
  status: "assigned" | "ack" | "in_progress" | "completed";
  priority: number;
  acknowledgedByHospitalId?: string | null;
  acknowledgedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  notes?: string | null;
}

// For display purposes
interface Emergency extends IncomingEmergency {
  emergencyType?: string;
  symptoms?: string;
  reportedByLhwId?: string | null;
}

export default function HospitalEmergencies() {
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const hospitalId = user?.hospitalId || "";

  // Fetch incoming emergencies for this hospital with polling
  const { data = [], isLoading } = useQuery<any[]>({
    queryKey: [`/api/emergencies/cases/incoming/${hospitalId}`],
    enabled: !!hospitalId,
    refetchInterval: 3000 // Poll every 3 seconds
  });
  
  // Fetch all emergencies from main emergencies table (includes LHW reports)
  const { data: allEmergencies = [] } = useQuery<Emergency[]>({
    queryKey: [`/api/emergencies`],
    enabled: !!hospitalId,
    refetchInterval: 3000 // Poll every 3 seconds
  });

  // Transform emergency_cases to match Emergency interface
  const emergencyCases = Array.isArray(data) ? data.map((ec: any) => ({
    id: ec.id,
    patientId: ec.patientId,
    patientName: ec.patientName || "Unknown",
    originLat: ec.originLat,
    originLng: ec.originLng,
    status: ec.status,
    priority: ec.priority,
    acknowledgedByHospitalId: null,
    acknowledgedAt: null,
    createdAt: ec.createdAt,
    notes: ec.notes
  })) : [];

  // Only get LHW emergencies from allEmergencies and add to cases
  const lhwEmergencies = Array.isArray(allEmergencies) 
    ? allEmergencies.filter(e => e.reportedByLhwId)
    : [];

  // Combine: regular cases + LHW reports
  const emergencies = [
    ...emergencyCases,
    ...lhwEmergencies
  ];

  // Acknowledge emergency case notification mutation
  const acknowledgeMutation = useMutation({
    mutationFn: async (emergency: any) => {
      // Check if this is an LHW emergency (has reportedByLhwId)
      if (emergency.reportedByLhwId) {
        // Use main emergencies endpoint for LHW emergencies
        const response = await apiRequest("PATCH", `/api/emergencies/${emergency.id}/acknowledge`, { hospitalId });
        return response.json();
      } else {
        // Use emergency cases endpoint for regular emergencies
        const response = await apiRequest("PATCH", `/api/emergencies/cases/${emergency.id}/acknowledge`, { hospitalId });
        return response.json();
      }
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Emergency acknowledged" });
      queryClient.invalidateQueries({ queryKey: [`/api/emergencies/cases/incoming/${hospitalId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/emergencies`] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to acknowledge emergency", variant: "destructive" });
    }
  });

  const acknowledgeEmergency = (emergency: any) => {
    acknowledgeMutation.mutate(emergency);
  };

  // Complete emergency case mutation
  const completeMutation = useMutation({
    mutationFn: async (emergency: any) => {
      // Check if this is an LHW emergency (has reportedByLhwId)
      if (emergency.reportedByLhwId) {
        // Use main emergencies endpoint for LHW emergencies
        const response = await apiRequest("PATCH", `/api/emergencies/${emergency.id}/complete`, {});
        return response.json();
      } else {
        // Use emergency cases endpoint for regular emergencies
        const response = await apiRequest("PATCH", `/api/emergencies/cases/${emergency.id}/complete`, {});
        return response.json();
      }
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Emergency marked as completed" });
      queryClient.invalidateQueries({ queryKey: [`/api/emergencies/cases/incoming/${hospitalId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/emergencies`] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to complete emergency", variant: "destructive" });
    }
  });

  const completeEmergency = (emergency: any) => {
    completeMutation.mutate(emergency);
  };

  const getPriorityColor = (priority: number) => {
    if (priority <= 1) return "destructive";
    if (priority === 2) return "default";
    if (priority === 3) return "outline";
    return "secondary";
  };

  const getPriorityBg = (priority: number) => {
    if (priority <= 1) return "bg-destructive/10 border-destructive";
    if (priority === 2) return "bg-orange-500/10 border-orange-500/20";
    if (priority === 3) return "bg-yellow-500/10 border-yellow-500/20";
    return "bg-blue-500/10 border-blue-500/20";
  };

  const getPriorityLabel = (priority: number) => {
    if (priority <= 1) return "CRITICAL";
    if (priority === 2) return "HIGH";
    if (priority === 3) return "MEDIUM";
    return "LOW";
  };

  const filterIncoming = () => {
    return emergencies.filter(e => !e.acknowledgedByHospitalId && e.status !== "resolved");
  };

  const filterAcknowledged = () => {
    return emergencies.filter(e => e.acknowledgedByHospitalId && e.status !== "resolved");
  };

  const filterLhwEmergencies = () => {
    return emergencies.filter(e => e.reportedByLhwId && e.status !== "resolved");
  };

  const incomingCount = filterIncoming().length;
  const lhwCount = filterLhwEmergencies().length;
  const criticalCount = emergencies.filter(e => e.priority <= 1 && !e.acknowledgedByHospitalId).length;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="p-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/hospital-dashboard")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground">Emergency Tracking</h1>
            <p className="text-xs text-muted-foreground">
              {incomingCount} incoming • {criticalCount} critical
            </p>
          </div>
          {incomingCount > 0 && (
            <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
          )}
        </div>
      </header>

      <div className="p-4">
        {criticalCount > 0 && (
          <Card className="mb-4 border-destructive bg-destructive/10">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 animate-pulse" />
              <div>
                <p className="font-semibold text-foreground">
                  {criticalCount} Critical Emergency Alert{criticalCount > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-muted-foreground">Immediate response required</p>
              </div>
            </CardContent>
          </Card>
        )}

        {filterIncoming().length > 0 && (
          <Card className="mb-4 border-destructive bg-destructive/10">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 animate-pulse" />
              <div>
                <p className="font-semibold text-foreground">
                  {filterIncoming().length} Incoming Emergency{filterIncoming().length > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-muted-foreground">Click Acknowledge to dismiss notification</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="incoming" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="incoming" data-testid="tab-incoming">
              Incoming ({filterIncoming().length})
            </TabsTrigger>
            <TabsTrigger value="lhw" data-testid="tab-lhw">
              LHW Emergency ({lhwCount})
            </TabsTrigger>
            <TabsTrigger value="acknowledged" data-testid="tab-acknowledged">
              Acknowledged ({filterAcknowledged().length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incoming" className="space-y-3">
            {filterIncoming().map((emergency) => (
              <Card
                key={emergency.id}
                className={getPriorityBg(emergency.priority)}
                data-testid={`emergency-card-${emergency.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      emergency.priority <= 1 ? "bg-destructive/20 animate-pulse" : "bg-primary/10"
                    }`}>
                      <AlertTriangle className={`w-5 h-5 ${
                        emergency.priority <= 1 ? "text-destructive" : "text-primary"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{emergency.patientName || "Unknown Patient"}</h3>
                            <Badge variant={getPriorityColor(emergency.priority)} className="uppercase text-xs">
                              {getPriorityLabel(emergency.priority)}
                            </Badge>
                          </div>
                          <Badge variant="default" className="capitalize">
                            In Progress
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2 mt-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          Lat: {emergency.originLat}, Lng: {emergency.originLng}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {new Date(emergency.createdAt).toLocaleString()}
                        </div>
                        {emergency.notes && (
                          <div className="mt-3 p-3 bg-white/50 rounded-md border border-border/50">
                            <p className="text-xs font-semibold text-foreground mb-1">Patient's Description:</p>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{emergency.notes}</p>
                          </div>
                        )}
                      </div>

                      <Button
                        size="sm"
                        className="mt-4"
                        onClick={() => acknowledgeEmergency(emergency)}
                        data-testid={`button-acknowledge-${emergency.id}`}
                        disabled={acknowledgeMutation.isPending}
                      >
                        {acknowledgeMutation.isPending ? "Acknowledging..." : "Acknowledge"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filterIncoming().length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">No incoming emergencies</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="lhw" className="space-y-3">
            {filterLhwEmergencies().map((emergency) => (
              <Card
                key={emergency.id}
                className={getPriorityBg(emergency.priority)}
                data-testid={`emergency-card-lhw-${emergency.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{emergency.patientName || "Unknown Patient"}</h3>
                            <Badge variant={getPriorityColor(emergency.priority)} className="uppercase text-xs">
                              {getPriorityLabel(emergency.priority)}
                            </Badge>
                          </div>
                          <Badge variant="secondary" className="capitalize">
                            Reported by LHW
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2 mt-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {emergency.location || "No location provided"}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {new Date(emergency.createdAt).toLocaleString()}
                        </div>
                        {emergency.notes && (
                          <div className="mt-3 p-3 bg-white/50 rounded-md border border-border/50">
                            <p className="text-xs font-semibold text-foreground mb-1">Description:</p>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{emergency.notes}</p>
                          </div>
                        )}
                        <Button
                          size="sm"
                          className="mt-4"
                          onClick={() => acknowledgeEmergency(emergency)}
                          data-testid={`button-acknowledge-lhw-${emergency.id}`}
                          disabled={acknowledgeMutation.isPending}
                        >
                          {acknowledgeMutation.isPending ? "Acknowledging..." : "Acknowledge"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filterLhwEmergencies().length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">No LHW emergency reports</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="acknowledged" className="space-y-3">
            {filterAcknowledged().map((emergency) => (
              <Card
                key={emergency.id}
                className={getPriorityBg(emergency.priority)}
                data-testid={`emergency-card-ack-${emergency.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{emergency.patientName || "Unknown Patient"}</h3>
                            <Badge variant={getPriorityColor(emergency.priority)} className="uppercase text-xs">
                              {getPriorityLabel(emergency.priority)}
                            </Badge>
                          </div>
                          <Badge variant="secondary" className="capitalize">
                            Acknowledged
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2 mt-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          Lat: {emergency.originLat}, Lng: {emergency.originLng}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          Acknowledged: {new Date(emergency.acknowledgedAt!).toLocaleString()}
                        </div>
                        {emergency.notes && (
                          <div className="mt-3 p-3 bg-white/50 rounded-md border border-border/50">
                            <p className="text-xs font-semibold text-foreground mb-1">Patient's Description:</p>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{emergency.notes}</p>
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant="default"
                          className="mt-4"
                          onClick={() => completeEmergency(emergency)}
                          data-testid={`button-complete-${emergency.id}`}
                          disabled={completeMutation.isPending}
                        >
                          {completeMutation.isPending ? "Completing..." : "Mark Completed"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filterAcknowledged().length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">No acknowledged emergencies</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
