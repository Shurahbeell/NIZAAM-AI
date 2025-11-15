import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";
import { Heart, User, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"patient" | "hospital">("patient");
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted", { phone, password, role });
    
    // Store role in localStorage for demo
    localStorage.setItem("userRole", role);
    
    // Route based on role
    if (role === "hospital") {
      setLocation("/hospital/dashboard");
    } else {
      setLocation("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">HealthCare App</h1>
          <p className="text-muted-foreground">Your health, our priority</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <Label>Login As</Label>
              <div className="grid grid-cols-2 gap-3">
                <Card
                  className={`cursor-pointer hover-elevate ${
                    role === "patient" ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => setRole("patient")}
                  data-testid="role-patient"
                >
                  <CardContent className="p-4 flex flex-col items-center gap-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      role === "patient" ? "bg-primary/10" : "bg-muted"
                    }`}>
                      <User className={`w-6 h-6 ${role === "patient" ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <p className="font-medium text-sm">Patient</p>
                    {role === "patient" && <Badge variant="default" className="text-xs">Selected</Badge>}
                  </CardContent>
                </Card>
                
                <Card
                  className={`cursor-pointer hover-elevate ${
                    role === "hospital" ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => setRole("hospital")}
                  data-testid="role-hospital"
                >
                  <CardContent className="p-4 flex flex-col items-center gap-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      role === "hospital" ? "bg-primary/10" : "bg-muted"
                    }`}>
                      <Building2 className={`w-6 h-6 ${role === "hospital" ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <p className="font-medium text-sm">Hospital</p>
                    {role === "hospital" && <Badge variant="default" className="text-xs">Selected</Badge>}
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                data-testid="input-phone"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-password"
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="cnic">CNIC (Optional)</Label>
                <Input
                  id="cnic"
                  type="text"
                  placeholder="12345-1234567-1"
                  data-testid="input-cnic"
                />
              </div>
            )}

            <Button type="submit" className="w-full" data-testid="button-submit">
              {isLogin ? "Login" : "Register"}
            </Button>

            {isLogin && (
              <Button type="button" variant="ghost" className="w-full text-sm" data-testid="button-forgot-password">
                Forgot Password?
              </Button>
            )}
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button variant="outline" className="w-full mt-4" data-testid="button-google">
              Continue with Google
            </Button>
          </div>

          <div className="mt-6 text-center text-sm">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover-elevate"
              data-testid="button-toggle-mode"
            >
              {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
