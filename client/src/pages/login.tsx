import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Heart, AlertCircle, Activity, Shield } from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          ...(isLogin ? {} : { role: "patient" }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // Store auth data
      setAuth(data.token, data.user);

      // Redirect based on role
      if (data.user.role === "hospital") {
        setLocation("/hospital-dashboard");
      } else {
        setLocation("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary/60 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Logo & Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-white/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative w-20 h-20 rounded-3xl bg-white shadow-2xl flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110">
                <Heart className="w-10 h-10 text-primary animate-pulse" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">HealthCare Pakistan</h1>
            <p className="text-white/90 text-lg">Your health, our priority</p>
          </div>
        </div>

        {/* Main Card */}
        <Card className="backdrop-blur-sm bg-white/95 shadow-2xl border-white/20 rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            {/* Tab Switcher */}
            <div className="flex gap-2 p-1 bg-muted rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setError("");
                }}
                disabled={isLoading}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                  isLogin
                    ? "bg-white text-primary shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="button-login-tab"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setError("");
                }}
                disabled={isLoading}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                  !isLogin
                    ? "bg-white text-primary shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="button-register-tab"
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="rounded-xl animate-in slide-in-from-top-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-semibold text-foreground">
                  Username
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                    data-testid="input-username"
                    className="h-12 rounded-xl border-2 border-border focus:border-primary transition-all duration-300 pl-4 text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    data-testid="input-password"
                    className="h-12 rounded-xl border-2 border-border focus:border-primary transition-all duration-300 pl-4 text-base"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-secondary hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 text-white font-semibold text-base"
                disabled={isLoading}
                data-testid="button-submit"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Please wait...
                  </div>
                ) : (
                  isLogin ? "Login" : "Create Account"
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gradient-to-br from-accent to-accent/50 rounded-2xl space-y-3 border border-accent/20">
              <div className="flex items-center gap-2 text-primary">
                <Shield className="w-4 h-4" />
                <p className="font-semibold text-sm">Demo Credentials:</p>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2 p-2 bg-white/50 rounded-lg">
                  <Activity className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Patient Account</p>
                    <p className="text-muted-foreground">
                      <strong>patient</strong> / <strong>patient123</strong>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 bg-white/50 rounded-lg">
                  <Heart className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Hospital Admin</p>
                    <p className="text-muted-foreground">
                      <strong>jinnah_admin</strong> / <strong>hospital123</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-white/80 text-sm">
            Powered by AI-driven healthcare technology
          </p>
        </div>
      </div>
    </div>
  );
}
