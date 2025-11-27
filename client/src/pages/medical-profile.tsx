import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Save, Plus, Trash2, User, Heart, Activity, Syringe, Phone } from "lucide-react";
import { useLocation } from "wouter";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { MedicalHistory, Medicines } from "@shared/schema";

export default function MedicalProfile() {
  const { t } = { t: (key: string) => key };
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [bloodGroup, setBloodGroup] = useState("");
  const [newCondition, setNewCondition] = useState("");
  const [newMedication, setNewMedication] = useState("");
  const [newMedicationDosage, setNewMedicationDosage] = useState("");
  const [newMedicationFrequency, setNewMedicationFrequency] = useState("");
  const [newMedicationReason, setNewMedicationReason] = useState("");

  // Fetch medical history
  const { data: medicalHistory = [] } = useQuery<MedicalHistory[]>({
    queryKey: ["/api/medical-history"],
    enabled: !!user,
  });

  // Fetch medicines
  const { data: medicines = [] } = useQuery<Medicines[]>({
    queryKey: ["/api/medicines"],
    enabled: !!user,
  });

  // Create medical history mutation
  const createMedicalHistoryMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/medical-history", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medical-history"] });
      setNewCondition("");
      toast({ title: "Success", description: "Medical history added" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Create medicine mutation
  const createMedicineMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/medicines", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medicines"] });
      setNewMedication("");
      setNewMedicationDosage("");
      setNewMedicationFrequency("");
      setNewMedicationReason("");
      toast({ title: "Success", description: "Medicine added" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Delete medical history mutation
  const deleteMedicalHistoryMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/medical-history/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medical-history"] });
      toast({ title: "Success", description: "Medical history deleted" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Delete medicine mutation
  const deleteMedicineMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/medicines/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medicines"] });
      toast({ title: "Success", description: "Medicine deleted" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleAddCondition = () => {
    if (newCondition.trim()) {
      createMedicalHistoryMutation.mutate({
        condition: newCondition.trim(),
        status: "active",
      });
    }
  };

  const handleAddMedicine = () => {
    if (newMedication.trim() && newMedicationDosage.trim()) {
      createMedicineMutation.mutate({
        name: newMedication.trim(),
        dosage: newMedicationDosage.trim(),
        frequency: newMedicationFrequency.trim() || "Not specified",
        reason: newMedicationReason.trim() || "General health",
        isActive: true,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="p-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/dashboard")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground">Medical Profile</h1>
            <p className="text-xs text-muted-foreground">Your complete health information</p>
          </div>
          <Button
            variant={isEditing ? "default" : "outline"}
            size="icon"
            onClick={() => setIsEditing(!isEditing)}
            data-testid={isEditing ? "button-save" : "button-edit"}
          >
            {isEditing ? <Save className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="blood-group">Blood Group</Label>
              {isEditing ? (
                <Select value={bloodGroup} onValueChange={setBloodGroup}>
                  <SelectTrigger data-testid="select-blood-group">
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-foreground font-medium">{bloodGroup || "Not specified"}</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Chronic Diseases
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {medicalHistory.length === 0 && !isEditing && (
              <p className="text-sm text-muted-foreground">No chronic diseases recorded</p>
            )}
            <div className="flex flex-wrap gap-2">
              {medicalHistory.map((item) => (
                <Badge key={item.id} variant="outline" className="gap-1" data-testid={`badge-disease-${item.id}`}>
                  {item.condition}
                  {isEditing && (
                    <button
                      onClick={() => deleteMedicalHistoryMutation.mutate(item.id)}
                      data-testid={`button-remove-disease-${item.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <Input
                  placeholder="Add chronic disease..."
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddCondition()}
                  data-testid="input-new-disease"
                />
                <Button onClick={handleAddCondition} size="icon" data-testid="button-add-disease">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Current Medications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {medicines.length === 0 && !isEditing && (
              <p className="text-sm text-muted-foreground">No medications recorded</p>
            )}
            <div className="space-y-2">
              {medicines.map((med) => (
                <div key={med.id} className="p-3 border rounded-lg flex justify-between items-start" data-testid={`card-medicine-${med.id}`}>
                  <div>
                    <p className="font-medium text-foreground">{med.name}</p>
                    <p className="text-sm text-muted-foreground">{med.dosage} - {med.frequency}</p>
                    <p className="text-xs text-muted-foreground">{med.reason}</p>
                  </div>
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMedicineMutation.mutate(med.id)}
                      data-testid={`button-remove-medication-${med.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {isEditing && (
              <div className="space-y-2 p-3 border rounded-lg bg-muted/50">
                <Input
                  placeholder="Medicine name"
                  value={newMedication}
                  onChange={(e) => setNewMedication(e.target.value)}
                  data-testid="input-new-medication-name"
                />
                <Input
                  placeholder="Dosage (e.g., 500mg)"
                  value={newMedicationDosage}
                  onChange={(e) => setNewMedicationDosage(e.target.value)}
                  data-testid="input-new-medication-dosage"
                />
                <Input
                  placeholder="Frequency (e.g., twice daily)"
                  value={newMedicationFrequency}
                  onChange={(e) => setNewMedicationFrequency(e.target.value)}
                  data-testid="input-new-medication-frequency"
                />
                <Input
                  placeholder="Reason for medication"
                  value={newMedicationReason}
                  onChange={(e) => setNewMedicationReason(e.target.value)}
                  data-testid="input-new-medication-reason"
                />
                <Button
                  onClick={handleAddMedicine}
                  className="w-full"
                  data-testid="button-add-medication"
                  disabled={createMedicineMutation.isPending}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Medicine
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
