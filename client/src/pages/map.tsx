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
    isOpen: true,
    phone: "+92 21 1234567"
  },
  {
    id: 2,
    name: "Medicare Clinic",
    distance: "3.1 km",
    type: "Primary Care Clinic",
    isOpen: true,
    phone: "+92 21 1234568"
  },
  {
    id: 3,
    name: "Central BHU",
    distance: "4.5 km",
    type: "Basic Health Unit",
    isOpen: false,
    phone: "+92 21 1234569"
  },
  {
    id: 4,
    name: "Elite Medical Center",
    distance: "5.2 km",
    type: "Specialty Hospital",
    isOpen: true,
    phone: "+92 21 1234570"
  }
];

export default function Map() {
  const [, setLocation] = useLocation();

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

      <Tabs defaultValue="list" className="p-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" data-testid="tab-list">List View</TabsTrigger>
          <TabsTrigger value="map" data-testid="tab-map">Map View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4 mt-6">
          {facilities.map((facility) => (
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
  );
}
