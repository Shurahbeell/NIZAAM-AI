import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Users, Calendar, FileText, Activity, TrendingUp, AlertCircle, User, Stethoscope, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

interface StatCard {
  title: string;
  value: string;
  change: string;
  icon: any;
  trend: "up" | "down" | "neutral";
}

export default function HospitalDashboard() {
  const [, setLocation] = useLocation();
  const [activeEmergencies, setActiveEmergencies] = useState(0);

  useEffect(() => {
    const loadEmergencies = () => {
      const stored = localStorage.getItem("emergencies");
      if (stored) {
        const emergencies = JSON.parse(stored);
        const active = emergencies.filter((e: any) => e.status === "active").length;
        setActiveEmergencies(active);
      }
    };

    loadEmergencies();
    const interval = setInterval(loadEmergencies, 5000);
    return () => clearInterval(interval);
  }, []);

  const stats: StatCard[] = [
    { title: "Today's Appointments", value: "24", change: "+12%", icon: Calendar, trend: "up" },
    { title: "Pending Prescriptions", value: "8", change: "-5%", icon: FileText, trend: "down" },
    { title: "Total Patients (Week)", value: "156", change: "+8%", icon: Users, trend: "up" },
    { title: "Active Doctors", value: "12", change: "0%", icon: Stethoscope, trend: "neutral" },
  ];

  const recentAppointments = [
    { id: "1", patient: "Ahmed Ali", doctor: "Dr. Sarah Khan", time: "10:00 AM", status: "pending" as const },
    { id: "2", patient: "Fatima Hassan", doctor: "Dr. Ali Raza", time: "11:30 AM", status: "approved" as const },
    { id: "3", patient: "Muhammad Bilal", doctor: "Dr. Sarah Khan", time: "2:00 PM", status: "pending" as const },
  ];

  const urgentAlerts = [
    { id: "1", type: "emergency", message: "Emergency patient in waiting", time: "5 mins ago" },
    { id: "2", type: "appointment", message: "New appointment request", time: "15 mins ago" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Hospital Dashboard</h1>
              <p className="text-xs text-muted-foreground">Manage appointments, doctors & patients</p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                localStorage.removeItem("userRole");
                setLocation("/login");
              }}
              data-testid="button-logout"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {activeEmergencies > 0 && (
          <Card className="border-destructive bg-destructive/10 cursor-pointer hover-elevate" onClick={() => setLocation("/hospital/emergencies")} data-testid="card-emergency-alert">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 animate-pulse" />
              <div className="flex-1">
                <p className="font-semibold text-foreground">
                  {activeEmergencies} Active Emergency Alert{activeEmergencies > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-muted-foreground">Tap to view emergency dashboard</p>
              </div>
              <Badge variant="destructive">{activeEmergencies}</Badge>
            </CardContent>
          </Card>
        )}

        {urgentAlerts.length > 0 && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="p-4 space-y-2">
              {urgentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} data-testid={`stat-card-${index}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className={`w-3 h-3 ${
                        stat.trend === "up" ? "text-green-500" : 
                        stat.trend === "down" ? "text-red-500" : 
                        "text-muted-foreground"
                      }`} />
                      <span className="text-xs text-muted-foreground">{stat.change}</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <h2 className="text-sm font-semibold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Card className="cursor-pointer hover-elevate" onClick={() => setLocation("/hospital/emergencies")} data-testid="action-emergencies">
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center relative">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                  {activeEmergencies > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center">
                      {activeEmergencies}
                    </div>
                  )}
                </div>
                <p className="font-medium text-sm">Emergencies</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover-elevate" onClick={() => setLocation("/hospital/doctors")} data-testid="action-doctors">
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-primary" />
                </div>
                <p className="font-medium text-sm">Manage Doctors</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover-elevate" onClick={() => setLocation("/hospital/appointments")} data-testid="action-appointments">
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <p className="font-medium text-sm">Appointments</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover-elevate" onClick={() => setLocation("/hospital/prescriptions")} data-testid="action-prescriptions">
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <p className="font-medium text-sm">Prescriptions</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover-elevate" onClick={() => setLocation("/hospital/reports")} data-testid="action-reports">
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <p className="font-medium text-sm">Reports</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAppointments.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{apt.patient}</p>
                    <p className="text-xs text-muted-foreground">{apt.doctor} • {apt.time}</p>
                  </div>
                </div>
                <Badge variant={apt.status === "approved" ? "default" : "outline"} className="capitalize">
                  {apt.status}
                </Badge>
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setLocation("/hospital/appointments")}
              data-testid="button-view-all-appointments"
            >
              View All Appointments
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
