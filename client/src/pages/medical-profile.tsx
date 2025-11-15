import { useState, useEffect } from "react";
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

interface MedicalProfile {
  bloodGroup: string;
  allergies: string[];
  chronicDiseases: string[];
  surgeries: Array<{ name: string; date: string }>;
  vaccinationStatus: Array<{ vaccine: string; date: string }>;
  familyHistory: string;
  currentMedications: string[];
  emergencyContacts: Array<{ name: string; relationship: string; phone: string }>;
}

export default function MedicalProfile() {
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<MedicalProfile>({
    bloodGroup: "",
    allergies: [],
    chronicDiseases: [],
    surgeries: [],
    vaccinationStatus: [],
    familyHistory: "",
    currentMedications: [],
    emergencyContacts: []
  });

  const [newAllergy, setNewAllergy] = useState("");
  const [newDisease, setNewDisease] = useState("");
  const [newMedication, setNewMedication] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("medicalProfile");
    if (stored) {
      setProfile(JSON.parse(stored));
    }
  }, []);

  const saveProfile = () => {
    localStorage.setItem("medicalProfile", JSON.stringify(profile));
    setIsEditing(false);
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setProfile({ ...profile, allergies: [...profile.allergies, newAllergy.trim()] });
      setNewAllergy("");
    }
  };

  const removeAllergy = (index: number) => {
    setProfile({ ...profile, allergies: profile.allergies.filter((_, i) => i !== index) });
  };

  const addDisease = () => {
    if (newDisease.trim()) {
      setProfile({ ...profile, chronicDiseases: [...profile.chronicDiseases, newDisease.trim()] });
      setNewDisease("");
    }
  };

  const removeDisease = (index: number) => {
    setProfile({ ...profile, chronicDiseases: profile.chronicDiseases.filter((_, i) => i !== index) });
  };

  const addMedication = () => {
    if (newMedication.trim()) {
      setProfile({ ...profile, currentMedications: [...profile.currentMedications, newMedication.trim()] });
      setNewMedication("");
    }
  };

  const removeMedication = (index: number) => {
    setProfile({ ...profile, currentMedications: profile.currentMedications.filter((_, i) => i !== index) });
  };

  const addEmergencyContact = () => {
    setProfile({
      ...profile,
      emergencyContacts: [...profile.emergencyContacts, { name: "", relationship: "", phone: "" }]
    });
  };

  const updateEmergencyContact = (index: number, field: string, value: string) => {
    const updated = [...profile.emergencyContacts];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, emergencyContacts: updated });
  };

  const removeEmergencyContact = (index: number) => {
    setProfile({ ...profile, emergencyContacts: profile.emergencyContacts.filter((_, i) => i !== index) });
  };

  const addSurgery = () => {
    setProfile({
      ...profile,
      surgeries: [...profile.surgeries, { name: "", date: "" }]
    });
  };

  const updateSurgery = (index: number, field: string, value: string) => {
    const updated = [...profile.surgeries];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, surgeries: updated });
  };

  const removeSurgery = (index: number) => {
    setProfile({ ...profile, surgeries: profile.surgeries.filter((_, i) => i !== index) });
  };

  const addVaccination = () => {
    setProfile({
      ...profile,
      vaccinationStatus: [...profile.vaccinationStatus, { vaccine: "", date: "" }]
    });
  };

  const updateVaccination = (index: number, field: string, value: string) => {
    const updated = [...profile.vaccinationStatus];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, vaccinationStatus: updated });
  };

  const removeVaccination = (index: number) => {
    setProfile({ ...profile, vaccinationStatus: profile.vaccinationStatus.filter((_, i) => i !== index) });
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
            onClick={() => isEditing ? saveProfile() : setIsEditing(true)}
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
                <Select value={profile.bloodGroup} onValueChange={(value) => setProfile({ ...profile, bloodGroup: value })}>
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
                <div className="text-foreground font-medium">{profile.bloodGroup || "Not specified"}</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-destructive" />
              Allergies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.allergies.length === 0 && !isEditing && (
              <p className="text-sm text-muted-foreground">No allergies recorded</p>
            )}
            <div className="flex flex-wrap gap-2">
              {profile.allergies.map((allergy, index) => (
                <Badge key={index} variant="destructive" className="gap-1">
                  {allergy}
                  {isEditing && (
                    <button onClick={() => removeAllergy(index)} data-testid={`button-remove-allergy-${index}`}>
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <Input
                  placeholder="Add allergy..."
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
                  data-testid="input-new-allergy"
                />
                <Button onClick={addAllergy} size="icon" data-testid="button-add-allergy">
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
              Chronic Diseases
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.chronicDiseases.length === 0 && !isEditing && (
              <p className="text-sm text-muted-foreground">No chronic diseases recorded</p>
            )}
            <div className="flex flex-wrap gap-2">
              {profile.chronicDiseases.map((disease, index) => (
                <Badge key={index} variant="outline" className="gap-1">
                  {disease}
                  {isEditing && (
                    <button onClick={() => removeDisease(index)} data-testid={`button-remove-disease-${index}`}>
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
                  value={newDisease}
                  onChange={(e) => setNewDisease(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addDisease()}
                  data-testid="input-new-disease"
                />
                <Button onClick={addDisease} size="icon" data-testid="button-add-disease">
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
              Surgeries
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.surgeries.length === 0 && !isEditing && (
              <p className="text-sm text-muted-foreground">No surgeries recorded</p>
            )}
            {profile.surgeries.map((surgery, index) => (
              <div key={index} className="space-y-2 p-3 border rounded-lg">
                {isEditing ? (
                  <>
                    <Input
                      placeholder="Surgery name"
                      value={surgery.name}
                      onChange={(e) => updateSurgery(index, 'name', e.target.value)}
                      data-testid={`input-surgery-name-${index}`}
                    />
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={surgery.date}
                        onChange={(e) => updateSurgery(index, 'date', e.target.value)}
                        data-testid={`input-surgery-date-${index}`}
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeSurgery(index)} data-testid={`button-remove-surgery-${index}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div>
                    <p className="font-medium text-foreground">{surgery.name}</p>
                    <p className="text-sm text-muted-foreground">{surgery.date}</p>
                  </div>
                )}
              </div>
            ))}
            {isEditing && (
              <Button variant="outline" onClick={addSurgery} className="w-full" data-testid="button-add-surgery">
                <Plus className="w-4 h-4 mr-2" />
                Add Surgery
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Syringe className="w-5 h-5 text-primary" />
              Vaccination Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.vaccinationStatus.length === 0 && !isEditing && (
              <p className="text-sm text-muted-foreground">No vaccinations recorded</p>
            )}
            {profile.vaccinationStatus.map((vaccination, index) => (
              <div key={index} className="space-y-2 p-3 border rounded-lg">
                {isEditing ? (
                  <>
                    <Input
                      placeholder="Vaccine name"
                      value={vaccination.vaccine}
                      onChange={(e) => updateVaccination(index, 'vaccine', e.target.value)}
                      data-testid={`input-vaccine-name-${index}`}
                    />
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={vaccination.date}
                        onChange={(e) => updateVaccination(index, 'date', e.target.value)}
                        data-testid={`input-vaccine-date-${index}`}
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeVaccination(index)} data-testid={`button-remove-vaccination-${index}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div>
                    <p className="font-medium text-foreground">{vaccination.vaccine}</p>
                    <p className="text-sm text-muted-foreground">{vaccination.date}</p>
                  </div>
                )}
              </div>
            ))}
            {isEditing && (
              <Button variant="outline" onClick={addVaccination} className="w-full" data-testid="button-add-vaccination">
                <Plus className="w-4 h-4 mr-2" />
                Add Vaccination
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Family History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                placeholder="Enter family history of diseases (e.g., diabetes, heart disease, cancer)..."
                value={profile.familyHistory}
                onChange={(e) => setProfile({ ...profile, familyHistory: e.target.value })}
                className="min-h-24"
                data-testid="textarea-family-history"
              />
            ) : (
              <p className="text-foreground whitespace-pre-wrap">{profile.familyHistory || "No family history recorded"}</p>
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
            {profile.currentMedications.length === 0 && !isEditing && (
              <p className="text-sm text-muted-foreground">No medications recorded</p>
            )}
            <div className="flex flex-wrap gap-2">
              {profile.currentMedications.map((medication, index) => (
                <Badge key={index} variant="outline" className="gap-1">
                  {medication}
                  {isEditing && (
                    <button onClick={() => removeMedication(index)} data-testid={`button-remove-medication-${index}`}>
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <Input
                  placeholder="Add medication..."
                  value={newMedication}
                  onChange={(e) => setNewMedication(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addMedication()}
                  data-testid="input-new-medication"
                />
                <Button onClick={addMedication} size="icon" data-testid="button-add-medication">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.emergencyContacts.length === 0 && !isEditing && (
              <p className="text-sm text-muted-foreground">No emergency contacts recorded</p>
            )}
            {profile.emergencyContacts.map((contact, index) => (
              <div key={index} className="space-y-2 p-3 border rounded-lg">
                {isEditing ? (
                  <>
                    <Input
                      placeholder="Name"
                      value={contact.name}
                      onChange={(e) => updateEmergencyContact(index, 'name', e.target.value)}
                      data-testid={`input-contact-name-${index}`}
                    />
                    <Input
                      placeholder="Relationship"
                      value={contact.relationship}
                      onChange={(e) => updateEmergencyContact(index, 'relationship', e.target.value)}
                      data-testid={`input-contact-relationship-${index}`}
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="Phone"
                        value={contact.phone}
                        onChange={(e) => updateEmergencyContact(index, 'phone', e.target.value)}
                        data-testid={`input-contact-phone-${index}`}
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeEmergencyContact(index)} data-testid={`button-remove-contact-${index}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div>
                    <p className="font-medium text-foreground">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                    <p className="text-sm text-muted-foreground">{contact.phone}</p>
                  </div>
                )}
              </div>
            ))}
            {isEditing && (
              <Button variant="outline" onClick={addEmergencyContact} className="w-full" data-testid="button-add-contact">
                <Plus className="w-4 h-4 mr-2" />
                Add Emergency Contact
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
