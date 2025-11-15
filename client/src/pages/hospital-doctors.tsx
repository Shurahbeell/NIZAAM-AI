import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Stethoscope, Edit2, Trash2, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Doctor {
  id: string;
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
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    qualification: "",
    consultationFee: "",
    availability: "Mon-Fri: 9AM-5PM"
  });

  useEffect(() => {
    const stored = localStorage.getItem("hospitalDoctors");
    if (stored) {
      setDoctors(JSON.parse(stored));
    } else {
      // Demo data
      const demoData: Doctor[] = [
        {
          id: "1",
          name: "Dr. Sarah Khan",
          specialization: "Cardiologist",
          qualification: "MBBS, MD",
          consultationFee: 2000,
          availability: "Mon-Fri: 9AM-5PM",
          isAvailable: true
        },
        {
          id: "2",
          name: "Dr. Ali Raza",
          specialization: "Pediatrician",
          qualification: "MBBS, FCPS",
          consultationFee: 1500,
          availability: "Mon-Sat: 10AM-6PM",
          isAvailable: true
        }
      ];
      setDoctors(demoData);
      localStorage.setItem("hospitalDoctors", JSON.stringify(demoData));
    }
  }, []);

  const saveDoctor = () => {
    if (!formData.name || !formData.specialization || !formData.consultationFee) return;

    const doctor: Doctor = {
      id: editingDoctor?.id || Date.now().toString(),
      name: formData.name,
      specialization: formData.specialization,
      qualification: formData.qualification,
      consultationFee: parseInt(formData.consultationFee),
      availability: formData.availability,
      isAvailable: true
    };

    let updated: Doctor[];
    if (editingDoctor) {
      updated = doctors.map(d => d.id === editingDoctor.id ? doctor : d);
    } else {
      updated = [...doctors, doctor];
    }

    setDoctors(updated);
    localStorage.setItem("hospitalDoctors", JSON.stringify(updated));
    
    // Reset form
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

  const deleteDoctor = (id: string) => {
    const updated = doctors.filter(d => d.id !== id);
    setDoctors(updated);
    localStorage.setItem("hospitalDoctors", JSON.stringify(updated));
  };

  const toggleAvailability = (id: string) => {
    const updated = doctors.map(d => 
      d.id === id ? { ...d, isAvailable: !d.isAvailable } : d
    );
    setDoctors(updated);
    localStorage.setItem("hospitalDoctors", JSON.stringify(updated));
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
              <Button size="sm" onClick={() => { setEditingDoctor(null); setFormData({ name: "", specialization: "", qualification: "", consultationFee: "", availability: "Mon-Fri: 9AM-5PM" }); }} data-testid="button-add-doctor">
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

                <Button onClick={saveDoctor} className="w-full" data-testid="button-save-doctor">
                  {editingDoctor ? "Update Doctor" : "Add Doctor"}
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
                        onClick={() => deleteDoctor(doctor.id)}
                        data-testid={`button-delete-${doctor.id}`}
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
                      onClick={() => toggleAvailability(doctor.id)}
                      data-testid={`button-toggle-${doctor.id}`}
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
