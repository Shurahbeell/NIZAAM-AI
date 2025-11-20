import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
}

export default function DashboardCard({ icon: Icon, title, description, onClick }: DashboardCardProps) {
  return (
    <Card
      className="group p-6 cursor-pointer border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 bg-gradient-to-br from-white to-accent/30 overflow-hidden relative"
      onClick={onClick}
      data-testid={`card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {/* Subtle animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative flex flex-col gap-3">
        {/* Icon Container with gradient background */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary/80 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300 group-hover:scale-110 transform">
          <Icon className="w-6 h-6 text-white" />
        </div>
        
        <div>
          <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
            {description}
          </p>
        </div>
      </div>

      {/* Decorative corner element */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </Card>
  );
}
