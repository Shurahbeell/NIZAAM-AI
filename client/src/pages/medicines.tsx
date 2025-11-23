import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2, Clock, Pill, Bell } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  times: string[];
  frequency: string;
  startDate: string;
}

export default function Medicines() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeLeft, setTimeLeft] = useState<string>("");
  const notificationShownRef = useRef<Set<string>>(new Set());
  
  const [newMedicine, setNewMedicine] = useState({
    name: "",
    dosage: "",
    times: ["09:00"],
    frequency: "daily"
  });

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("medicines");
    if (stored) {
      setMedicines(JSON.parse(stored));
    }
    
    // Update every second for accurate countdown
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (medicines.length > 0) {
      localStorage.setItem("medicines", JSON.stringify(medicines));
    }
  }, [medicines]);

  const addMedicine = () => {
    if (!newMedicine.name || !newMedicine.dosage) return;

    const medicine: Medicine = {
      id: Date.now().toString(),
      name: newMedicine.name,
      dosage: newMedicine.dosage,
      times: newMedicine.times,
      frequency: newMedicine.frequency,
      startDate: new Date().toISOString()
    };

    setMedicines([...medicines, medicine]);
    setNewMedicine({
      name: "",
      dosage: "",
      times: ["09:00"],
      frequency: "daily"
    });
    setIsAddDialogOpen(false);
  };

  const deleteMedicine = (id: string) => {
    const updated = medicines.filter(m => m.id !== id);
    setMedicines(updated);
    localStorage.setItem("medicines", JSON.stringify(updated));
  };

  const addTimeSlot = () => {
    setNewMedicine({
      ...newMedicine,
      times: [...newMedicine.times, "09:00"]
    });
  };

  const updateTimeSlot = (index: number, value: string) => {
    const updatedTimes = [...newMedicine.times];
    updatedTimes[index] = value;
    setNewMedicine({ ...newMedicine, times: updatedTimes });
  };

  const removeTimeSlot = (index: number) => {
    const updatedTimes = newMedicine.times.filter((_, i) => i !== index);
    setNewMedicine({ ...newMedicine, times: updatedTimes });
  };

  const getUpcomingReminders = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    const reminders: { medicine: Medicine; time: string; isPast: boolean }[] = [];

    medicines.forEach(medicine => {
      medicine.times.forEach(time => {
        const isPast = time < currentTimeStr;
        reminders.push({ medicine, time, isPast });
      });
    });

    return reminders.sort((a, b) => a.time.localeCompare(b.time));
  };

  const calculateTimeLeft = () => {
    const reminders = getUpcomingReminders();
    const nextReminder = reminders.find(r => !r.isPast);
    
    if (!nextReminder) {
      return "";
    }

    const now = new Date();
    const [hours, minutes] = nextReminder.time.split(':').map(Number);
    
    let reminderDate = new Date();
    reminderDate.setHours(hours, minutes, 0, 0);

    // If reminder time has passed, it's for tomorrow
    if (reminderDate < now) {
      reminderDate.setDate(reminderDate.getDate() + 1);
    }

    const diffMs = reminderDate.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);

    if (diffMins < 0) return "";
    if (diffMins === 0) return `${diffSecs}s`;
    if (diffMins < 60) return `${diffMins}m ${diffSecs}s`;
    
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hrs}h ${mins}m`;
  };

  const checkAndNotify = () => {
    const reminders = getUpcomingReminders();
    const nextReminder = reminders.find(r => !r.isPast);
    
    if (!nextReminder) return;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    // Check if current time matches reminder time (within same minute)
    if (currentTimeStr === nextReminder.time) {
      const notificationKey = `${nextReminder.medicine.id}-${nextReminder.time}`;
      
      // Only show notification once per reminder time
      if (!notificationShownRef.current.has(notificationKey)) {
        notificationShownRef.current.add(notificationKey);

        // Show in-app toast notification
        toast({
          title: "Medicine Reminder",
          description: `Time to take ${nextReminder.medicine.name} - ${nextReminder.medicine.dosage}`,
        });

        // Show browser push notification if allowed
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Medicine Reminder", {
            body: `Time to take ${nextReminder.medicine.name} - ${nextReminder.medicine.dosage}`,
            icon: "/pill-icon.png",
          });
        }

        // Clear the notification key after 2 minutes so it can trigger again tomorrow
        setTimeout(() => {
          notificationShownRef.current.delete(notificationKey);
        }, 120000);
      }
    }
  };

  // Update time left and check for notifications
  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    checkAndNotify();
  }, [currentTime, medicines]);

  const reminders = getUpcomingReminders();
  const nextReminder = reminders.find(r => !r.isPast);

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
            <h1 className="text-xl font-semibold text-foreground">My Medicines</h1>
            <p className="text-xs text-muted-foreground">Medication tracker & reminders</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="icon" data-testid="button-add-medicine">
                <Plus className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Medicine</DialogTitle>
                <DialogDescription>
                  Add medication details and set reminder times
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="medicine-name">Medicine Name</Label>
                  <Input
                    id="medicine-name"
                    placeholder="e.g., Panadol"
                    value={newMedicine.name}
                    onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                    data-testid="input-medicine-name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input
                    id="dosage"
                    placeholder="e.g., 500mg or 2 tablets"
                    value={newMedicine.dosage}
                    onChange={(e) => setNewMedicine({ ...newMedicine, dosage: e.target.value })}
                    data-testid="input-dosage"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select 
                    value={newMedicine.frequency} 
                    onValueChange={(value) => setNewMedicine({ ...newMedicine, frequency: value })}
                  >
                    <SelectTrigger data-testid="select-frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="twice-daily">Twice Daily</SelectItem>
                      <SelectItem value="thrice-daily">Three Times Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Reminder Times</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={addTimeSlot}
                      data-testid="button-add-time"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Time
                    </Button>
                  </div>
                  {newMedicine.times.map((time, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => updateTimeSlot(index, e.target.value)}
                        data-testid={`input-time-${index}`}
                      />
                      {newMedicine.times.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTimeSlot(index)}
                          data-testid={`button-remove-time-${index}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={addMedicine} data-testid="button-save-medicine">
                  Add Medicine
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {nextReminder && (
          <Card className="border-primary bg-primary/5">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Next Reminder</p>
                <p className="text-sm text-muted-foreground">
                  {nextReminder.medicine.name} - {nextReminder.medicine.dosage} at {nextReminder.time}
                </p>
              </div>
              <div className="text-right">
                {timeLeft && (
                  <div className="text-sm font-medium text-primary">{timeLeft}</div>
                )}
                <p className="text-xs text-muted-foreground">Time left</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Current Medications</h2>
          {medicines.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Pill className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">No medicines added yet</p>
                <p className="text-xs text-muted-foreground">
                  Tap the + button to add your first medication
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {medicines.map((medicine) => (
                <Card key={medicine.id} data-testid={`medicine-card-${medicine.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Pill className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base">{medicine.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {medicine.dosage}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline" className="capitalize">
                              {medicine.frequency.replace('-', ' ')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMedicine(medicine.id)}
                        data-testid={`button-delete-${medicine.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      {medicine.times.map((time, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 text-sm text-muted-foreground bg-muted px-2 py-1 rounded"
                        >
                          <Clock className="w-3 h-3" />
                          {time}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {reminders.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">Today's Schedule</h2>
            <Card>
              <CardContent className="p-0">
                {reminders.map((reminder, index) => (
                  <div
                    key={index}
                    className={`p-4 flex items-center gap-3 ${
                      index !== reminders.length - 1 ? 'border-b' : ''
                    } ${reminder.isPast ? 'opacity-50' : ''}`}
                  >
                    <div className="w-16 text-sm font-medium text-foreground">
                      {reminder.time}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {reminder.medicine.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {reminder.medicine.dosage}
                      </p>
                    </div>
                    {reminder.isPast && (
                      <Badge variant="outline" className="text-xs">Taken</Badge>
                    )}
                    {!reminder.isPast && reminder === nextReminder && (
                      <Badge className="text-xs">Next</Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
