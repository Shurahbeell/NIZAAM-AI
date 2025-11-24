import { useAuthStore } from "@/lib/auth";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, MapPin, Users, Syringe, BookOpen, Package, LogOut, Phone, MapPinIcon, Calendar, Heart } from "lucide-react";
import { useLHWDashboard, useLHWHouseholds, useLHWProfile } from "@/lib/useLHWData";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRef, useState, useEffect } from "react";

export default function LHWDashboard() {
  const { user, logout } = useAuthStore();
  const [, setLocation] = useLocation();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);

  const { data: profile, isLoading: profileLoading } = useLHWProfile();
  const { data: dashboard, isLoading: dashboardLoading } = useLHWDashboard();
  const { data: households, isLoading: householdsLoading } = useLHWHouseholds();

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || map || !households || households.length === 0) return;

    const google = (window as any).google;
    if (!google) return;

    const bounds = new google.maps.LatLngBounds();
    const mapInstance = new google.maps.Map(mapRef.current, {
      zoom: 15,
      mapTypeControl: false,
      fullscreenControl: false,
    });

    households.forEach((h: any) => {
      if (h.latitude && h.longitude) {
        const marker = new google.maps.Marker({
          position: { lat: parseFloat(h.latitude), lng: parseFloat(h.longitude) },
          map: mapInstance,
          title: h.householdName,
        });
        bounds.extend(
          new google.maps.LatLng(parseFloat(h.latitude), parseFloat(h.longitude))
        );
      }
    });

    if (households.length > 0) {
      mapInstance.fitBounds(bounds);
    }
    setMap(mapInstance);
  }, [households]);

  const stats = [
    {
      label: "Assigned Households",
      value: dashboard?.assignedHouseholds || 0,
      icon: Users,
      color: "text-blue-600",
    },
    {
      label: "Pending Visits",
      value: dashboard?.pendingVisits || 0,
      icon: MapPin,
      color: "text-amber-600",
    },
    {
      label: "Overdue Vaccinations",
      value: dashboard?.overdueVaccinations || 0,
      icon: Syringe,
      color: "text-red-600",
    },
    {
      label: "Emergency Alerts",
      value: dashboard?.emergencyAlerts || 0,
      icon: AlertTriangle,
      color: "text-destructive",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-gradient-to-r from-primary to-secondary shadow-lg z-20">
        <div className="p-4 max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-white">LHW Dashboard</h1>
              <p className="text-xs text-white/80">{user?.fullName}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                logout();
                setLocation("/login");
              }}
              className="text-white hover:bg-white/20"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 max-w-6xl mx-auto">
        {/* Worker Profile */}
        <Card className="mb-6 bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="p-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-white text-lg">
                  {profile?.fullName?.charAt(0)?.toUpperCase() || "LHW"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                {profileLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                ) : (
                  <>
                    <h2 className="text-lg font-bold">{profile?.fullName || "LHW"}</h2>
                    <p className="text-sm text-muted-foreground mb-2">Lady Health Worker</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {profile?.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-primary" />
                          <span>{profile.phone}</span>
                        </div>
                      )}
                      {profile?.address && (
                        <div className="flex items-center gap-1">
                          <MapPinIcon className="w-3 h-3 text-primary" />
                          <span>{profile.address}</span>
                        </div>
                      )}
                      {profile?.age && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-primary" />
                          <span>{profile.age} years old</span>
                        </div>
                      )}
                      {profile?.cnic && (
                        <div className="text-xs text-muted-foreground">
                          <span>CNIC: {profile.cnic}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.label}
                className="p-4"
                data-testid={`card-stat-${stat.label.replace(" ", "-").toLowerCase()}`}
              >
                {dashboardLoading ? (
                  <Skeleton className="h-12 w-full" />
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </div>
                      <Icon className={`w-8 h-8 ${stat.color}`} />
                    </div>
                  </>
                )}
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button
            className="w-full"
            onClick={() => setLocation("/lhw/households")}
            data-testid="button-households"
          >
            <Users className="w-4 h-4 mr-2" />
            Households
          </Button>
          <Button
            className="w-full"
            onClick={() => setLocation("/lhw/vaccinations")}
            variant="outline"
            data-testid="button-vaccinations"
          >
            <Syringe className="w-4 h-4 mr-2" />
            Vaccinations
          </Button>
          <Button
            className="w-full"
            onClick={() => setLocation("/lhw/visit-form")}
            variant="outline"
            data-testid="button-visit"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Visit Form
          </Button>
          <Button
            className="w-full"
            onClick={() => setLocation("/lhw/emergencies")}
            variant="outline"
            data-testid="button-emergencies"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Emergencies
          </Button>
        </div>

        {/* Household Map */}
        <Card className="mb-6">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Assigned Households
            </h2>
            {householdsLoading ? (
              <Skeleton className="w-full h-64" />
            ) : (
              <div ref={mapRef} className="w-full h-64 rounded-md border" />
            )}
          </div>
        </Card>

        {/* Recent Alerts */}
        {dashboard && dashboard.emergencyAlerts > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {dashboard.emergencyAlerts} emergency alert{dashboard.emergencyAlerts !== 1 ? "s" : ""} require attention
            </AlertDescription>
          </Alert>
        )}

        {/* Navigation */}
        <Card className="p-4 mb-6">
          <h3 className="text-sm font-semibold mb-3">Core Modules</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => setLocation("/lhw/education")}
              data-testid="button-education"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Education
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => setLocation("/lhw/inventory")}
              data-testid="button-inventory"
            >
              <Package className="w-4 h-4 mr-2" />
              Inventory
            </Button>
          </div>
        </Card>

        {/* Menstrual Hygiene Module */}
        <Card className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 border-pink-200 dark:border-pink-800">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-600" />
            Menstrual Hygiene Support
          </h3>
          <Button
            className="w-full"
            onClick={() => setLocation("/lhw/menstrual-hub")}
            data-testid="button-menstrual-hub"
          >
            <Heart className="w-4 h-4 mr-2" />
            Open Menstrual Hygiene Hub
          </Button>
        </Card>
      </div>
    </div>
  );
}
