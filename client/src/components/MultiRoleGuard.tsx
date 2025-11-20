import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuthStore } from "@/lib/auth";

interface MultiRoleGuardProps {
  allowedRoles: Array<"patient" | "hospital" | "frontliner">;
  children: React.ReactNode;
}

export default function MultiRoleGuard({ allowedRoles, children }: MultiRoleGuardProps) {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated()) {
      setLocation("/login");
      return;
    }

    if (user && !allowedRoles.includes(user.role)) {
      // Wrong role, redirect to appropriate dashboard
      if (user.role === "hospital") {
        setLocation("/hospital-dashboard");
      } else if (user.role === "frontliner") {
        setLocation("/frontliner-dashboard");
      } else {
        setLocation("/dashboard");
      }
    }
  }, [user, isAuthenticated, allowedRoles, setLocation]);

  if (!isAuthenticated() || !user) {
    return null;
  }

  // Only render children if role is allowed
  if (allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  // Show nothing while redirecting
  return null;
}
