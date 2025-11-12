import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, X } from "lucide-react";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Profile() {
  const [, setLocation] = useLocation();
  const [medicalTags, setMedicalTags] = useState(["Diabetes", "Hypertension"]);
  const [newTag, setNewTag] = useState("");

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
            <Button variant="outline" size="sm" data-testid="button-change-photo">
              Change Photo
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Personal Information</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue="Ali Ahmed" data-testid="input-name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" defaultValue="+92 300 1234567" data-testid="input-phone" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnic">CNIC</Label>
              <Input id="cnic" defaultValue="12345-1234567-1" data-testid="input-cnic" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" defaultValue="123 Main Street, Karachi" data-testid="input-address" />
            </div>
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

        <div className="space-y-3">
          <Button variant="outline" className="w-full" data-testid="button-export">
            Export My Health Data
          </Button>
          <Button variant="destructive" className="w-full" onClick={() => setLocation("/login")} data-testid="button-logout">
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
