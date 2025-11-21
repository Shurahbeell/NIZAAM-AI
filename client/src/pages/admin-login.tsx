import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { LogIn, Shield } from "lucide-react";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
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

        <form onSubmit={handleSubmit} className="space-y-4">
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

        <p className="text-xs text-muted-foreground text-center mt-4">
          Admin access only. Contact system administrator for credentials.
        </p>
      </Card>
    </div>
  );
}
