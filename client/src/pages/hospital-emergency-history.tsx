import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft, MapPin, Clock, AlertTriangle, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function HospitalEmergencyHistory() {
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const hospitalId = user?.hospitalId;

  // Fetch all emergencies to get completed ones
  const { data: allEmergencies = [] } = useQuery<any[]>({
    queryKey: ["/api/emergencies"],
    refetchInterval: 5000
  });

  // Fetch all emergencies for this hospital (both incoming and acknowledged)
  const { data: hospitalEmergencies = [] } = useQuery<any[]>({
    queryKey: [`/api/emergencies/cases/all/${hospitalId}`],
    enabled: !!hospitalId,
    refetchInterval: 5000,
  });

  // Get completed emergencies from both sources
  const completedEmergencyCases = hospitalEmergencies
    .filter((ec: any) => ec.status === "completed")
    .map((ec: any) => ({
      id: ec.id,
      patientName: ec.patientName || "Unknown",
      originLat: ec.originLat,
      originLng: ec.originLng,
      status: ec.status,
      priority: ec.priority,
      acknowledgedByHospitalId: ec.acknowledgedByHospitalId,
      acknowledgedAt: ec.acknowledgedAt,
      createdAt: ec.createdAt,
      notes: ec.notes,
      completedAt: ec.updatedAt || new Date().toISOString()
    }));

  const completedLhwEmergencies = allEmergencies
    .filter((e: any) => e.reportedByLhwId && e.status === "resolved");

  const completedEmergencies = [
    ...completedEmergencyCases,
    ...completedLhwEmergencies
  ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filteredEmergencies = completedEmergencies.filter((e: any) =>
    e.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.id.includes(searchTerm)
  );

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
            <h1 className="text-xl font-semibold text-foreground">Emergency History</h1>
            <p className="text-xs text-muted-foreground">
              {completedEmergencies.length} completed emergencies
            </p>
          </div>
          <Calendar className="w-5 h-5 text-muted-foreground" />
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Search Bar */}
        <Input
          placeholder="Search by patient name, notes, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          data-testid="input-search-history"
          className="w-full"
        />

        {/* Completed Emergencies List */}
        {filteredEmergencies.length > 0 ? (
          <div className="space-y-3">
            {filteredEmergencies.map((emergency: any) => (
              <Card
                key={emergency.id}
                className={getPriorityBg(emergency.priority)}
                data-testid={`card-completed-${emergency.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{emergency.patientName}</h3>
                            <Badge variant={getPriorityColor(emergency.priority)} className="uppercase text-xs">
                              {getPriorityLabel(emergency.priority)}
                            </Badge>
                          </div>
                          {emergency.reportedByLhwId && (
                            <Badge variant="secondary" className="capitalize text-xs">
                              Reported by LHW
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 mt-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          Reported: {new Date(emergency.createdAt).toLocaleString()}
                        </div>
                        {emergency.originLat && emergency.originLng && !emergency.reportedByLhwId && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            Coordinates: {typeof emergency.originLat === 'string' ? parseFloat(emergency.originLat).toFixed(4) : emergency.originLat.toFixed(4)}, {typeof emergency.originLng === 'string' ? parseFloat(emergency.originLng).toFixed(4) : emergency.originLng.toFixed(4)}
                          </div>
                        )}
                        {emergency.notes && (
                          <div className="mt-3 p-3 bg-white/50 rounded-md border border-border/50">
                            <p className="text-xs font-semibold text-foreground mb-1">Details:</p>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{emergency.notes}</p>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-xs text-green-600 font-semibold">
                          <div className="w-2 h-2 rounded-full bg-green-600" />
                          Completed
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">
                {completedEmergencies.length === 0
                  ? "No completed emergencies yet"
                  : "No results matching your search"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
