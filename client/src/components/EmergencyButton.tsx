import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface EmergencyButtonProps {
  onClick?: () => void;
}

export default function EmergencyButton({ onClick }: EmergencyButtonProps) {
  return (
    <Button
      size="lg"
      variant="destructive"
      className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-lg z-50"
      onClick={onClick}
      data-testid="button-emergency"
    >
      <AlertTriangle className="w-8 h-8" />
    </Button>
  );
}
