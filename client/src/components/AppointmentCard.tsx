import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, ChevronRight, AlertCircle, CheckCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppointmentCardProps {
  doctorName: string;
  department: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed";
}

export default function AppointmentCard({ doctorName, department, date, time, status }: AppointmentCardProps) {
  const statusConfig = {
    pending: {
      color: "bg-amber-100 text-amber-700 border-amber-200",
      icon: AlertCircle,
      iconColor: "text-amber-600",
      gradientFrom: "from-amber-500/20",
      gradientTo: "to-transparent"
    },
    confirmed: {
      color: "bg-green-100 text-green-700 border-green-200",
      icon: CheckCircle,
      iconColor: "text-green-600",
      gradientFrom: "from-green-500/20",
      gradientTo: "to-transparent"
    },
    completed: {
      color: "bg-slate-100 text-slate-600 border-slate-200",
      icon: Circle,
      iconColor: "text-slate-500",
      gradientFrom: "from-slate-500/20",
      gradientTo: "to-transparent"
    }
  };

  const config = statusConfig[status] || statusConfig.pending;
  const StatusIcon = config?.icon || AlertCircle;

  return (
    <Card
      className={cn(
        "group p-5 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.01]",
        "bg-gradient-to-r from-white to-accent/20 border-2 border-transparent hover:border-primary/20",
        "relative overflow-hidden"
      )}
      data-testid={`appointment-card-${doctorName.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {/* Gradient accent strip on left */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b",
        config.gradientFrom,
        config.gradientTo
      )}></div>

      <div className="flex items-start justify-between gap-4 pl-3">
        <div className="flex-1 space-y-3">
          {/* Doctor Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-semibold text-foreground text-base block">{doctorName}</span>
              <p className="text-sm text-muted-foreground">{department}</p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/50 rounded-lg">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{date}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/50 rounded-lg">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{time}</span>
            </div>
          </div>
        </div>

        {/* Status Badge & Arrow */}
        <div className="flex flex-col items-end gap-2">
          <Badge 
            className={cn(
              "text-xs font-semibold capitalize px-3 py-1 border shadow-sm flex items-center gap-1.5",
              config.color
            )}
          >
            <StatusIcon className={cn("w-3.5 h-3.5", config.iconColor)} />
            {status}
          </Badge>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
        </div>
      </div>
    </Card>
  );
}
