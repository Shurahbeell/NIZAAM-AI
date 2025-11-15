import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, AlertTriangle, MapPin, Phone, User, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, queryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Emergency {
  id: string;
  patientName: string;
  patientPhone: string;
  location: string;
  emergencyType: string;
  priority: "critical" | "high" | "medium" | "low";
  symptoms: string;
  status: "active" | "responding" | "resolved";
  createdAt: string;
}

export default function HospitalEmergencies() {
  const [, setLocation] = useLocation();

  // Fetch emergencies with polling
  const { data: emergencies = [], isLoading } = useQuery<Emergency[]>({
    queryKey: ["/api/emergencies"],
    refetchInterval: 5000 // Poll every 5 seconds
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest(`/api/emergencies/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emergencies"] });
    }
  });

  const updateStatus = (id: string, status: Emergency["status"]) => {
    updateStatusMutation.mutate({ id, status });
  };

  const getPriorityColor = (priority: Emergency["priority"]) => {
    switch (priority) {
      case "critical": return "destructive";
      case "high": return "default";
      case "medium": return "outline";
      case "low": return "secondary";
    }
  };

  const getPriorityBg = (priority: Emergency["priority"]) => {
    switch (priority) {
      case "critical": return "bg-destructive/10 border-destructive";
      case "high": return "bg-orange-500/10 border-orange-500/20";
      case "medium": return "bg-yellow-500/10 border-yellow-500/20";
      case "low": return "bg-blue-500/10 border-blue-500/20";
    }
  };

  const getStatusColor = (status: Emergency["status"]) => {
    switch (status) {
      case "active": return "destructive";
      case "responding": return "default";
      case "resolved": return "secondary";
    }
  };

  const filterByPriority = (priority?: Emergency["priority"]) => {
    if (!priority) return emergencies;
    return emergencies.filter(e => e.priority === priority);
  };

  const filterByStatus = (status?: Emergency["status"]) => {
    if (!status) return emergencies;
    return emergencies.filter(e => e.status === status);
  };

  const sortedEmergencies = isLoading ? [] : [...emergencies].sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const activeCount = emergencies.filter(e => e.status === "active").length;
  const criticalCount = emergencies.filter(e => e.priority === "critical" && e.status === "active").length;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="p-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/hospital/dashboard")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground">Emergency Tracking</h1>
            <p className="text-xs text-muted-foreground">
              {activeCount} active • {criticalCount} critical
            </p>
          </div>
          {activeCount > 0 && (
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

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" data-testid="tab-all">
              All ({emergencies.length})
            </TabsTrigger>
            <TabsTrigger value="critical" data-testid="tab-critical">
              Critical ({filterByPriority("critical").length})
            </TabsTrigger>
            <TabsTrigger value="high" data-testid="tab-high">
              High ({filterByPriority("high").length})
            </TabsTrigger>
            <TabsTrigger value="active" data-testid="tab-active">
              Active ({filterByStatus("active").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {sortedEmergencies.map((emergency) => (
              <Card
                key={emergency.id}
                className={getPriorityBg(emergency.priority)}
                data-testid={`emergency-card-${emergency.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      emergency.priority === "critical" ? "bg-destructive/20 animate-pulse" : "bg-primary/10"
                    }`}>
                      <AlertTriangle className={`w-5 h-5 ${
                        emergency.priority === "critical" ? "text-destructive" : "text-primary"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{emergency.patientName}</h3>
                            <Badge variant={getPriorityColor(emergency.priority)} className="uppercase text-xs">
                              {emergency.priority}
                            </Badge>
                          </div>
                          <Badge variant={getStatusColor(emergency.status)} className="capitalize">
                            {emergency.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2 mt-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="w-4 h-4" />
                          {emergency.patientPhone}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {emergency.location}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {new Date(emergency.createdAt).toLocaleString()}
                        </div>
                        <div className="p-2 bg-muted/50 rounded text-sm">
                          <p className="font-semibold text-foreground">Emergency Type:</p>
                          <p className="text-muted-foreground capitalize">{emergency.emergencyType.replace("-", " ")}</p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded text-sm">
                          <p className="font-semibold text-foreground">Symptoms:</p>
                          <p className="text-muted-foreground">{emergency.symptoms}</p>
                        </div>
                      </div>

                      {emergency.status === "active" && (
                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            onClick={() => updateStatus(emergency.id, "responding")}
                            data-testid={`button-respond-${emergency.id}`}
                          >
                            Respond
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              window.open(`tel:${emergency.patientPhone}`);
                            }}
                            data-testid={`button-call-${emergency.id}`}
                          >
                            <Phone className="w-4 h-4 mr-1" />
                            Call
                          </Button>
                        </div>
                      )}

                      {emergency.status === "responding" && (
                        <Button
                          size="sm"
                          className="mt-4"
                          onClick={() => updateStatus(emergency.id, "resolved")}
                          data-testid={`button-resolve-${emergency.id}`}
                        >
                          Mark as Resolved
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {emergencies.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">No emergencies reported</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="critical" className="space-y-3">
            {filterByPriority("critical").map((emergency) => (
              <Card
                key={emergency.id}
                className={getPriorityBg(emergency.priority)}
                data-testid={`emergency-card-${emergency.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{emergency.patientName}</h3>
                            <Badge variant="destructive" className="uppercase text-xs">CRITICAL</Badge>
                          </div>
                          <Badge variant={getStatusColor(emergency.status)} className="capitalize">
                            {emergency.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2 mt-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="w-4 h-4" />
                          {emergency.patientPhone}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {emergency.location}
                        </div>
                        <div className="p-2 bg-muted/50 rounded text-sm">
                          <p className="font-semibold text-foreground">Symptoms:</p>
                          <p className="text-muted-foreground">{emergency.symptoms}</p>
                        </div>
                      </div>

                      {emergency.status === "active" && (
                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            onClick={() => updateStatus(emergency.id, "responding")}
                            data-testid={`button-respond-${emergency.id}`}
                          >
                            Respond Now
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`tel:${emergency.patientPhone}`)}
                            data-testid={`button-call-${emergency.id}`}
                          >
                            <Phone className="w-4 h-4 mr-1" />
                            Call
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filterByPriority("critical").length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No critical emergencies</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="high" className="space-y-3">
            {filterByPriority("high").map((emergency) => (
              <Card
                key={emergency.id}
                className={getPriorityBg(emergency.priority)}
                data-testid={`emergency-card-${emergency.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">{emergency.patientName}</h3>
                        <Badge variant="default" className="uppercase text-xs">HIGH</Badge>
                        <Badge variant={getStatusColor(emergency.status)} className="capitalize">
                          {emergency.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{emergency.symptoms}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filterByPriority("high").length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No high priority emergencies</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-3">
            {filterByStatus("active").map((emergency) => (
              <Card
                key={emergency.id}
                className={getPriorityBg(emergency.priority)}
                data-testid={`emergency-card-${emergency.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      emergency.priority === "critical" ? "bg-destructive/20 animate-pulse" : "bg-primary/10"
                    }`}>
                      <AlertTriangle className={`w-5 h-5 ${
                        emergency.priority === "critical" ? "text-destructive" : "text-primary"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">{emergency.patientName}</h3>
                        <Badge variant={getPriorityColor(emergency.priority)} className="uppercase text-xs">
                          {emergency.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{emergency.symptoms}</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateStatus(emergency.id, "responding")}
                          data-testid={`button-respond-${emergency.id}`}
                        >
                          Respond
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`tel:${emergency.patientPhone}`)}
                          data-testid={`button-call-${emergency.id}`}
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          Call
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filterByStatus("active").length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No active emergencies</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
