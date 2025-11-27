import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Stethoscope, Edit2, Trash2, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface Doctor {
  id: string;
  hospitalId: string;
  name: string;
  specialization: string;
  qualification: string;
  consultationFee: number;
  availability: string;
  isAvailable: boolean;
}

const specializations = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Pediatrician",
  "Gynecologist",
  "Orthopedic",
  "ENT Specialist",
  "Neurologist",
  "Psychiatrist",
  "Dentist"
];

export default function HospitalDoctors() {
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const hospitalId = user?.hospitalId || "";
  
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    qualification: "",
    consultationFee: "",
    availability: "Mon-Fri: 9AM-5PM"
  });

  // Fetch doctors for hospital
  const { data: doctors = [], refetch } = useQuery<Doctor[]>({
    queryKey: [`/api/hospital/${hospitalId}/doctors`],
    enabled: !!hospitalId
  });

  // Create doctor mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", `/api/hospital/${hospitalId}/doctors`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Doctor added successfully" });
      queryClient.invalidateQueries({ queryKey: [`/api/hospital/${hospitalId}/doctors`] });
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to add doctor", variant: "destructive" });
    }
  });

  // Update doctor mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PATCH", `/api/hospital/${hospitalId}/doctors/${editingDoctor!.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Doctor updated successfully" });
      queryClient.invalidateQueries({ queryKey: [`/api/hospital/${hospitalId}/doctors`] });
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update doctor", variant: "destructive" });
    }
  });

  // Delete doctor mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/hospital/${hospitalId}/doctors/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Doctor deleted successfully" });
      queryClient.invalidateQueries({ queryKey: [`/api/hospital/${hospitalId}/doctors`] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete doctor", variant: "destructive" });
    }
  });

  // Toggle availability mutation
  const toggleMutation = useMutation({
    mutationFn: async (doctor: Doctor) => {
      const response = await apiRequest("PATCH", `/api/hospital/${hospitalId}/doctors/${doctor.id}`, {
        isAvailable: !doctor.isAvailable
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/hospital/${hospitalId}/doctors`] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to toggle availability", variant: "destructive" });
    }
  });

  const saveDoctor = () => {
    if (!formData.name || !formData.specialization || !formData.consultationFee) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    const data = {
      name: formData.name,
      specialization: formData.specialization,
      qualification: formData.qualification,
      consultationFee: parseInt(formData.consultationFee),
      availability: formData.availability
    };

    if (editingDoctor) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      specialization: "",
      qualification: "",
      consultationFee: "",
      availability: "Mon-Fri: 9AM-5PM"
    });
    setEditingDoctor(null);
    setIsAddOpen(false);
  };

  const openEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name,
      specialization: doctor.specialization,
      qualification: doctor.qualification,
      consultationFee: doctor.consultationFee.toString(),
      availability: doctor.availability
    });
    setIsAddOpen(true);
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
            <h1 className="text-xl font-semibold text-foreground">Doctor Management</h1>
            <p className="text-xs text-muted-foreground">{doctors.length} doctors registered</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => resetForm()} data-testid="button-add-doctor">
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingDoctor ? "Edit Doctor" : "Add New Doctor"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Doctor Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Dr. Name"
                    data-testid="input-doctor-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Select value={formData.specialization} onValueChange={(value) => setFormData({ ...formData, specialization: value })}>
                    <SelectTrigger data-testid="select-specialization">
                      <SelectValue placeholder="Select specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      {specializations.map((spec) => (
                        <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qualification">Qualification</Label>
                  <Input
                    id="qualification"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="MBBS, MD, etc."
                    data-testid="input-qualification"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fee">Consultation Fee (PKR)</Label>
                  <Input
                    id="fee"
                    type="number"
                    value={formData.consultationFee}
                    onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                    placeholder="1500"
                    data-testid="input-fee"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  <Input
                    id="availability"
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    placeholder="Mon-Fri: 9AM-5PM"
                    data-testid="input-availability"
                  />
                </div>

                <Button 
                  onClick={saveDoctor} 
                  className="w-full" 
                  data-testid="button-save-doctor"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : (editingDoctor ? "Update Doctor" : "Add Doctor")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="p-4 space-y-3">
        {doctors.map((doctor) => (
          <Card key={doctor.id} data-testid={`doctor-card-${doctor.id}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{doctor.name}</h3>
                      <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                      <p className="text-xs text-muted-foreground">{doctor.qualification}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(doctor)}
                        data-testid={`button-edit-${doctor.id}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(doctor.id)}
                        data-testid={`button-delete-${doctor.id}`}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant="outline">PKR {doctor.consultationFee}</Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {doctor.availability}
                    </Badge>
                    <Button
                      variant={doctor.isAvailable ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleMutation.mutate(doctor)}
                      data-testid={`button-toggle-${doctor.id}`}
                      disabled={toggleMutation.isPending}
                    >
                      {doctor.isAvailable ? "Available" : "Unavailable"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {doctors.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Stethoscope className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">No doctors registered yet</p>
              <Button onClick={() => setIsAddOpen(true)} className="mt-4" data-testid="button-add-first">
                Add First Doctor
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
