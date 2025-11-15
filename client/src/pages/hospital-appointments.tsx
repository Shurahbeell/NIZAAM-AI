import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar, User, Clock, Check, X, Edit } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  date: string;
  time: string;
  symptoms: string;
  status: "pending" | "approved" | "completed" | "cancelled";
  notes?: string;
}

export default function HospitalAppointments() {
  const [, setLocation] = useLocation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("hospitalAppointments");
    if (stored) {
      setAppointments(JSON.parse(stored));
    } else {
      // Demo data
      const demoData: Appointment[] = [
        {
          id: "1",
          patientName: "Ahmed Ali",
          patientPhone: "+92 300 1234567",
          doctorName: "Dr. Sarah Khan",
          date: "2024-01-20",
          time: "10:00 AM",
          symptoms: "Chest pain, shortness of breath",
          status: "pending"
        },
        {
          id: "2",
          patientName: "Fatima Hassan",
          patientPhone: "+92 301 7654321",
          doctorName: "Dr. Ali Raza",
          date: "2024-01-20",
          time: "11:30 AM",
          symptoms: "Fever in child, cough",
          status: "approved"
        },
        {
          id: "3",
          patientName: "Muhammad Bilal",
          patientPhone: "+92 333 9876543",
          doctorName: "Dr. Sarah Khan",
          date: "2024-01-19",
          time: "2:00 PM",
          symptoms: "Regular checkup",
          status: "completed"
        }
      ];
      setAppointments(demoData);
      localStorage.setItem("hospitalAppointments", JSON.stringify(demoData));
    }
  }, []);

  const updateStatus = (id: string, status: Appointment["status"]) => {
    const updated = appointments.map(a => 
      a.id === id ? { ...a, status } : a
    );
    setAppointments(updated);
    localStorage.setItem("hospitalAppointments", JSON.stringify(updated));
  };

  const reschedule = () => {
    if (!selectedAppointment || !rescheduleDate || !rescheduleTime) return;

    const updated = appointments.map(a =>
      a.id === selectedAppointment.id
        ? { ...a, date: rescheduleDate, time: rescheduleTime, notes }
        : a
    );
    setAppointments(updated);
    localStorage.setItem("hospitalAppointments", JSON.stringify(updated));
    setIsDetailsOpen(false);
    setRescheduleDate("");
    setRescheduleTime("");
    setNotes("");
  };

  const openDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleDate(appointment.date);
    setRescheduleTime(appointment.time);
    setNotes(appointment.notes || "");
    setIsDetailsOpen(true);
  };

  const getStatusColor = (status: Appointment["status"]) => {
    switch (status) {
      case "pending": return "outline";
      case "approved": return "default";
      case "completed": return "secondary";
      case "cancelled": return "destructive";
    }
  };

  const filterAppointments = (status?: Appointment["status"]) => {
    if (!status) return appointments;
    return appointments.filter(a => a.status === status);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="p-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/hospital/dashboard")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground">Appointments</h1>
            <p className="text-xs text-muted-foreground">{appointments.length} total appointments</p>
          </div>
        </div>
      </header>

      <div className="p-4">
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
            <TabsTrigger value="pending" data-testid="tab-pending">
              Pending ({filterAppointments("pending").length})
            </TabsTrigger>
            <TabsTrigger value="approved" data-testid="tab-approved">Approved</TabsTrigger>
            <TabsTrigger value="completed" data-testid="tab-completed">Completed</TabsTrigger>
          </TabsList>

          {(["all", "pending", "approved", "completed"] as const).map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-3">
              {filterAppointments(tab === "all" ? undefined : tab).map((apt) => (
                <Card key={apt.id} data-testid={`appointment-card-${apt.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-foreground">{apt.patientName}</h3>
                            <p className="text-sm text-muted-foreground">{apt.patientPhone}</p>
                          </div>
                          <Badge variant={getStatusColor(apt.status)} className="capitalize">
                            {apt.status}
                          </Badge>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {new Date(apt.date).toLocaleDateString()} at {apt.time}
                          </div>
                          <p className="text-sm text-muted-foreground">Doctor: {apt.doctorName}</p>
                          <p className="text-sm text-muted-foreground">Symptoms: {apt.symptoms}</p>
                          {apt.notes && (
                            <p className="text-xs text-muted-foreground italic">Note: {apt.notes}</p>
                          )}
                        </div>

                        {apt.status === "pending" && (
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              onClick={() => updateStatus(apt.id, "approved")}
                              data-testid={`button-approve-${apt.id}`}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openDetails(apt)}
                              data-testid={`button-reschedule-${apt.id}`}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Reschedule
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateStatus(apt.id, "cancelled")}
                              data-testid={`button-cancel-${apt.id}`}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        )}

                        {apt.status === "approved" && (
                          <Button
                            size="sm"
                            className="mt-3"
                            onClick={() => updateStatus(apt.id, "completed")}
                            data-testid={`button-complete-${apt.id}`}
                          >
                            Mark as Completed
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filterAppointments(tab === "all" ? undefined : tab).length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">No {tab !== "all" && tab} appointments</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div>
                <p className="font-semibold">{selectedAppointment.patientName}</p>
                <p className="text-sm text-muted-foreground">{selectedAppointment.doctorName}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reschedule-date">New Date</Label>
                <Input
                  id="reschedule-date"
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  data-testid="input-reschedule-date"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reschedule-time">New Time</Label>
                <Input
                  id="reschedule-time"
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  data-testid="input-reschedule-time"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Reason for rescheduling..."
                  data-testid="textarea-notes"
                />
              </div>

              <Button onClick={reschedule} className="w-full" data-testid="button-save-reschedule">
                Reschedule Appointment
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
