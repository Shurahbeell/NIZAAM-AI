import { useState } from "react";
import DashboardCard from "@/components/DashboardCard";
import EmergencyButton from "@/components/EmergencyButton";
import AppointmentCard from "@/components/AppointmentCard";
import { Stethoscope, Building2, Calendar, MapPin, ClipboardList, User, Bell, Pill } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  });

  return (
    <div className="min-h-screen bg-background pb-24">
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
        <div>
          <h2 className="text-2xl font-bold text-foreground">{greeting}, Ali</h2>
          <p className="text-muted-foreground mt-1">How can we help you today?</p>
        </div>

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

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Quick Access</h3>
          <div className="grid grid-cols-2 gap-4">
            <DashboardCard
              icon={Stethoscope}
              title="Symptom Checker"
              description="AI symptom triage"
              onClick={() => setLocation("/symptom-chat")}
            />
            <DashboardCard
              icon={Building2}
              title="Health Programs"
              description="Government programs"
              onClick={() => setLocation("/programs-chat")}
            />
            <DashboardCard
              icon={Pill}
              title="My Medicines"
              description="Track & reminders"
              onClick={() => setLocation("/medicines")}
            />
            <DashboardCard
              icon={Calendar}
              title="Book Appointment"
              description="Schedule a visit"
              onClick={() => setLocation("/appointments")}
            />
            <DashboardCard
              icon={MapPin}
              title="Nearby Facilities"
              description="Find hospitals"
              onClick={() => setLocation("/map")}
            />
            <DashboardCard
              icon={ClipboardList}
              title="Medical History"
              description="View your records"
              onClick={() => setLocation("/history")}
            />
          </div>
        </div>
      </div>

      <EmergencyButton onClick={() => setLocation("/emergency")} />
    </div>
  );
}
