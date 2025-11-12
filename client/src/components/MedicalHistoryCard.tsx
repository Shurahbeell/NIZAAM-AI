import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, AlertCircle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface MedicalHistoryCardProps {
  type: "appointment" | "emergency" | "note";
  title: string;
  date: string;
  summary: string;
  details?: string;
}

export default function MedicalHistoryCard({ type, title, date, summary, details }: MedicalHistoryCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const typeIcons = {
    appointment: Calendar,
    emergency: AlertCircle,
    note: FileText
  };

  const typeColors = {
    appointment: "bg-primary/10 text-primary",
    emergency: "bg-destructive/10 text-destructive",
    note: "bg-accent/10 text-accent"
  };

  const Icon = typeIcons[type];

  return (
    <Card className="p-4" data-testid={`history-card-${type}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 ${typeColors[type]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-foreground">{title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{date}</p>
              </div>
              {details && (
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" data-testid="button-toggle-details">
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">{summary}</p>
            {details && (
              <CollapsibleContent>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-foreground">{details}</p>
                </div>
              </CollapsibleContent>
            )}
          </div>
        </div>
      </Collapsible>
    </Card>
  );
}
