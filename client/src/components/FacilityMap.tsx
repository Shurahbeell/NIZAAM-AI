import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet
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
  distance: string;
  isOpen: boolean;
  phone: string;
  address?: string;
}

interface FacilityMapProps {
  facilities: FacilityLocation[];
  userLocation?: { lat: number; lng: number };
  onFacilityClick?: (facility: FacilityLocation) => void;
}

export default function FacilityMap({
  facilities,
  userLocation,
  onFacilityClick,
}: FacilityMapProps) {
  const [center, setCenter] = useState<[number, number]>([
    24.8607, 67.0011, // Karachi, Pakistan (default)
  ]);

  useEffect(() => {
    if (userLocation) {
      setCenter([userLocation.lat, userLocation.lng]);
    } else if (facilities.length > 0) {
      setCenter([facilities[0].lat, facilities[0].lng]);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log("Geolocation error:", error);
        }
      );
    }
  }, [userLocation, facilities]);

  // Create custom icons for different facility types
  const getMarkerColor = (type: string) => {
    if (type.toLowerCase().includes("hospital")) return "red";
    if (type.toLowerCase().includes("clinic")) return "blue";
    if (type.toLowerCase().includes("bhu")) return "green";
    return "orange";
  };

  const createCustomIcon = (type: string, isOpen: boolean) => {
    const color = getMarkerColor(type);
    const opacity = isOpen ? 1 : 0.6;
    
    return L.divIcon({
      className: "custom-marker",
      html: `
        <div style="
          background-color: ${color};
          width: 30px;
          height: 30px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
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
            ${type.toLowerCase().includes("hospital") ? "H" : type.toLowerCase().includes("clinic") ? "C" : "B"}
          </div>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30],
    });
  };

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border" data-testid="facility-map">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location marker */}
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

        {/* Facility markers */}
        {facilities.map((facility) => (
          <Marker
            key={facility.id}
            position={[facility.lat, facility.lng]}
            icon={createCustomIcon(facility.type, facility.isOpen)}
            eventHandlers={{
              click: () => onFacilityClick?.(facility),
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]" data-testid={`popup-facility-${facility.id}`}>
                <h3 className="font-semibold text-base mb-1">{facility.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{facility.type}</p>
                {facility.address && (
                  <p className="text-xs text-muted-foreground mb-2">{facility.address}</p>
                )}
                <div className="flex items-center gap-2 text-xs mb-1">
                  <span className="font-medium">Distance:</span>
                  <span>{facility.distance}</span>
                </div>
                <div className="flex items-center gap-2 text-xs mb-2">
                  <span className="font-medium">Status:</span>
                  <span
                    className={`px-2 py-0.5 rounded ${
                      facility.isOpen
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {facility.isOpen ? "Open" : "Closed"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-medium">Phone:</span>
                  <a
                    href={`tel:${facility.phone}`}
                    className="text-primary hover:underline"
                  >
                    {facility.phone}
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
