import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppointmentCardProps {
  doctorName: string;
  department: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed";
}

export default function AppointmentCard({ doctorName, department, date, time, status }: AppointmentCardProps) {
  const statusColors = {
    pending: "bg-muted text-muted-foreground",
    confirmed: "bg-accent/20 text-accent-foreground",
    completed: "bg-muted/50 text-muted-foreground"
  };

  return (
    <Card
      className="p-4 border-l-4 border-l-primary"
      data-testid={`appointment-card-${doctorName.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">{doctorName}</span>
          </div>
          <p className="text-sm text-muted-foreground">{department}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{time}</span>
            </div>
          </div>
        </div>
        <Badge className={cn("text-xs capitalize", statusColors[status])}>
          {status}
        </Badge>
      </div>
    </Card>
  );
}
