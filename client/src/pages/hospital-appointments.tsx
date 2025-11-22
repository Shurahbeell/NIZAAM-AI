import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar, User, Check, X, Edit } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Appointment as DbAppointment } from "@shared/schema";

interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  doctorName?: string;
  date: string;
  time?: string;
  symptoms?: string;
  status: "pending" | "approved" | "completed" | "cancelled";
  notes?: string;
  appointmentDate: Date | string;
}

export default function HospitalAppointments() {
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [notes, setNotes] = useState("");

  // Fetch real appointments for this hospital
  const { data: dbAppointments = [], isLoading } = useQuery<DbAppointment[]>({
    queryKey: ["/api/hospital", user?.hospitalId, "appointments"],
    enabled: !!user?.hospitalId
  });

  // Fetch doctor details for all appointments
  const { data: doctorMap = {} } = useQuery<Record<string, any>>({
    queryKey: ["/api/hospital", user?.hospitalId, "doctors-map"],
    queryFn: async () => {
      if (!user?.hospitalId) return {};
      try {
        const res = await apiRequest("GET", `/api/hospital/${user.hospitalId}/doctors`);
        const doctors = await res.json();
        const map: Record<string, any> = {};
        doctors.forEach((doc: any) => {
          map[doc.id] = doc.name;
        });
        return map;
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
        return {};
      }
    },
    enabled: !!user?.hospitalId,
  });

  // Map database appointments to display format
  const appointments = dbAppointments.map(apt => ({
    id: apt.id,
    patientId: apt.patientId,
    patientName: apt.patientName,
    patientPhone: apt.patientPhone,
    doctorName: apt.doctorId && doctorMap[apt.doctorId] ? doctorMap[apt.doctorId] : "Doctor",
    date: new Date(apt.appointmentDate).toLocaleDateString("en-US"),
    time: new Date(apt.appointmentDate).toLocaleTimeString("en-US", { 
      hour: "2-digit", 
      minute: "2-digit", 
      hour12: true 
    }),
    symptoms: apt.symptoms || "No symptoms recorded",
    status: (apt.status as any) || "pending",
    notes: apt.notes,
    appointmentDate: apt.appointmentDate,
  }));

  // Update appointment status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (data: { id: string; status: string; patientId: string }) => {
      const res = await apiRequest("PATCH", `/api/appointments/${data.id}`, { status: data.status });
      return res.json();
    },
    onSuccess: (data) => {
      // Invalidate both hospital and patient appointment caches
      queryClient.invalidateQueries({ queryKey: ["/api/hospital", user?.hospitalId, "appointments"] });
      // Invalidate patient's appointment caches
      queryClient.invalidateQueries({ queryKey: ["/api/appointments/user", data.patientId] });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments/next", data.patientId] });
      toast({ title: "Success", description: "Appointment updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update appointment", variant: "destructive" });
    }
  });

  const updateStatus = (id: string, status: Appointment["status"], patientId: string) => {
    updateStatusMutation.mutate({ id, status, patientId });
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
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-24 bg-muted rounded-lg" />
              </Card>
            ))}
          </div>
        ) : (
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" data-testid="tab-all">All ({appointments.length})</TabsTrigger>
              <TabsTrigger value="pending" data-testid="tab-pending">
                Pending ({filterAppointments("pending").length})
              </TabsTrigger>
              <TabsTrigger value="approved" data-testid="tab-approved">Approved ({filterAppointments("approved").length})</TabsTrigger>
              <TabsTrigger value="completed" data-testid="tab-completed">Completed ({filterAppointments("completed").length})</TabsTrigger>
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
                              onClick={() => updateStatus(apt.id, "approved", apt.patientId)}
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
                              onClick={() => updateStatus(apt.id, "cancelled", apt.patientId)}
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
                            onClick={() => updateStatus(apt.id, "completed", apt.patientId)}
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
        )}
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
