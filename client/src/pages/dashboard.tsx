import { useState } from "react";
import DashboardCard from "@/components/DashboardCard";
import EmergencyButton from "@/components/EmergencyButton";
import AppointmentCard from "@/components/AppointmentCard";
import { Stethoscope, Building2, Calendar, MapPin, ClipboardList, User, Bell, Pill, FileText, Beaker, BookOpen, Activity, Syringe, Brain, Heart, Baby, ChevronDown, Folder, History, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Dashboard() {
  const [, setLocation] = useLocation();
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
    <div className="min-h-screen bg-background pb-24">
      {/* Header with Notification Bar */}
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">HealthCare</h1>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" data-testid="button-notifications">
              <Bell className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/profile")}
              data-testid="button-profile"
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Greeting Section */}
        <div>
          <h2 className="text-2xl font-bold text-foreground">{greeting}, Ali</h2>
          <p className="text-muted-foreground mt-1">How can we help you today?</p>
        </div>

        {/* Next Appointment Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Next Appointment</h3>
          <AppointmentCard
            doctorName="Dr. Sarah Johnson"
            department="Cardiology"
            date="Nov 15, 2025"
            time="2:00 PM"
            status="confirmed"
          />
        </div>

        {/* MAIN MODULES Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Main Services</h3>
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
        <div className="space-y-4">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="more-services" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline" data-testid="accordion-more-services">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">More Services</span>
                  <span className="text-xs text-muted-foreground">({microModules.length} services)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-4 pt-4">
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
        </div>
      </div>

      {/* Emergency Module */}
      <EmergencyButton onClick={() => setLocation("/emergency")} />
    </div>
  );
}
