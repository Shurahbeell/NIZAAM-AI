import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Navigation } from "lucide-react";
import { useLocation } from "wouter";
import FacilityCard from "@/components/FacilityCard";
import FacilityMap, { type FacilityLocation } from "@/components/FacilityMap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Real Pakistan hospital coordinates
const facilities: FacilityLocation[] = [
  {
    id: 1,
    name: "Jinnah Hospital",
    lat: 31.4827,
    lng: 74.3145,
    distance: "2.3 km",
    type: "Teaching Hospital",
    isOpen: true,
    phone: "+92 42 111 222 333",
    address: "Ferozepur Road, Lahore"
  },
  {
    id: 2,
    name: "Services Hospital",
    lat: 31.5050,
    lng: 74.3293,
    distance: "3.1 km",
    type: "Government Hospital",
    isOpen: true,
    phone: "+92 42 111 222 444",
    address: "Jail Road, Lahore"
  },
  {
    id: 3,
    name: "Model Town BHU",
    lat: 31.4835,
    lng: 74.3278,
    distance: "1.8 km",
    type: "Basic Health Unit",
    isOpen: true,
    phone: "+92 42 111 222 555",
    address: "Model Town, Lahore"
  },
  {
    id: 4,
    name: "Agha Khan Hospital Karachi",
    lat: 24.8967,
    lng: 67.0650,
    distance: "5.2 km",
    type: "Private Hospital",
    isOpen: true,
    phone: "+92 21 111 911 911",
    address: "Stadium Road, Karachi"
  },
  {
    id: 5,
    name: "PIMS Hospital Islamabad",
    lat: 33.7093,
    lng: 73.0722,
    distance: "4.1 km",
    type: "Teaching Hospital",
    isOpen: true,
    phone: "+92 51 111 222 666",
    address: "G-8/3, Islamabad"
  }
];

export default function Map() {
  const [, setLocation] = useLocation();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>();
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      console.log("Geolocation not supported");
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLoadingLocation(false);
      },
      (error) => {
        console.log("Error getting location:", error);
        setIsLoadingLocation(false);
      }
    );
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  const handleFacilityClick = (facility: FacilityLocation) => {
    console.log("Facility clicked:", facility.name);
  };

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
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-foreground">Nearby Facilities</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={getUserLocation}
          disabled={isLoadingLocation}
          data-testid="button-locate-me"
        >
          <Navigation className="w-4 h-4 mr-2" />
          {isLoadingLocation ? "Locating..." : "My Location"}
        </Button>
      </header>

      <Tabs defaultValue="map" className="p-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="map" data-testid="tab-map">
            <MapPin className="w-4 h-4 mr-2" />
            Map View
          </TabsTrigger>
          <TabsTrigger value="list" data-testid="tab-list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="mt-6">
          <div className="w-full h-[600px]">
            <FacilityMap
              facilities={facilities}
              userLocation={userLocation}
              onFacilityClick={handleFacilityClick}
            />
          </div>
          {userLocation && (
            <div className="mt-4 p-3 bg-muted rounded-lg text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 inline mr-2" />
              Your location: {userLocation.lat.toFixed(4)}°, {userLocation.lng.toFixed(4)}°
            </div>
          )}
        </TabsContent>

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
              onCall={() => window.open(`tel:${facility.phone}`)}
              onBook={() => setLocation("/appointments")}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
