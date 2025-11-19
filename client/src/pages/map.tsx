import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Navigation } from "lucide-react";
import { useLocation } from "wouter";
import FacilityCard from "@/components/FacilityCard";
import FacilityMap, { type FacilityLocation } from "@/components/FacilityMap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { calculateDistance, formatDistance, filterByProximity, sortByDistance } from "@/lib/distance";

// Default coordinates for initial load (Lahore, Pakistan)
const DEFAULT_COORDS = { lat: 31.5204, lng: 74.3587 };

export default function Map() {
  const [, setLocation] = useLocation();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>();
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const MAX_DISTANCE_KM = 200; // Only show facilities within 200km

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

  const [filters, setFilters] = useState<string[]>([]);
  const [searchCoords, setSearchCoords] = useState(DEFAULT_COORDS);
  
  // Fetch real hospitals from Google Places API
  const { data: googleFacilities, isLoading: isLoadingAI } = useQuery<{ results: any[]; meta: any }>({
    queryKey: ['/api/facilities/hospitals', searchCoords.lat, searchCoords.lng, filters],
    queryFn: async () => {
      const filterParam = filters.length > 0 ? `&filters=${filters.join(',')}` : '';
      const response = await fetch(
        `/api/facilities/hospitals?lat=${searchCoords.lat}&lng=${searchCoords.lng}&limit=50${filterParam}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch facilities');
      }
      
      return response.json();
    }
  });

  // Transform Google Places data to FacilityLocation format
  const aiFacilities = useMemo(() => {
    if (!googleFacilities?.results) return { facilities: [] };
    
    return {
      facilities: googleFacilities.results.map((place: any, index: number) => ({
        id: index + 1,
        name: place.name,
        lat: place.lat,
        lng: place.lng,
        type: "Hospital",
        distance: place.distance || "Unknown",
        duration: place.duration,
        isOpen: true,
        phone: place.phone || "",
        address: place.address,
        rating: place.rating,
        photo_reference: place.photo_reference,
        recommendation: place.recommendation
      }))
    };
  }, [googleFacilities]);

  useEffect(() => {
    if (userLocation) {
      setSearchCoords(userLocation);
    }
  }, [userLocation]);

  // Smart filtering: Calculate distances, filter by proximity, sort by distance
  const processedFacilities = useMemo(() => {
    // Use AI-recommended facilities from backend
    const facilitiesToProcess = aiFacilities?.facilities && Array.isArray(aiFacilities.facilities) 
      ? aiFacilities.facilities 
      : [];

    // If no user location, return all facilities unsorted
    if (!userLocation) {
      return facilitiesToProcess;
    }

    // Filter by proximity (within MAX_DISTANCE_KM)
    const nearbyFacilities = filterByProximity(
      facilitiesToProcess,
      userLocation.lat,
      userLocation.lng,
      MAX_DISTANCE_KM
    );

    // Sort by distance (nearest first)
    const sortedFacilities = sortByDistance(
      nearbyFacilities,
      userLocation.lat,
      userLocation.lng
    );

    // Update distance labels with real calculations
    return sortedFacilities.map((facility) => ({
      ...facility,
      distance: formatDistance(
        calculateDistance(userLocation.lat, userLocation.lng, facility.lat, facility.lng)
      ),
    }));
  }, [aiFacilities, userLocation]);

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
          {userLocation && processedFacilities.length === 0 && (
            <div className="p-6 bg-muted rounded-lg text-center mb-4">
              <MapPin className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-lg font-semibold mb-2">No facilities found nearby</p>
              <p className="text-sm text-muted-foreground">
                No healthcare facilities within {MAX_DISTANCE_KM}km of your location.
                Try a different area or contact emergency services if urgent.
              </p>
            </div>
          )}
          <div className="w-full h-[600px]">
            <FacilityMap
              facilities={processedFacilities}
              userLocation={userLocation}
              onFacilityClick={handleFacilityClick}
              isLoading={isLoadingAI}
              onFiltersChange={setFilters}
              onBoundsChange={(lat, lng) => setSearchCoords({ lat, lng })}
            />
          </div>
          <div className="mt-4 p-3 bg-muted rounded-lg text-sm text-muted-foreground" data-testid="status-facilities-count">
            <MapPin className="w-4 h-4 inline mr-2" />
            {userLocation ? (
              <>
                Showing {processedFacilities.length} facilities within {MAX_DISTANCE_KM}km
                {isLoadingAI && " • Fetching AI recommendations..."}
              </>
            ) : (
              <>
                Showing {processedFacilities.length} facilities
                {isLoadingLocation ? " • Detecting your location..." : " • Click 'My Location' to filter by proximity"}
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4 mt-6">
          {userLocation && processedFacilities.length === 0 && (
            <div className="p-6 bg-muted rounded-lg text-center">
              <p className="text-lg font-semibold mb-2">No facilities found nearby</p>
              <p className="text-sm text-muted-foreground">
                No healthcare facilities within {MAX_DISTANCE_KM}km of your location.
              </p>
            </div>
          )}
          {processedFacilities.map((facility) => (
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
