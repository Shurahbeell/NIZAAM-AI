import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Users, FileText, Activity } from "lucide-react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HospitalReports() {
  const [, setLocation] = useLocation();

  const dailyStats = {
    patients: 42,
    prescriptions: 35,
    labTests: 28,
    revenue: 125000
  };

  const weeklyStats = {
    patients: 284,
    prescriptions: 256,
    labTests: 198,
    revenue: 875000
  };

  const topDoctors = [
    { name: "Dr. Sarah Khan", patients: 45, revenue: 90000 },
    { name: "Dr. Ali Raza", patients: 38, revenue: 57000 },
    { name: "Dr. Ahmed Malik", patients: 32, revenue: 48000 }
  ];

  const topProcedures = [
    { name: "General Consultation", count: 156 },
    { name: "ECG", count: 42 },
    { name: "Blood Tests", count: 89 },
    { name: "X-Ray", count: 28 }
  ];

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
            <h1 className="text-xl font-semibold text-foreground">Reports & Analytics</h1>
            <p className="text-xs text-muted-foreground">Performance insights</p>
          </div>
        </div>
      </header>

      <div className="p-4">
        <Tabs defaultValue="daily" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="daily" data-testid="tab-daily">Daily Report</TabsTrigger>
            <TabsTrigger value="weekly" data-testid="tab-weekly">Weekly Report</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-primary" />
                    <p className="text-xs text-muted-foreground">Patients</p>
                  </div>
                  <p className="text-2xl font-bold">{dailyStats.patients}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-primary" />
                    <p className="text-xs text-muted-foreground">Prescriptions</p>
                  </div>
                  <p className="text-2xl font-bold">{dailyStats.prescriptions}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-primary" />
                    <p className="text-xs text-muted-foreground">Lab Tests</p>
                  </div>
                  <p className="text-2xl font-bold">{dailyStats.labTests}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                  <p className="text-2xl font-bold">PKR {dailyStats.revenue.toLocaleString()}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-primary" />
                    <p className="text-xs text-muted-foreground">Patients</p>
                  </div>
                  <p className="text-2xl font-bold">{weeklyStats.patients}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-primary" />
                    <p className="text-xs text-muted-foreground">Prescriptions</p>
                  </div>
                  <p className="text-2xl font-bold">{weeklyStats.prescriptions}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-primary" />
                    <p className="text-xs text-muted-foreground">Lab Tests</p>
                  </div>
                  <p className="text-2xl font-bold">{weeklyStats.labTests}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                  <p className="text-2xl font-bold">PKR {weeklyStats.revenue.toLocaleString()}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Top Performing Doctors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topDoctors.map((doctor, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{doctor.name}</p>
                  <p className="text-sm text-muted-foreground">{doctor.patients} patients</p>
                </div>
                <p className="font-semibold text-primary">PKR {doctor.revenue.toLocaleString()}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Most Common Procedures</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topProcedures.map((procedure, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <p className="font-medium">{procedure.name}</p>
                <p className="font-semibold text-primary">{procedure.count} times</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
