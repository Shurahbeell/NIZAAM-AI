import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, AlertTriangle, MapPin, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

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
}

// For display purposes
interface Emergency extends IncomingEmergency {
  emergencyType?: string;
  symptoms?: string;
}

export default function HospitalEmergencies() {
  const [, setLocation] = useLocation();
  const hospitalId = "4cd3d7c3-5e08-4086-89ec-a9610267a2f1"; // TODO: Get from user context

  // Fetch incoming emergencies for this hospital with polling
  const { data = [], isLoading } = useQuery<IncomingEmergency[]>({
    queryKey: ["/api/hospital", hospitalId, "incoming-emergencies"],
    refetchInterval: 3000 // Poll every 3 seconds
  });
  
  // Ensure data is always an array
  const emergencies = Array.isArray(data) ? data : [];

  // Acknowledge emergency case notification mutation
  const acknowledgeMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/emergency-cases/${id}/acknowledge`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hospitalId })
      });
      if (!response.ok) throw new Error("Failed to acknowledge emergency");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hospital", hospitalId, "incoming-emergencies"] });
    }
  });

  const acknowledgeEmergency = (id: string) => {
    acknowledgeMutation.mutate(id);
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
    return emergencies.filter(e => !e.acknowledgedByHospitalId);
  };

  const filterAcknowledged = () => {
    return emergencies.filter(e => e.acknowledgedByHospitalId);
  };

  const incomingCount = filterIncoming().length;
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="incoming" data-testid="tab-incoming">
              Incoming ({filterIncoming().length})
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
                      </div>

                      <Button
                        size="sm"
                        className="mt-4"
                        onClick={() => acknowledgeEmergency(emergency.id)}
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
