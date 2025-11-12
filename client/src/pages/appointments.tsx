import { useState } from "react";
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

export default function Appointments() {
  const [, setLocation] = useLocation();
  const [department, setDepartment] = useState("");
  const [doctor, setDoctor] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");

  const handleBook = () => {
    console.log("Booking appointment", { department, doctor, date, time });
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

              <Button type="button" className="w-full" onClick={handleBook} data-testid="button-book-appointment">
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
