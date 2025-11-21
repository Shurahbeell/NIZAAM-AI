import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface LocationPickerProps {
  onLocationSelect: (lat: string, lng: string) => void;
  initialLat?: string;
  initialLng?: string;
  title?: string;
}

export default function LocationPicker({
  onLocationSelect,
  initialLat = "24.8607",
  initialLng = "67.0011",
  title = "Select Location on Map",
}: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [selectedLat, setSelectedLat] = useState(initialLat);
  const [selectedLng, setSelectedLng] = useState(initialLng);

  useEffect(() => {
    if (!mapRef.current || map) return;

    // Initialize Google Map
    const google = (window as any).google;
    if (!google) {
      console.error("Google Maps API not loaded");
      return;
    }

    const initialLat_num = parseFloat(initialLat);
    const initialLng_num = parseFloat(initialLng);

    const mapInstance = new google.maps.Map(mapRef.current, {
      zoom: 14,
      center: { lat: initialLat_num, lng: initialLng_num },
      mapTypeControl: true,
      fullscreenControl: true,
    });

    // Create initial marker
    const markerInstance = new google.maps.Marker({
      position: { lat: initialLat_num, lng: initialLng_num },
      map: mapInstance,
      draggable: true,
    });

    // Handle map clicks to place marker
    mapInstance.addListener("click", (event: any) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      markerInstance.setPosition({ lat, lng });
      setSelectedLat(lat.toFixed(6));
      setSelectedLng(lng.toFixed(6));
    });

    // Handle marker drag
    markerInstance.addListener("dragend", () => {
      const position = markerInstance.getPosition();
      setSelectedLat(position.lat().toFixed(6));
      setSelectedLng(position.lng().toFixed(6));
    });

    setMap(mapInstance);
    setMarker(markerInstance);
  }, [mapRef, initialLat, initialLng]);

  const handleConfirm = () => {
    onLocationSelect(selectedLat, selectedLng);
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setSelectedLat(lat.toFixed(6));
        setSelectedLng(lng.toFixed(6));

        if (map && marker) {
          map.setCenter({ lat, lng });
          marker.setPosition({ lat, lng });
        }
      });
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{title}</label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGetCurrentLocation}
          className="text-xs"
          data-testid="button-current-location"
        >
          📍 Current Location
        </Button>
      </div>

      <div
        ref={mapRef}
        className="w-full h-64 rounded-md border"
        data-testid="google-map-container"
      />

      <Card className="p-3 bg-muted">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">Latitude</p>
            <p className="font-mono font-semibold">{selectedLat}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Longitude</p>
            <p className="font-mono font-semibold">{selectedLng}</p>
          </div>
        </div>
      </Card>

      <Button
        type="button"
        onClick={handleConfirm}
        className="w-full"
        data-testid="button-confirm-location"
      >
        <MapPin className="w-4 h-4 mr-2" />
        Confirm Location
      </Button>
    </div>
  );
}
