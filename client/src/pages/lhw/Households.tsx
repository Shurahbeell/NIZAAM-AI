import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Users } from "lucide-react";
import { useLHWHouseholds } from "@/lib/useLHWData";
import { Skeleton } from "@/components/ui/skeleton";

export default function Households() {
  const [, setLocation] = useLocation();
  const { data: households, isLoading } = useLHWHouseholds();

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
          <div>
            <h1 className="text-lg font-semibold">Assigned Households</h1>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Loading..." : `${households?.length || 0} households`}
            </p>
          </div>
        </div>
      </header>

      <div className="p-4 max-w-4xl mx-auto">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : households && households.length > 0 ? (
          <div className="space-y-3">
            {households.map((household: any) => (
              <Card
                key={household.id}
                className="p-4 hover-elevate"
                data-testid={`card-household-${household.id}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {household.householdName}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      ID: {household.id.substring(0, 8)}
                    </p>
                  </div>
                  <Badge variant="outline">{household.populationServed} people</Badge>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {household.latitude}, {household.longitude}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Population Served: {household.populationServed}
                  </div>
                </div>

                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => setLocation(`/lhw/visit-form?household=${household.id}`)}
                  data-testid={`button-visit-${household.id}`}
                >
                  Visit Household
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No assigned households</p>
          </Card>
        )}
      </div>
    </div>
  );
}
