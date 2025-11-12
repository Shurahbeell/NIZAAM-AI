import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import FacilityCard from "@/components/FacilityCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const facilities = [
  {
    id: 1,
    name: "City General Hospital",
    distance: "2.3 km",
    type: "Multi-specialty Hospital",
    category: "hospital",
    isOpen: true,
    phone: "+92 21 1234567"
  },
  {
    id: 2,
    name: "Medicare Clinic",
    distance: "3.1 km",
    type: "Primary Care Clinic",
    category: "hospital",
    isOpen: true,
    phone: "+92 21 1234568"
  },
  {
    id: 3,
    name: "Central BHU",
    distance: "4.5 km",
    type: "Basic Health Unit",
    category: "hospital",
    isOpen: false,
    phone: "+92 21 1234569"
  },
  {
    id: 4,
    name: "Elite Medical Center",
    distance: "5.2 km",
    type: "Specialty Hospital",
    category: "hospital",
    isOpen: true,
    phone: "+92 21 1234570"
  },
  {
    id: 5,
    name: "HealthPlus Pharmacy",
    distance: "1.2 km",
    type: "24/7 Pharmacy",
    category: "pharmacy",
    isOpen: true,
    phone: "+92 21 2234567"
  },
  {
    id: 6,
    name: "MediCare Drug Store",
    distance: "1.8 km",
    type: "Pharmacy & Medical Supplies",
    category: "pharmacy",
    isOpen: true,
    phone: "+92 21 2234568"
  },
  {
    id: 7,
    name: "City Pharmacy",
    distance: "3.4 km",
    type: "General Pharmacy",
    category: "pharmacy",
    isOpen: false,
    phone: "+92 21 2234569"
  },
  {
    id: 8,
    name: "Wellness Drug Store",
    distance: "2.7 km",
    type: "Pharmacy & Health Products",
    category: "pharmacy",
    isOpen: true,
    phone: "+92 21 2234570"
  }
];

export default function Map() {
  const [, setLocation] = useLocation();
  const [filter, setFilter] = useState<"all" | "hospital" | "pharmacy">("all");

  const filteredFacilities = facilities.filter(
    (f) => filter === "all" || f.category === filter
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b p-4 flex items-center gap-3 sticky top-0 bg-background z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/dashboard")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-semibold text-foreground">Nearby Facilities</h1>
      </header>

      <div className="p-4">
        <Tabs defaultValue="all" value={filter} onValueChange={(v) => setFilter(v as any)} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" data-testid="filter-all">All</TabsTrigger>
            <TabsTrigger value="hospital" data-testid="filter-hospitals">Hospitals</TabsTrigger>
            <TabsTrigger value="pharmacy" data-testid="filter-pharmacies">Pharmacies</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs defaultValue="list">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list" data-testid="tab-list">List View</TabsTrigger>
            <TabsTrigger value="map" data-testid="tab-map">Map View</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4 mt-6">
            {filteredFacilities.map((facility) => (
              <FacilityCard
                key={facility.id}
                name={facility.name}
                distance={facility.distance}
                type={facility.type}
                isOpen={facility.isOpen}
                phone={facility.phone}
                onNavigate={() => console.log(`Navigate to ${facility.name}`)}
                onCall={() => console.log(`Call ${facility.name}`)}
                onBook={() => setLocation("/appointments")}
              />
            ))}
          </TabsContent>

          <TabsContent value="map" className="mt-6">
            <div className="w-full h-[500px] bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">Interactive map view</p>
                <p className="text-sm text-muted-foreground">Map integration would display facilities here</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
