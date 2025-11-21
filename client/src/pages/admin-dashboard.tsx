import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Trash2, LogOut, Plus, Users, Hospital, Ambulance } from "lucide-react";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [tab, setTab] = useState<"users" | "register-hospital" | "register-frontliner">("users");
  const [hospitalForm, setHospitalForm] = useState({
    username: "", password: "", hospitalName: "", hospitalAddress: "", hospitalPhone: "", hospitalType: "government" as "government" | "private",
  });
  const [frontlinerForm, setFrontlinerForm] = useState({
    username: "", password: "", fullName: "", phone: "", vehicleType: "Ambulance",
  });

  // Fetch users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/users");
      return res.json();
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "User deleted successfully" });
    },
  });

  // Register hospital mutation
  const registerHospitalMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/register/hospital", hospitalForm);
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Success", description: `Hospital ${data.hospital.name} registered` });
      setHospitalForm({ username: "", password: "", hospitalName: "", hospitalAddress: "", hospitalPhone: "", hospitalType: "government" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Register frontliner mutation
  const registerFrontlinerMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/register/frontliner", frontlinerForm);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Frontliner registered successfully" });
      setFrontlinerForm({ username: "", password: "", fullName: "", phone: "", vehicleType: "Ambulance" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLocation("/admin-login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/10 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
          <Button variant="ghost" onClick={handleLogout} data-testid="button-logout">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          <Button variant={tab === "users" ? "default" : "outline"} onClick={() => setTab("users")} data-testid="tab-users">
            <Users className="w-4 h-4 mr-2" />
            Manage Users
          </Button>
          <Button variant={tab === "register-hospital" ? "default" : "outline"} onClick={() => setTab("register-hospital")} data-testid="tab-register-hospital">
            <Hospital className="w-4 h-4 mr-2" />
            Register Hospital
          </Button>
          <Button variant={tab === "register-frontliner" ? "default" : "outline"} onClick={() => setTab("register-frontliner")} data-testid="tab-register-frontliner">
            <Ambulance className="w-4 h-4 mr-2" />
            Register Frontliner
          </Button>
        </div>

        {/* Users Tab */}
        {tab === "users" && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">All Users</h2>
            {isLoading ? (
              <p className="text-muted-foreground">Loading users...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2">Username</th>
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Phone</th>
                      <th className="text-left py-2">Role</th>
                      <th className="text-right py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user: any) => (
                      <tr key={user.id} className="border-b hover:bg-muted/50">
                        <td className="py-3">{user.username}</td>
                        <td className="py-3">{user.fullName || "-"}</td>
                        <td className="py-3">{user.phone || "-"}</td>
                        <td className="py-3"><span className="px-2 py-1 bg-primary/10 rounded text-xs font-medium">{user.role}</span></td>
                        <td className="py-3 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteUserMutation.mutate(user.id)}
                            disabled={deleteUserMutation.isPending}
                            data-testid={`button-delete-user-${user.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* Register Hospital Tab */}
        {tab === "register-hospital" && (
          <Card className="p-6 max-w-md">
            <h2 className="text-xl font-bold mb-4">Register New Hospital</h2>
            <div className="space-y-4">
              <Input
                placeholder="Hospital Username"
                value={hospitalForm.username}
                onChange={(e) => setHospitalForm({ ...hospitalForm, username: e.target.value })}
                data-testid="input-hospital-username"
              />
              <Input
                type="password"
                placeholder="Password"
                value={hospitalForm.password}
                onChange={(e) => setHospitalForm({ ...hospitalForm, password: e.target.value })}
                data-testid="input-hospital-password"
              />
              <Input
                placeholder="Hospital Name"
                value={hospitalForm.hospitalName}
                onChange={(e) => setHospitalForm({ ...hospitalForm, hospitalName: e.target.value })}
                data-testid="input-hospital-name"
              />
              <Input
                placeholder="Address"
                value={hospitalForm.hospitalAddress}
                onChange={(e) => setHospitalForm({ ...hospitalForm, hospitalAddress: e.target.value })}
                data-testid="input-hospital-address"
              />
              <Input
                placeholder="Phone"
                value={hospitalForm.hospitalPhone}
                onChange={(e) => setHospitalForm({ ...hospitalForm, hospitalPhone: e.target.value })}
                data-testid="input-hospital-phone"
              />
              <select
                value={hospitalForm.hospitalType}
                onChange={(e) => setHospitalForm({ ...hospitalForm, hospitalType: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-md"
                data-testid="select-hospital-type"
              >
                <option value="government">Government</option>
                <option value="private">Private</option>
              </select>
              <Button
                onClick={() => registerHospitalMutation.mutate()}
                disabled={registerHospitalMutation.isPending}
                className="w-full"
                data-testid="button-register-hospital"
              >
                <Plus className="w-4 h-4 mr-2" />
                Register Hospital
              </Button>
            </div>
          </Card>
        )}

        {/* Register Frontliner Tab */}
        {tab === "register-frontliner" && (
          <Card className="p-6 max-w-md">
            <h2 className="text-xl font-bold mb-4">Register New Frontliner</h2>
            <div className="space-y-4">
              <Input
                placeholder="Frontliner Username"
                value={frontlinerForm.username}
                onChange={(e) => setFrontlinerForm({ ...frontlinerForm, username: e.target.value })}
                data-testid="input-frontliner-username"
              />
              <Input
                type="password"
                placeholder="Password"
                value={frontlinerForm.password}
                onChange={(e) => setFrontlinerForm({ ...frontlinerForm, password: e.target.value })}
                data-testid="input-frontliner-password"
              />
              <Input
                placeholder="Full Name"
                value={frontlinerForm.fullName}
                onChange={(e) => setFrontlinerForm({ ...frontlinerForm, fullName: e.target.value })}
                data-testid="input-frontliner-name"
              />
              <Input
                placeholder="Phone"
                value={frontlinerForm.phone}
                onChange={(e) => setFrontlinerForm({ ...frontlinerForm, phone: e.target.value })}
                data-testid="input-frontliner-phone"
              />
              <select
                value={frontlinerForm.vehicleType}
                onChange={(e) => setFrontlinerForm({ ...frontlinerForm, vehicleType: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                data-testid="select-vehicle-type"
              >
                <option value="Ambulance">Ambulance</option>
                <option value="Motorcycle">Motorcycle</option>
                <option value="Car">Car</option>
              </select>
              <Button
                onClick={() => registerFrontlinerMutation.mutate()}
                disabled={registerFrontlinerMutation.isPending}
                className="w-full"
                data-testid="button-register-frontliner"
              >
                <Plus className="w-4 h-4 mr-2" />
                Register Frontliner
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
