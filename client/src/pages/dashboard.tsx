import { useState } from "react";
import DashboardCard from "@/components/DashboardCard";
import AppointmentCard from "@/components/AppointmentCard";
import { Stethoscope, Building2, Calendar, MapPin, ClipboardList, User, Bell, Pill, BookOpen, Activity, Heart, AlertCircle, Folder, Grid3x3 } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuthStore } from "@/lib/auth";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  });

  // Main Modules - 7 core AI agent features
  const mainModules = [
    {
      title: "Triage",
      description: "AI symptom analysis",
      icon: Stethoscope,
      path: "/symptom-chat"
    },
    {
      title: "Women's Health",
      description: "Maternal & wellness",
      icon: Heart,
      path: "/womens-health"
    },
    {
      title: "Program Eligibility",
      description: "Government programs",
      icon: Building2,
      path: "/programs-chat"
    },
    {
      title: "Facility Finder",
      description: "Find hospitals",
      icon: MapPin,
      path: "/map"
    },
    {
      title: "Follow-Up",
      description: "Appointments & care",
      icon: Calendar,
      path: "/appointments"
    },
    {
      title: "Health Analytics",
      description: "Lab tests & reports",
      icon: Activity,
      path: "/lab-tests"
    },
    {
      title: "Knowledge",
      description: "Health library",
      icon: BookOpen,
      path: "/medicine-library"
    }
  ];

  // Micro Modules - collapsed into dropdown
  const microModules = [
    {
      title: "Quick Access",
      description: "Dashboard home",
      icon: Activity,
      path: "/dashboard"
    },
    {
      title: "My Files",
      description: "Medical documents",
      icon: Folder,
      path: "/medical-profile"
    },
    {
      title: "Medical History",
      description: "Past records",
      icon: ClipboardList,
      path: "/history"
    },
    {
      title: "Conditions",
      description: "Disease info",
      icon: AlertCircle,
      path: "/disease-library"
    },
    {
      title: "Medicines",
      description: "Track & reminders",
      icon: Pill,
      path: "/medicines"
    },
    {
      title: "Appointments",
      description: "Schedule visits",
      icon: Calendar,
      path: "/appointments"
    },
    {
      title: "Programs",
      description: "Eligibility check",
      icon: Building2,
      path: "/programs-chat"
    },
    {
      title: "Notifications",
      description: "Alerts & reminders",
      icon: Bell,
      path: "/dashboard"
    },
    {
      title: "Facility Browser",
      description: "Nearby hospitals",
      icon: MapPin,
      path: "/map"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background pb-24">
      {/* Header with gradient background */}
      <header className="sticky top-0 bg-gradient-to-r from-primary to-secondary shadow-lg z-20 backdrop-blur-sm">
        <div className="p-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Heart className="w-5 h-5 animate-pulse" />
              HealthCare
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              data-testid="button-notifications"
              className="text-white hover:bg-white/20 relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full animate-pulse"></span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/profile")}
              data-testid="button-profile"
              className="text-white hover:bg-white/20"
            >
              <Avatar className="w-8 h-8 border-2 border-white/50">
                <AvatarFallback className="bg-white/20 text-white">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Greeting Section with gradient card */}
        <Card className="p-6 bg-gradient-to-br from-white to-accent/30 shadow-xl border-none">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" data-testid="text-greeting">
                {greeting}, {user?.fullName || user?.username || "Guest"}
              </h2>
              <p className="text-muted-foreground mt-1">How can we help you today?</p>
            </div>
            <div className="hidden sm:block">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                <Heart className="w-8 h-8 text-white animate-pulse" />
              </div>
            </div>
          </div>
        </Card>

        {/* Next Appointment Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Next Appointment</h3>
          </div>
          <AppointmentCard
            doctorName="Dr. Sarah Johnson"
            department="Cardiology"
            date="Nov 15, 2025"
            time="2:00 PM"
            status="confirmed"
          />
        </div>

        {/* Emergency Module - Top Right */}
        <div className="flex justify-end">
          <Button
            size="lg"
            className="gap-2 shadow-xl bg-gradient-to-r from-destructive to-destructive/80 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 text-white font-semibold relative overflow-hidden group"
            onClick={() => setLocation("/emergency")}
            data-testid="button-emergency-top"
          >
            {/* Animated pulse background */}
            <span className="absolute inset-0 bg-white/20 animate-pulse"></span>
            <AlertCircle className="w-5 h-5 relative z-10" />
            <span className="relative z-10">SOS Emergency</span>
          </Button>
        </div>

        {/* MAIN MODULES Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Grid3x3 className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Main Services</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {mainModules.map((module) => (
              <DashboardCard
                key={module.title}
                icon={module.icon}
                title={module.title}
                description={module.description}
                onClick={() => setLocation(module.path)}
              />
            ))}
          </div>
        </div>

        {/* MICRO MODULES - Collapsed into Dropdown */}
        <Card className="overflow-hidden shadow-lg border-none bg-gradient-to-br from-white to-accent/20">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="more-services" className="border-0">
              <AccordionTrigger 
                className="px-6 py-5 hover:no-underline hover:bg-accent/30 transition-colors duration-300" 
                data-testid="accordion-more-services"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:from-primary/30 group-hover:to-secondary/30 transition-colors duration-300">
                    <Grid3x3 className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="text-sm font-semibold text-foreground">More Services</span>
                    <span className="text-xs text-muted-foreground">{microModules.length} additional features</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {microModules.map((module) => (
                    <DashboardCard
                      key={module.title}
                      icon={module.icon}
                      title={module.title}
                      description={module.description}
                      onClick={() => setLocation(module.path)}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      </div>
    </div>
  );
}
