import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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

const doctorMap: Record<string, string> = {
  "dr-johnson": "Dr. Sarah Johnson",
  "dr-chen": "Dr. Michael Chen",
  "dr-patel": "Dr. Priya Patel"
};

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

  useEffect(() => {
    localStorage.setItem("healthAppointments", JSON.stringify(appointments));
  }, [appointments]);

  const handleBook = () => {
    if (!hospital || !department || !doctor || !date || !time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to book an appointment",
        variant: "destructive"
      });
      return;
    }

    const formattedDate = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });

    const selectedHospital = hospitals.find((h: Hospital) => h.id === hospital);
    const hospitalName = selectedHospital?.name || hospital;

    const newAppointment: Appointment = {
      id: Date.now().toString(),
      hospitalId: hospital,
      hospitalName: hospitalName,
      doctorName: doctorMap[doctor] || doctor,
      department: departmentMap[department] || department,
      date: formattedDate,
      time: timeMap[time] || time,
      status: "pending"
    };

    setAppointments([newAppointment, ...appointments]);

    toast({
      title: "Appointment Booked!",
      description: `Your appointment with ${newAppointment.doctorName} at ${hospitalName} has been scheduled for ${formattedDate} at ${newAppointment.time}`,
    });

    setHospital("");
    setDepartment("");
    setDoctor("");
    setDate(undefined);
    setTime("");
    
    setActiveTab("view");
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
                  <SelectTrigger id="doctor" data-testid="select-doctor">
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dr-johnson">Dr. Sarah Johnson</SelectItem>
                    <SelectItem value="dr-chen">Dr. Michael Chen</SelectItem>
                    <SelectItem value="dr-patel">Dr. Priya Patel</SelectItem>
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
          {appointments.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No appointments scheduled yet</p>
            </Card>
          ) : (
            appointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                doctorName={appointment.doctorName}
                department={appointment.department}
                date={appointment.date}
                time={appointment.time}
                status={appointment.status}
              />
            )).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
