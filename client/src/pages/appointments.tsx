import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppointmentCard from "@/components/AppointmentCard";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Doctor } from "@shared/schema";

export default function Appointments() {
  const [, setLocation] = useLocation();
  const [department, setDepartment] = useState("");
  const [doctor, setDoctor] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const { toast } = useToast();

  const { data: testUserData } = useQuery<{ userId: string }>({
    queryKey: ["/api/test-user"],
    queryFn: async () => {
      const res = await fetch("/api/test-user");
      if (!res.ok) throw new Error("Failed to fetch test user");
      return res.json();
    }
  });

  const { data: doctors = [], isLoading: loadingDoctors } = useQuery<Doctor[]>({
    queryKey: ["/api/doctors", department],
    queryFn: async () => {
      if (!department) return [];
      const res = await fetch(`/api/doctors?department=${encodeURIComponent(department)}`);
      if (!res.ok) throw new Error("Failed to fetch doctors");
      return res.json();
    },
    enabled: !!department
  });

  const { data: availableSlots, isLoading: loadingSlots } = useQuery<{ availableSlots: string[] }>({
    queryKey: ["/api/doctors", doctor, "available-slots", date?.toISOString()],
    queryFn: async () => {
      if (!doctor || !date) return { availableSlots: [] };
      const dateStr = date.toISOString().split('T')[0];
      const res = await fetch(`/api/doctors/${doctor}/available-slots?date=${dateStr}`);
      return res.json();
    },
    enabled: !!doctor && !!date
  });

  const bookAppointmentMutation = useMutation({
    mutationFn: async () => {
      if (!doctor || !date || !time || !testUserData?.userId) {
        throw new Error("Please fill all fields");
      }
      
      return await apiRequest("POST", "/api/appointments", {
        userId: testUserData.userId,
        doctorId: doctor,
        appointmentDate: date.toISOString(),
        appointmentTime: time,
        notes: ""
      });
    },
    onSuccess: () => {
      toast({
        title: "Appointment Booked!",
        description: "Your appointment has been successfully scheduled."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setDepartment("");
      setDoctor("");
      setDate(undefined);
      setTime("");
    },
    onError: () => {
      toast({
        title: "Booking Failed",
        description: "Unable to book appointment. Please try again.",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if (department) {
      setDoctor("");
      setTime("");
    }
  }, [department]);

  useEffect(() => {
    if (doctor || date) {
      setTime("");
    }
  }, [doctor, date]);

  const handleBook = () => {
    bookAppointmentMutation.mutate();
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

      <Tabs defaultValue="book" className="p-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="book" data-testid="tab-book">Book New</TabsTrigger>
          <TabsTrigger value="view" data-testid="tab-view">My Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="book" className="space-y-6 mt-6">
          <Card className="p-6">
            <form className="space-y-6">
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
                <Select value={doctor} onValueChange={setDoctor} disabled={!department || loadingDoctors}>
                  <SelectTrigger id="doctor" data-testid="select-doctor">
                    <SelectValue placeholder={loadingDoctors ? "Loading doctors..." : "Select doctor"} />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        {doc.name} - {doc.specialization}
                      </SelectItem>
                    ))}
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
                <Label htmlFor="time">Available Time Slots</Label>
                <Select value={time} onValueChange={setTime} disabled={!doctor || !date || loadingSlots}>
                  <SelectTrigger id="time" data-testid="select-time">
                    <SelectValue placeholder={loadingSlots ? "Loading slots..." : "Select time"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSlots && availableSlots.availableSlots.length > 0 ? (
                      availableSlots.availableSlots.map((slot) => {
                        const [hours, mins] = slot.split(':');
                        const hour = parseInt(hours);
                        const period = hour >= 12 ? 'PM' : 'AM';
                        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                        return (
                          <SelectItem key={slot} value={slot}>
                            {displayHour}:{mins} {period}
                          </SelectItem>
                        );
                      })
                    ) : (
                      <SelectItem value="no-slots" disabled>
                        No available slots
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="button" 
                className="w-full" 
                onClick={handleBook} 
                data-testid="button-book-appointment"
                disabled={!department || !doctor || !date || !time || bookAppointmentMutation.isPending}
              >
                {bookAppointmentMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Book Appointment
              </Button>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="view" className="space-y-4 mt-6">
          <AppointmentCard
            doctorName="Dr. Sarah Johnson"
            department="Cardiology"
            date="Nov 15, 2025"
            time="2:00 PM"
            status="confirmed"
          />
          <AppointmentCard
            doctorName="Dr. Michael Chen"
            department="General Medicine"
            date="Nov 20, 2025"
            time="10:30 AM"
            status="pending"
          />
          <AppointmentCard
            doctorName="Dr. Priya Patel"
            department="Pediatrics"
            date="Oct 28, 2025"
            time="3:00 PM"
            status="completed"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
