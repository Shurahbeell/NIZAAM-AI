import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardCard from "@/components/DashboardCard";
import AppointmentCard from "@/components/AppointmentCard";
import { Stethoscope, Building2, Calendar, MapPin, ClipboardList, User, Bell, Pill, BookOpen, Activity, Heart, AlertCircle, Folder, Grid3x3, HelpCircle, CalendarX, Check, Clock, MessageCircle } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/auth";
import { useLanguage } from "@/lib/useLanguage";
import { useToast } from "@/hooks/use-toast";
import type { Appointment } from "@shared/schema";

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  times: string[];
  frequency: string;
  startDate: string;
  takenToday?: Record<string, boolean>;
}

interface MedicineReminder {
  medicine: Medicine;
  time: string;
  minutesLeft: number;
  isTaken: boolean;
}

export default function Dashboard() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [medicineReminders, setMedicineReminders] = useState<MedicineReminder[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  });

  // Load medicines from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("medicines");
    if (stored) {
      setMedicines(JSON.parse(stored));
    }

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate upcoming reminders < 1 hour
  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    const upcoming: MedicineReminder[] = [];

    medicines.forEach(medicine => {
      medicine.times.forEach(time => {
        const [hours, minutes] = time.split(':').map(Number);
        let reminderDate = new Date();
        reminderDate.setHours(hours, minutes, 0, 0);

        if (reminderDate < now) {
          reminderDate.setDate(reminderDate.getDate() + 1);
        }

        const diffMs = reminderDate.getTime() - now.getTime();
        const minutesLeft = Math.floor(diffMs / 60000);
        const isTaken = medicine.takenToday?.[time] || false;
        const isPast = time < currentTimeStr;

        // Show reminders that are less than 60 minutes away, not taken, and not past
        if (minutesLeft < 60 && minutesLeft >= 0 && !isTaken && !isPast) {
          upcoming.push({ medicine, time, minutesLeft, isTaken });
        }
      });
    });

    setMedicineReminders(upcoming.sort((a, b) => a.minutesLeft - b.minutesLeft));
  }, [medicines, currentTime]);

  const markAsTakenDashboard = (medicineId: string, time: string) => {
    const updated = medicines.map(med => {
      if (med.id === medicineId) {
        return {
          ...med,
          takenToday: {
            ...med.takenToday,
            [time]: true
          }
        };
      }
      return med;
    });
    setMedicines(updated);
    localStorage.setItem("medicines", JSON.stringify(updated));
    
    toast({
      title: "Medicine Taken",
      description: "Thank you for taking your medicine!",
    });
  };

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
      title: t('dashboardModules.triage'),
      description: t('dashboardModules.triageDesc'),
      icon: Stethoscope,
      path: "/symptom-chat"
    },
    {
      title: t('dashboardModules.womensHealthBtn'),
      description: t('dashboardModules.womensHealthDesc'),
      icon: Heart,
      path: "/womens-health"
    },
    {
      title: t('dashboardModules.programEligibility'),
      description: t('dashboardModules.programEligibilityDesc'),
      icon: Building2,
      path: "/programs-chat"
    },
    {
      title: t('dashboardModules.facilityFinder'),
      description: t('dashboardModules.facilityFinderDesc'),
      icon: MapPin,
      path: "/map"
    },
    {
      title: t('dashboardModules.followUp'),
      description: t('dashboardModules.followUpDesc'),
      icon: Calendar,
      path: "/appointments"
    },
    {
      title: t('dashboardModules.healthAnalytics'),
      description: t('dashboardModules.healthAnalyticsDesc'),
      icon: Activity,
      path: "/lab-tests"
    },
    {
      title: t('dashboardModules.knowledge'),
      description: t('dashboardModules.knowledgeDesc'),
      icon: BookOpen,
      path: "/medicine-library"
    }
  ];

  // Micro Modules - Additional services
  const microModules = [
    {
      title: t('dashboardModules.myFiles'),
      description: t('dashboardModules.myFilesDesc'),
      icon: Folder,
      path: "/medical-profile"
    },
    {
      title: t('dashboardModules.medicalHistory'),
      description: t('dashboardModules.medicalHistoryDesc'),
      icon: ClipboardList,
      path: "/history"
    },
    {
      title: t('dashboardModules.conditions'),
      description: t('dashboardModules.conditionsDesc'),
      icon: AlertCircle,
      path: "/disease-library"
    },
    {
      title: "Disease Chatbot",
      description: "Ask about any disease",
      icon: MessageCircle,
      path: "/disease-chatbot"
    },
    {
      title: t('dashboardModules.medicines'),
      description: t('dashboardModules.medicinesDesc'),
      icon: Pill,
      path: "/medicines"
    },
    {
      title: t('dashboardModules.userManual'),
      description: t('dashboardModules.userManualDesc'),
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

        {/* Medicine Reminders < 1 hour */}
        {medicineReminders.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-destructive" />
              <h3 className="text-sm font-semibold text-destructive">Medicine Reminders Due Soon</h3>
            </div>
            {medicineReminders.map((reminder, index) => (
              <Card key={index} className="border-destructive/30 bg-destructive/5">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{reminder.medicine.name}</p>
                    <p className="text-sm text-muted-foreground">{reminder.medicine.dosage}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="w-4 h-4 text-destructive" />
                      <span className="text-sm font-medium text-destructive">
                        {reminder.minutesLeft === 0 ? "Now!" : `${reminder.minutesLeft} min left`}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => markAsTakenDashboard(reminder.medicine.id, reminder.time)}
                    className="gap-2"
                    data-testid={`button-dashboard-mark-taken-${reminder.medicine.id}-${reminder.time}`}
                  >
                    <Check className="w-4 h-4" />
                    Mark Taken
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

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
