import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Users, Calendar, FileText, Activity, TrendingUp, TrendingDown, Minus, AlertCircle, User, Stethoscope, AlertTriangle, Building2, LogOut, MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";

interface StatCard {
  title: string;
  value: string;
  change: string;
  icon: any;
  trend: "up" | "down" | "neutral";
}

export default function HospitalDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();

  // Fetch emergencies to get active count
  const { data: emergencies = [] } = useQuery<any[]>({
    queryKey: ["/api/emergencies"],
    refetchInterval: 5000
  });

  // Fetch incoming emergencies for this hospital
  const { data: incomingEmergencies = [] } = useQuery<any[]>({
    queryKey: [`/api/emergencies/cases/incoming/${user?.hospitalId}`],
    enabled: !!user?.hospitalId,
    refetchInterval: 3000,
  });

  // Fetch real appointments for this hospital
  const { data: dbAppointments = [] } = useQuery<any[]>({
    queryKey: [`/api/hospital/${user?.hospitalId}/appointments`],
    enabled: !!user?.hospitalId,
    refetchInterval: 5000
  });

  const activeEmergencies = emergencies.filter((e: any) => e.status === "active").length;
  const incomingCount = incomingEmergencies.length;

  // Map database appointments to display format - show only 3 most recent
  const recentAppointments = dbAppointments.slice(0, 3).map((apt: any) => ({
    id: apt.id,
    patient: apt.patientName,
    doctor: apt.doctorId || "Doctor",
    time: new Date(apt.appointmentDate).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
    status: (apt.status || "pending") as "pending" | "approved" | "completed" | "cancelled"
  }));

  const stats: StatCard[] = [
    { title: "Today's Appointments", value: String(dbAppointments.length), change: "+12%", icon: Calendar, trend: "up" },
    { title: "Pending Prescriptions", value: "8", change: "-5%", icon: FileText, trend: "down" },
    { title: "Total Patients (Week)", value: "156", change: "+8%", icon: Users, trend: "up" },
    { title: "Active Doctors", value: "12", change: "0%", icon: Stethoscope, trend: "neutral" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background pb-24">
      {/* Header with gradient background */}
      <header className="sticky top-0 bg-gradient-to-r from-primary to-secondary shadow-lg z-20 backdrop-blur-sm">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shadow-md">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Hospital Dashboard</h1>
                <p className="text-xs text-white/80">Jinnah Hospital Management</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                localStorage.removeItem("userRole");
                setLocation("/login");
              }}
              data-testid="button-logout"
              className="text-white hover:bg-white/20 gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Emergency Alert Banner */}
        {activeEmergencies > 0 && (
          <Card 
            className="border-2 border-destructive/30 bg-gradient-to-r from-destructive/10 to-destructive/5 cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] overflow-hidden relative" 
            onClick={() => setLocation("/hospital/emergencies")} 
            data-testid="card-emergency-alert"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 rounded-full blur-3xl animate-pulse"></div>
            <CardContent className="p-5 flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-destructive to-destructive/70 flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-7 h-7 text-white animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg text-foreground">
                  {activeEmergencies} Active Emergency Alert{activeEmergencies > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-muted-foreground">Tap to view emergency dashboard →</p>
              </div>
              <Badge className="bg-destructive text-white text-base px-4 py-2 shadow-md">
                {activeEmergencies}
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Incoming Emergencies */}
        {incomingCount > 0 && (
          <Card className="border-orange-400/30 bg-gradient-to-br from-orange-50 to-orange-100/20 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  Incoming Patients ({incomingCount})
                </CardTitle>
                <Badge className="bg-orange-600 text-white">{incomingCount}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {incomingEmergencies.map((emergency: any) => (
                <div key={emergency.id} className="flex items-start gap-3 p-3 bg-white/70 rounded-lg border border-orange-200">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{emergency.patientName || "Unknown Patient"}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(emergency.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <Badge variant="outline" className="mt-1 text-xs">{emergency.status}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}


        {/* Statistics Cards */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => {
            const TrendIcon = stat.trend === "up" ? TrendingUp : stat.trend === "down" ? TrendingDown : Minus;
            const trendColor = stat.trend === "up" ? "text-green-600" : stat.trend === "down" ? "text-red-600" : "text-muted-foreground";
            
            return (
              <Card 
                key={index} 
                data-testid={`stat-card-${index}`}
                className="border-none shadow-lg bg-gradient-to-br from-white to-accent/20 overflow-hidden relative group hover:shadow-xl transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500"></div>
                <CardContent className="p-5 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{stat.title}</p>
                      <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        {stat.value}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <TrendIcon className={`w-4 h-4 ${trendColor}`} />
                        <span className={`text-sm font-semibold ${trendColor}`}>{stat.change}</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Card 
              className="group cursor-pointer border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-accent/20 overflow-hidden relative" 
              onClick={() => setLocation("/hospital/emergencies")} 
              data-testid="action-emergencies"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-5 flex flex-col items-center gap-3 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-destructive to-destructive/70 flex items-center justify-center shadow-md relative group-hover:scale-110 transition-transform duration-300">
                  <AlertTriangle className="w-7 h-7 text-white" />
                  {activeEmergencies > 0 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white text-destructive text-xs font-bold flex items-center justify-center shadow-md">
                      {activeEmergencies}
                    </div>
                  )}
                </div>
                <p className="font-semibold text-sm text-center">Emergencies</p>
              </CardContent>
            </Card>

            <Card 
              className="group cursor-pointer border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-accent/20 overflow-hidden relative" 
              onClick={() => setLocation("/hospital/doctors")} 
              data-testid="action-doctors"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-5 flex flex-col items-center gap-3 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Stethoscope className="w-7 h-7 text-white" />
                </div>
                <p className="font-semibold text-sm text-center">Manage Doctors</p>
              </CardContent>
            </Card>

            <Card 
              className="group cursor-pointer border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-accent/20 overflow-hidden relative" 
              onClick={() => setLocation("/hospital/appointments")} 
              data-testid="action-appointments"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-5 flex flex-col items-center gap-3 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <p className="font-semibold text-sm text-center">Appointments</p>
              </CardContent>
            </Card>

            <Card 
              className="group cursor-pointer border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-accent/20 overflow-hidden relative" 
              onClick={() => setLocation("/hospital/prescriptions")} 
              data-testid="action-prescriptions"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-5 flex flex-col items-center gap-3 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <p className="font-semibold text-sm text-center">Prescriptions</p>
              </CardContent>
            </Card>

            <Card 
              className="group cursor-pointer border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-accent/20 overflow-hidden relative col-span-2" 
              onClick={() => setLocation("/hospital/reports")} 
              data-testid="action-reports"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-5 flex flex-col items-center gap-3 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Activity className="w-7 h-7 text-white" />
                </div>
                <p className="font-semibold text-sm text-center">Reports & Analytics</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Appointments */}
        <Card className="border-none shadow-xl bg-gradient-to-br from-white to-accent/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="w-5 h-5 text-primary" />
              Recent Appointments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAppointments.map((apt) => (
              <div 
                key={apt.id} 
                className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-11 h-11 border-2 border-primary/20">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-semibold">
                      {apt.patient.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{apt.patient}</p>
                    <p className="text-xs text-muted-foreground">{apt.doctor} • {apt.time}</p>
                  </div>
                </div>
                <Badge 
                  variant={apt.status === "approved" ? "default" : "outline"} 
                  className="capitalize text-xs px-3 py-1"
                >
                  {apt.status}
                </Badge>
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full h-11 rounded-xl border-2 hover:bg-accent/50 hover:border-primary/30 transition-all duration-300"
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
