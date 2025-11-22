import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppointmentCard from "@/components/AppointmentCard";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/auth";

const departmentMap: Record<string, string> = {
  "cardiology": "Cardiology",
  "general": "General Medicine",
  "orthopedics": "Orthopedics",
  "pediatrics": "Pediatrics"
};

const timeMap: Record<string, string> = {
  "09:00": "9:00 AM",
  "10:00": "10:00 AM",
  "11:00": "11:00 AM",
  "14:00": "2:00 PM",
  "15:00": "3:00 PM",
  "16:00": "4:00 PM"
};

interface Hospital {
  id: string;
  name: string;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
}

interface Appointment {
  id: string;
  hospitalId: string;
  hospitalName: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed";
}

const defaultAppointments: Appointment[] = [
  {
    id: "1",
    doctorName: "Dr. Sarah Johnson",
    department: "Cardiology",
    date: "Nov 15, 2025",
    time: "2:00 PM",
    status: "confirmed"
  },
  {
    id: "2",
    doctorName: "Dr. Michael Chen",
    department: "General Medicine",
    date: "Nov 20, 2025",
    time: "10:30 AM",
    status: "pending"
  },
  {
    id: "3",
    doctorName: "Dr. Priya Patel",
    department: "Pediatrics",
    date: "Oct 28, 2025",
    time: "3:00 PM",
    status: "completed"
  }
];

