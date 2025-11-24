import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function VaccinationTracker() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: vaccinations, isLoading } = useQuery({
    queryKey: ["/api/lhw/vaccinations"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/lhw/vaccinations");
      if (!response.ok) throw new Error("Failed to fetch vaccinations");
      return response.json();
    },
  });

  const updateVaccine = useMutation({
    mutationFn: async ({
      vaccinationId,
      status,
    }: {
      vaccinationId: string;
      status: string;
    }) => {
      const response = await apiRequest("POST", "/api/lhw/vaccination", {
        vaccinationId,
        status,
        completedAt: status === "completed" ? new Date().toISOString() : null,
      });
      if (!response.ok) throw new Error("Failed to update vaccination");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lhw/vaccinations"] });
      toast({
        title: "Updated",
        description: "Vaccination status updated",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "missed":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const groupedVaccines =
    vaccinations?.reduce(
      (acc: Record<string, any[]>, v: any) => {
        if (!acc[v.status]) acc[v.status] = [];
        acc[v.status].push(v);
        return acc;
      },
      {}
    ) || {};

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="p-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/lhw/dashboard")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Vaccination Tracker</h1>
        </div>
      </header>

      <div className="p-4 max-w-2xl mx-auto">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : vaccinations && vaccinations.length > 0 ? (
          Object.entries(groupedVaccines || {}).map(([status, vacs]) => (
            <div key={status} className="mb-6">
              <h2 className="text-sm font-semibold mb-3 capitalize text-muted-foreground">
                {status} ({vacs.length})
              </h2>
              <div className="space-y-3">
                {vacs.map((vaccine: any) => (
                  <Card
                    key={vaccine.id}
                    className="p-4"
                    data-testid={`card-vaccine-${vaccine.id}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{vaccine.vaccine}</h3>
                        <p className="text-xs text-muted-foreground">
                          Child ID: {vaccine.childId?.substring(0, 8)}
                        </p>
                      </div>
                      <Badge className={getStatusColor(vaccine.status)}>
                        {vaccine.status}
                      </Badge>
                    </div>

                    <div className="text-xs text-muted-foreground mb-4">
                      Due: {new Date(vaccine.dueDate).toLocaleDateString()}
                    </div>

                    {status === "pending" || status === "overdue" ? (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          updateVaccine.mutateAsync({
                            vaccinationId: vaccine.id,
                            status: "completed",
                          })
                        }
                        disabled={updateVaccine.isPending}
                        data-testid={`button-complete-${vaccine.id}`}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark Completed
                      </Button>
                    ) : (
                      <div className="text-sm text-green-600 font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Completed on{" "}
                        {vaccine.completedAt &&
                          new Date(vaccine.completedAt).toLocaleDateString()}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))
        ) : (
          <Card className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">No vaccinations to track</p>
          </Card>
        )}
      </div>
    </div>
  );
}
