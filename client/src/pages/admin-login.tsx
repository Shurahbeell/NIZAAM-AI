import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { LogIn, Shield, Plus } from "lucide-react";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isBootstrap, setIsBootstrap] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [adminKey, setAdminKey] = useState("");

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/login", { username, password, adminKey });
      if (!res.ok) throw new Error("Login failed");
      return res.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      toast({ title: "Success", description: "Logged in as admin" });
      setLocation("/admin-dashboard");
    },
    onError: () => {
      toast({ title: "Error", description: "Invalid credentials or admin key", variant: "destructive" });
    },
  });

  const bootstrapMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/bootstrap", { username, password, bootstrapKey: adminKey });
      if (!res.ok) throw new Error("Bootstrap failed");
      return res.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      toast({ title: "Success", description: "Admin account created! Logging you in..." });
      setTimeout(() => setLocation("/admin-dashboard"), 1000);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  const handleBootstrap = (e: React.FormEvent) => {
    e.preventDefault();
    bootstrapMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>

        {!isBootstrap ? (
          <>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Username</label>
                <Input
                  type="text"
                  placeholder="Enter admin username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  data-testid="input-admin-username"
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Password</label>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="input-admin-password"
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Admin Key</label>
                <Input
                  type="password"
                  placeholder="Enter admin key"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  data-testid="input-admin-key"
                  className="w-full"
                />
              </div>

              <Button
                type="submit"
                disabled={loginMutation.isPending || !username || !password || !adminKey}
                className="w-full"
                data-testid="button-admin-login"
              >
                <LogIn className="w-4 h-4 mr-2" />
                {loginMutation.isPending ? "Logging in..." : "Login"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t">
              <p className="text-xs text-muted-foreground mb-3">First time setting up admin?</p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsBootstrap(true);
                  setUsername("");
                  setPassword("");
                  setAdminKey("");
                }}
                data-testid="button-bootstrap-mode"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Admin Account
              </Button>
            </div>
          </>
        ) : (
          <>
            <form onSubmit={handleBootstrap} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Choose Username</label>
                <Input
                  type="text"
                  placeholder="Enter new admin username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  data-testid="input-bootstrap-username"
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Choose Password</label>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="input-bootstrap-password"
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Bootstrap Key</label>
                <Input
                  type="password"
                  placeholder="Enter bootstrap key"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  data-testid="input-bootstrap-key"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Default: <code className="bg-muted px-2 py-1 rounded">bootstrap-1122-admin</code>
                </p>
              </div>

              <Button
                type="submit"
                disabled={bootstrapMutation.isPending || !username || !password || !adminKey}
                className="w-full"
                data-testid="button-bootstrap-create"
              >
                {bootstrapMutation.isPending ? "Creating..." : "Create Admin Account"}
              </Button>
            </form>

            <Button
              type="button"
              variant="ghost"
              className="w-full mt-4"
              onClick={() => {
                setIsBootstrap(false);
                setUsername("");
                setPassword("");
                setAdminKey("");
              }}
              data-testid="button-back-to-login"
            >
              Back to Login
            </Button>
          </>
        )}

        <p className="text-xs text-muted-foreground text-center mt-6">
          Admin access only. Contact system administrator for credentials.
        </p>
      </Card>
    </div>
  );
}
