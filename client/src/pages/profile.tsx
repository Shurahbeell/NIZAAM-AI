import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, X, Loader2, Globe } from "lucide-react";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/lib/auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/useLanguage";
import { Language } from "@/lib/translations";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, setAuth, token } = useAuthStore();
  const { toast } = useToast();
  const { language, setLanguage } = useLanguage();
  const [medicalTags, setMedicalTags] = useState(["Diabetes", "Hypertension"]);
  const [newTag, setNewTag] = useState("");

  // Form state
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [cnic, setCnic] = useState(user?.cnic || "");
  const [address, setAddress] = useState(user?.address || "");
  const [age, setAge] = useState(user?.age?.toString() || "");
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || "");
  const [emergencyContact, setEmergencyContact] = useState(user?.emergencyContact || "");

  // Sync form state when user data changes (e.g., after login or profile update)
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setPhone(user.phone || "");
      setCnic(user.cnic || "");
      setAddress(user.address || "");
      setAge(user.age?.toString() || "");
      setBloodGroup(user.bloodGroup || "");
      setEmergencyContact(user.emergencyContact || "");
    }
  }, [user]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!user) throw new Error("No user logged in");
      const response = await apiRequest("PATCH", `/api/auth/users/${user.id}`, data);
      const updatedUserData = await response.json();
      return updatedUserData;
    },
    onSuccess: (updatedUser) => {
      console.log("[Profile] Update successful, received user:", updatedUser);
      // Update auth store with server response (authoritative data)
      if (token && updatedUser) {
        setAuth(token, updatedUser);
      }
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
    },
    onError: (error: any) => {
      console.error("[Profile] Update failed:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = () => {
    const profileData: any = {
      fullName: fullName.trim() || undefined,
      phone: phone.trim() || undefined,
      cnic: cnic.trim() || undefined,
      address: address.trim() || undefined,
      age: age.trim() || undefined, // Send as string, server will convert
      bloodGroup: bloodGroup.trim() || undefined,
      emergencyContact: emergencyContact.trim() || undefined,
    };
    
    // Remove undefined values
    Object.keys(profileData).forEach(key => 
      profileData[key] === undefined && delete profileData[key]
    );
    
    console.log("[Profile] Saving profile data:", profileData);
    updateProfileMutation.mutate(profileData);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !medicalTags.includes(newTag.trim())) {
      setMedicalTags([...medicalTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setMedicalTags(medicalTags.filter(t => t !== tag));
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="border-b p-4 flex items-center gap-3 sticky top-0 bg-background z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/dashboard")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-semibold text-foreground">Profile</h1>
      </header>

      <div className="p-4 space-y-6">
        <Card className="p-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="text-2xl">
                <User className="w-12 h-12" />
              </AvatarFallback>
            </Avatar>
            <p className="text-sm text-muted-foreground">{user?.username}</p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Personal Information</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                data-testid="input-name" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
                data-testid="input-phone" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnic">CNIC</Label>
              <Input 
                id="cnic" 
                value={cnic}
                onChange={(e) => setCnic(e.target.value)}
                placeholder="12345-1234567-1"
                data-testid="input-cnic" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your address"
                data-testid="input-address" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input 
                id="age" 
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter your age"
                data-testid="input-age" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bloodGroup">Blood Group</Label>
              <Input 
                id="bloodGroup" 
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                placeholder="A+, B+, O+, AB+, etc."
                data-testid="input-blood-group" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input 
                id="emergencyContact" 
                type="tel"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="+92 300 1234567"
                data-testid="input-emergency-contact" 
              />
            </div>

            <Button 
              onClick={handleSaveProfile} 
              disabled={updateProfileMutation.isPending}
              className="w-full"
              data-testid="button-save-profile"
            >
              {updateProfileMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Profile
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Medical Information</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Medical Conditions</Label>
              <div className="flex flex-wrap gap-2">
                {medicalTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover-elevate"
                      data-testid={`button-remove-${tag.toLowerCase()}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder="Add condition or allergy"
                  data-testid="input-new-tag"
                />
                <Button onClick={handleAddTag} data-testid="button-add-tag">Add</Button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Language</h3>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={language === 'en' ? 'default' : 'outline'}
              onClick={() => setLanguage('en')}
              data-testid="button-lang-en-profile"
              className="flex-1 min-w-[100px]"
            >
              English
            </Button>
            <Button
              variant={language === 'ur' ? 'default' : 'outline'}
              onClick={() => setLanguage('ur')}
              data-testid="button-lang-ur-profile"
              className="flex-1 min-w-[100px]"
            >
              اردو
            </Button>
            <Button
              variant={language === 'ru' ? 'default' : 'outline'}
              onClick={() => setLanguage('ru')}
              data-testid="button-lang-ru-profile"
              className="flex-1 min-w-[100px]"
            >
              Urdu
            </Button>
          </div>
        </Card>

        <Button variant="destructive" className="w-full" onClick={() => setLocation("/login")} data-testid="button-logout">
          Logout
        </Button>
      </div>
    </div>
  );
}
