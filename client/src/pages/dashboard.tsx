import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardCard from "@/components/DashboardCard";
import AppointmentCard from "@/components/AppointmentCard";
import { Stethoscope, Building2, Calendar, MapPin, ClipboardList, User, Bell, Pill, BookOpen, Activity, Heart, AlertCircle, Folder, Grid3x3, HelpCircle, CalendarX } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/lib/auth";
import { useLanguage } from "@/lib/useLanguage";
import type { Appointment } from "@shared/schema";

export default function Dashboard() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  });

  // Fetch upcoming appointment for this user
  const { data: nextAppointment, isLoading: appointmentLoading, refetch: refetchNextAppointment } = useQuery<Appointment | null>({
    queryKey: ["/api/appointments/next", user?.id],
    enabled: !!user?.id
  });

  // Refetch next appointment when page comes into focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refetchNextAppointment();
      }
    };

    const handleFocus = () => {
      refetchNextAppointment();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [refetchNextAppointment]);

  // Main Modules - 7 core AI agent features
  const mainModules = [
    {
      title: t('dashboard.triage'),
      description: t('dashboard.triageDesc'),
      icon: Stethoscope,
      path: "/symptom-chat"
    },
    {
      title: t('dashboard.womensHealthBtn'),
      description: t('dashboard.womensHealthDesc'),
      icon: Heart,
      path: "/womens-health"
    },
    {
      title: t('dashboard.programEligibility'),
      description: t('dashboard.programEligibilityDesc'),
      icon: Building2,
      path: "/programs-chat"
    },
    {
      title: t('dashboard.facilityFinder'),
      description: t('dashboard.facilityFinderDesc'),
      icon: MapPin,
      path: "/map"
    },
    {
      title: t('dashboard.followUp'),
      description: t('dashboard.followUpDesc'),
      icon: Calendar,
      path: "/appointments"
    },
    {
      title: t('dashboard.healthAnalytics'),
      description: t('dashboard.healthAnalyticsDesc'),
      icon: Activity,
      path: "/lab-tests"
    },
    {
      title: t('dashboard.knowledge'),
      description: t('dashboard.knowledgeDesc'),
      icon: BookOpen,
      path: "/medicine-library"
    }
  ];

  // Micro Modules - Additional services
  const microModules = [
    {
      title: t('dashboard.myFiles'),
      description: t('dashboard.myFilesDesc'),
      icon: Folder,
      path: "/medical-profile"
    },
    {
      title: t('dashboard.medicalHistory'),
      description: t('dashboard.medicalHistoryDesc'),
      icon: ClipboardList,
      path: "/history"
    },
    {
      title: t('dashboard.conditions'),
      description: t('dashboard.conditionsDesc'),
      icon: AlertCircle,
      path: "/disease-library"
    },
    {
      title: t('dashboard.medicines'),
      description: t('dashboard.medicinesDesc'),
      icon: Pill,
      path: "/medicines"
    },
    {
      title: t('dashboard.userManual'),
      description: t('dashboard.userManualDesc'),
      icon: HelpCircle,
      path: "/user-manual"
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
              NIZAAM-AI
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
          {appointmentLoading ? (
            <Card className="p-6 animate-pulse">
              <div className="h-24 bg-muted rounded-lg" />
            </Card>
          ) : nextAppointment ? (
            <AppointmentCard
              doctorName={`Dr. ${nextAppointment.patientName || "N/A"}`}
              department="General Consultation"
              date={new Date(nextAppointment.appointmentDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric"
              })}
              time={new Date(nextAppointment.appointmentDate).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
              })}
              status={nextAppointment.status as any}
            />
          ) : (
            <Card className="p-6 border-dashed">
              <div className="flex items-center gap-3 text-muted-foreground">
                <CalendarX className="w-5 h-5" />
                <div>
                  <p className="font-semibold">No upcoming appointments</p>
                  <p className="text-sm">Schedule one to get started</p>
                </div>
              </div>
            </Card>
          )}
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

        {/* ALL SERVICES Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Grid3x3 className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">All Services</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[...mainModules, ...microModules].map((module) => (
              <DashboardCard
                key={module.title}
                icon={module.icon}
                title={module.title}
                description={module.description}
                onClick={() => setLocation(module.path)}
                data-testid={`card-${module.title.toLowerCase().replace(/\s+/g, '-')}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
