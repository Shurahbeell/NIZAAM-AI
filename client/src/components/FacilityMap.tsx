import { useEffect, useState, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Phone, Navigation as NavIcon, Star } from "lucide-react";
import { Badge } from "./ui/badge";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export interface FacilityLocation {
  id: number;
  name: string;
  lat: number;
  lng: number;
  type: string;
  distance: string | { text: string; value: number };
  isOpen: boolean;
  phone: string;
  address?: string;
  rating?: number;
  photo_reference?: string;
  recommendation?: string[];
  duration?: { text: string; value: number };
}

interface FacilityMapProps {
  facilities: FacilityLocation[];
  userLocation?: { lat: number; lng: number };
  onFacilityClick?: (facility: FacilityLocation) => void;
  isLoading?: boolean;
  onFiltersChange?: (filters: string[]) => void;
  onBoundsChange?: (lat: number, lng: number) => void;
}

function MapController({ center, facilities }: { center: [number, number]; facilities: FacilityLocation[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (facilities.length > 0) {
      const bounds = L.latLngBounds(facilities.map(f => [f.lat, f.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } else {
      map.setView(center, 13, { animate: true });
    }
  }, [center, facilities, map]);
  
  return null;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function FacilityMap({
  facilities,
  userLocation,
  onFacilityClick,
  isLoading = false,
  onFiltersChange,
  onBoundsChange,
}: FacilityMapProps) {
  const [center, setCenter] = useState<[number, number]>([24.8607, 67.0011]);
  const [filters, setFilters] = useState<string[]>([]);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  
  const debouncedMapCenter = useDebounce(mapCenter, 400);

  useEffect(() => {
    if (debouncedMapCenter && onBoundsChange) {
      onBoundsChange(debouncedMapCenter.lat, debouncedMapCenter.lng);
    }
  }, [debouncedMapCenter, onBoundsChange]);

  useEffect(() => {
    if (userLocation) {
      setCenter([userLocation.lat, userLocation.lng]);
    } else if (facilities.length > 0) {
      setCenter([facilities[0].lat, facilities[0].lng]);
    }
  }, [userLocation, facilities]);

  const handleFilterChange = (filter: string, checked: boolean) => {
    const newFilters = checked 
      ? [...filters, filter]
      : filters.filter(f => f !== filter);
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const getMarkerColorByDistance = (facility: FacilityLocation) => {
    const distValue = typeof facility.distance === 'object' 
      ? facility.distance.value 
      : parseFloat(facility.distance) * 1000;
    
    if (distValue < 5000) return "green";
    if (distValue < 20000) return "blue";
    if (distValue < 50000) return "orange";
    return "red";
  };

  const createCustomIcon = (facility: FacilityLocation) => {
    const color = getMarkerColorByDistance(facility);
    const isOpen = facility.isOpen;
    const opacity = isOpen ? 1 : 0.6;
    
    return L.divIcon({
      className: "custom-marker",
      html: `
        <div style="
          background-color: ${color};
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 3px 6px rgba(0,0,0,0.4);
          opacity: ${opacity};
        ">
          <div style="
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            transform: rotate(45deg);
            color: white;
            font-size: 16px;
            font-weight: bold;
          ">
            H
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  };

  const topPicks = useMemo(() => {
    return facilities
      .filter(f => f.recommendation?.includes('Top Pick'))
      .slice(0, 3);
  }, [facilities]);

  const getPhotoUrl = (photoRef: string) => {
    return `/api/facilities/photo?photoref=${photoRef}&maxwidth=400`;
  };

  const getDirectionsUrl = (facility: FacilityLocation) => {
    if (!userLocation) return '#';
    return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${facility.lat},${facility.lng}`;
  };

  const distanceText = (facility: FacilityLocation) => {
    return typeof facility.distance === 'object' 
      ? facility.distance.text 
      : facility.distance;
  };

  return (
    <div className="w-full h-full flex flex-col gap-3">
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-muted-foreground">Loading facilities...</p>
          </div>
        </div>
      )}

      {topPicks.length > 0 && (
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            Top Picks
          </h3>
          <div className="grid gap-2">
            {topPicks.map((facility) => (
              <div key={facility.id} className="flex items-start gap-3 p-2 hover-elevate rounded-lg">
                {facility.photo_reference && (
                  <img 
                    src={getPhotoUrl(facility.photo_reference)} 
                    alt={facility.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{facility.name}</div>
                  <div className="text-xs text-muted-foreground">{distanceText(facility)}</div>
                  <div className="flex gap-1 mt-1">
                    {facility.recommendation?.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs px-1 py-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1">
                  {facility.phone && (
                    <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
                      <a href={`tel:${facility.phone}`}>
                        <Phone className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
                    <a href={getDirectionsUrl(facility)} target="_blank" rel="noopener noreferrer">
                      <NavIcon className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-card p-3 rounded-lg border">
        <div className="font-semibold mb-2 text-sm">Filters</div>
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox 
              checked={filters.includes('emergency')}
              onCheckedChange={(checked) => handleFilterChange('emergency', checked as boolean)}
              data-testid="filter-emergency"
            />
            <span>Emergency</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox 
              checked={filters.includes('24h')}
              onCheckedChange={(checked) => handleFilterChange('24h', checked as boolean)}
              data-testid="filter-24h"
            />
            <span>24/7</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox 
              checked={filters.includes('private')}
              onCheckedChange={(checked) => handleFilterChange('private', checked as boolean)}
              data-testid="filter-private"
            />
            <span>Private</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox 
              checked={filters.includes('pharmacy')}
              onCheckedChange={(checked) => handleFilterChange('pharmacy', checked as boolean)}
              data-testid="filter-pharmacy"
            />
            <span>Pharmacy</span>
          </label>
        </div>
      </div>

      <div className="bg-card p-3 rounded-lg border text-sm">
        <div className="font-semibold mb-2">Distance Legend</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            <span>0-5 km</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
            <span>5-20 km</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full border-2 border-white"></div>
            <span>20-50 km</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
            <span>50+ km</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 rounded-lg overflow-hidden border relative" data-testid="facility-map">
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          <MapController center={center} facilities={facilities} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {userLocation && (
            <>
              <Marker position={[userLocation.lat, userLocation.lng]}>
                <Popup>
                  <strong>Your Location</strong>
                </Popup>
              </Marker>
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={500}
                pathOptions={{ color: "blue", fillColor: "blue", fillOpacity: 0.1 }}
              />
            </>
          )}

          {facilities.map((facility) => (
            <Marker
              key={facility.id}
              position={[facility.lat, facility.lng]}
              icon={createCustomIcon(facility)}
              eventHandlers={{
                click: () => onFacilityClick?.(facility),
              }}
              title={`${facility.name}`}
            >
              <Popup maxWidth={300}>
                <div className="p-2 min-w-[250px]" data-testid={`popup-facility-${facility.id}`}>
                  {facility.photo_reference && (
                    <img 
                      src={getPhotoUrl(facility.photo_reference)} 
                      alt={facility.name}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  )}
                  <h3 className="font-semibold text-base mb-1">{facility.name}</h3>
                  {facility.rating && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{facility.rating.toFixed(1)}</span>
                    </div>
                  )}
                  {facility.address && (
                    <p className="text-xs text-muted-foreground mb-2">{facility.address}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs mb-1">
                    <span className="font-medium">Distance:</span>
                    <span>{distanceText(facility)}</span>
                  </div>
                  {facility.duration && (
                    <div className="flex items-center gap-2 text-xs mb-2">
                      <span className="font-medium">Drive time:</span>
                      <span>{facility.duration.text}</span>
                    </div>
                  )}
                  {facility.recommendation && facility.recommendation.length > 0 && (
                    <div className="flex gap-1 mb-2 flex-wrap">
                      {facility.recommendation.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 mt-3">
                    {facility.phone && (
                      <Button size="sm" variant="outline" asChild className="flex-1">
                        <a href={`tel:${facility.phone}`}>
                          <Phone className="w-3 h-3 mr-1" />
                          Call
                        </a>
                      </Button>
                    )}
                    <Button size="sm" variant="default" asChild className="flex-1">
                      <a href={getDirectionsUrl(facility)} target="_blank" rel="noopener noreferrer">
                        <NavIcon className="w-3 h-3 mr-1" />
                        Directions
                      </a>
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