export default function Appointments() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [hospital, setHospital] = useState("");
  const [department, setDepartment] = useState("");
  const [doctor, setDoctor] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [activeTab, setActiveTab] = useState("book");

  // Fetch registered hospitals
  const { data: hospitals = [] } = useQuery({
    queryKey: ["/api/admin/hospitals"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/admin/hospitals");
        return res.json();
      } catch (error) {
        console.error("Failed to fetch hospitals:", error);
        return [];
      }
    },
  });

  // Fetch doctors for selected hospital
  const { data: doctors = [] } = useQuery<Doctor[]>({
    queryKey: ["/api/hospital", hospital, "doctors"],
    queryFn: async () => {
      if (!hospital) return [];
      try {
        const res = await apiRequest("GET", `/api/hospital/${hospital}/doctors`);
        return res.json();
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
        return [];
      }
    },
    enabled: !!hospital,
  });

  // Fetch patient's appointments from backend
  const { data: dbAppointments = [], refetch: refetchAppointments } = useQuery({
    queryKey: ["/api/appointments/user", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      try {
        const res = await apiRequest("GET", `/api/appointments/user/${user.id}`);
        return res.json();
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
        return [];
      }
    },
    enabled: !!user?.id,
  });

  // Mutation to book appointment in database
  const bookAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      const res = await apiRequest("POST", "/api/appointments", appointmentData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Appointment booked and sent to hospital"
      });
      setHospital("");
      setDepartment("");
      setDoctor("");
      setDate(undefined);
      setTime("");
      setActiveTab("view");
      // Refetch appointments
      queryClient.invalidateQueries({ queryKey: ["/api/appointments/user", user?.id] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to book appointment",
        variant: "destructive"
      });
    }
  });
  
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const stored = localStorage.getItem("healthAppointments");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultAppointments;
      }
    }
    return defaultAppointments;
  });

  // Update appointments from database and sync to localStorage
  useEffect(() => {
    if (dbAppointments && dbAppointments.length > 0) {
      const mappedAppointments = dbAppointments.map((apt: any) => ({
        id: apt.id,
        hospitalId: apt.hospitalId,
        hospitalName: apt.hospitalName || "Hospital",
        doctorName: apt.doctorName || "Doctor",
        department: "General",
        date: new Date(apt.appointmentDate).toLocaleDateString("en-US", { 
          year: "numeric", 
          month: "short", 
          day: "numeric" 
        }),
        time: new Date(apt.appointmentDate).toLocaleTimeString("en-US", { 
          hour: "2-digit", 
          minute: "2-digit", 
          hour12: true 
        }),
        status: apt.status === "approved" ? "confirmed" : apt.status
      }));
      setAppointments(mappedAppointments);
      localStorage.setItem("healthAppointments", JSON.stringify(mappedAppointments));
    }
  }, [dbAppointments]);

  // Refetch appointments when page comes into focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refetchAppointments();
      }
    };

    const handleFocus = () => {
      refetchAppointments();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [refetchAppointments]);

  const handleBook = () => {
    if (!hospital || !department || !doctor || !date || !time || !user?.id) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to book an appointment",
        variant: "destructive"
      });
      return;
    }

    // Combine date and time into full appointment date
    const [hourStr, minuteStr] = time.split(':');
    const appointmentDateTime = new Date(date);
    appointmentDateTime.setHours(parseInt(hourStr), parseInt(minuteStr), 0, 0);

    const selectedHospital = hospitals.find((h: Hospital) => h.id === hospital);
    const hospitalName = selectedHospital?.name || hospital;

    // Find selected doctor
    const selectedDoctor = doctors.find((d: Doctor) => d.id === doctor);

    // POST to backend API
    bookAppointmentMutation.mutate({
      patientId: user.id,
      hospitalId: hospital,
      doctorId: doctor,
      appointmentDate: appointmentDateTime.toISOString(),
      status: "pending",
      patientName: user.fullName || user.username,
      patientPhone: user.phone || "N/A",
      symptoms: `${departmentMap[department] || department} consultation`,
      notes: `Requested with ${selectedDoctor?.name || "Doctor"}`
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b p-4 flex items-center gap-3 sticky top-0 bg-background z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/dashboard")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-semibold text-foreground">Appointments</h1>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="book" data-testid="tab-book">Book New</TabsTrigger>
          <TabsTrigger value="view" data-testid="tab-view">My Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="book" className="space-y-6 mt-6">
          <Card className="p-6">
            <form className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="hospital">Hospital</Label>
                <Select value={hospital} onValueChange={setHospital}>
                  <SelectTrigger id="hospital" data-testid="select-hospital">
                    <SelectValue placeholder="Select hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitals.length === 0 ? (
                      <SelectItem value="no-hospitals" disabled>No hospitals available</SelectItem>
                    ) : (
                      hospitals.map((h: Hospital) => (
                        <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger id="department" data-testid="select-department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="general">General Medicine</SelectItem>
                    <SelectItem value="orthopedics">Orthopedics</SelectItem>
                    <SelectItem value="pediatrics">Pediatrics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctor">Doctor</Label>
                <Select value={doctor} onValueChange={setDoctor}>
                  <SelectTrigger id="doctor" data-testid="select-doctor" disabled={doctors.length === 0}>
                    <SelectValue placeholder={doctors.length === 0 ? "No doctors available" : "Select doctor"} />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.length === 0 ? (
                      <SelectItem value="no-doctors" disabled>No doctors available for this hospital</SelectItem>
                    ) : (
                      doctors.map((d: Doctor) => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date</Label>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                  data-testid="calendar-date"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Preferred Time</Label>
                <Select value={time} onValueChange={setTime}>
                  <SelectTrigger id="time" data-testid="select-time">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                    <SelectItem value="10:00">10:00 AM</SelectItem>
                    <SelectItem value="11:00">11:00 AM</SelectItem>
                    <SelectItem value="14:00">2:00 PM</SelectItem>
                    <SelectItem value="15:00">3:00 PM</SelectItem>
                    <SelectItem value="16:00">4:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="button" className="w-full" onClick={handleBook} disabled={!hospital} data-testid="button-book-appointment">
                Book Appointment
              </Button>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="view" className="space-y-4 mt-6">
          {(() => {
            // Filter out completed appointments and sort by date
            const activeAppointments = appointments
              .filter(apt => apt.status !== "completed")
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            // Get next appointment (first in sorted list)
            const nextAppointment = activeAppointments[0];

            // Get remaining appointments
            const remainingAppointments = activeAppointments.slice(1);

            if (appointments.length === 0 || activeAppointments.length === 0) {
              return (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No upcoming appointments scheduled</p>
                </Card>
              );
            }

            return (
              <>
                {/* Next Appointment - Highlighted */}
                {nextAppointment && (
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-muted-foreground mb-3">Next Appointment</p>
                    <Card className="p-4 border-2 border-accent bg-accent/5">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-foreground">{nextAppointment.doctorName}</p>
                            <p className="text-sm text-muted-foreground">{nextAppointment.department}</p>
                          </div>
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-accent text-accent-foreground">
                            {nextAppointment.status === "confirmed" ? "Confirmed" : "Pending"}
                          </span>
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>{nextAppointment.date}</span>
                          <span>{nextAppointment.time}</span>
                        </div>
                        {nextAppointment.hospitalName && (
                          <p className="text-sm text-muted-foreground">{nextAppointment.hospitalName}</p>
                        )}
                      </div>
                    </Card>
                  </div>
                )}

                {/* Other Upcoming Appointments */}
                {remainingAppointments.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-3">Other Upcoming Appointments</p>
                    <div className="space-y-3">
                      {remainingAppointments.map((appointment) => (
                        <AppointmentCard
                          key={appointment.id}
                          doctorName={appointment.doctorName}
                          department={appointment.department}
                          date={appointment.date}
                          time={appointment.time}
                          status={appointment.status}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
