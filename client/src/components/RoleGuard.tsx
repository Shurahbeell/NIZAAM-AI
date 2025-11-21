import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuthStore } from "@/lib/auth";

interface RoleGuardProps {
  requiredRole: "patient" | "hospital" | "frontliner" | "admin";
  children: React.ReactNode;
}

export default function RoleGuard({ requiredRole, children }: RoleGuardProps) {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated()) {
      setLocation(requiredRole === "admin" ? "/admin-login" : "/login");
      return;
    }

    if (user && user.role !== requiredRole) {
      // Wrong role, redirect to appropriate dashboard
      if (user.role === "hospital") {
        setLocation("/hospital-dashboard");
      } else if (user.role === "frontliner") {
        setLocation("/frontliner-dashboard");
      } else if (user.role === "admin") {
        setLocation("/admin-dashboard");
      } else {
        setLocation("/dashboard");
      }
    }
  }, [user, isAuthenticated, requiredRole, setLocation]);

  if (!isAuthenticated() || !user) {
    return null;
  }

  // Only render children if role matches
  if (user.role === requiredRole) {
    return <>{children}</>;
  }

  // Show nothing while redirecting
  return null;
}
