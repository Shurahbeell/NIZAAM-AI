import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Navigation } from "lucide-react";

interface FacilityCardProps {
  name: string;
  distance: string;
  type: string;
  isOpen: boolean;
  phone?: string;
  onNavigate?: () => void;
  onCall?: () => void;
  onBook?: () => void;
}

export default function FacilityCard({ name, distance, type, isOpen, phone, onNavigate, onCall, onBook }: FacilityCardProps) {
  return (
    <Card className="p-4" data-testid={`facility-card-${name.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-base text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{type}</p>
          </div>
          <Badge className={isOpen ? "bg-accent/20 text-accent-foreground" : "bg-destructive/20 text-destructive-foreground"}>
            {isOpen ? "Open" : "Closed"}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{distance} away</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={onNavigate} data-testid="button-navigate">
            <Navigation className="w-4 h-4 mr-2" />
            Navigate
          </Button>
          {phone && (
            <Button size="sm" variant="outline" onClick={onCall} data-testid="button-call">
              <Phone className="w-4 h-4 mr-2" />
              Call
            </Button>
          )}
          <Button size="sm" onClick={onBook} data-testid="button-book">
            Book
          </Button>
        </div>
      </div>
    </Card>
  );
}
