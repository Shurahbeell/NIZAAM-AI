import { useEffect } from "react";
import { useLocation } from "wouter";

interface RoleGuardProps {
  requiredRole: "patient" | "hospital";
  children: React.ReactNode;
}

export default function RoleGuard({ requiredRole, children }: RoleGuardProps) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    
    if (!userRole) {
      // No role found, redirect to login
      setLocation("/login");
      return;
    }

    if (userRole !== requiredRole) {
      // Wrong role, redirect to appropriate dashboard
      if (userRole === "hospital") {
        setLocation("/hospital/dashboard");
      } else {
        setLocation("/dashboard");
      }
    }
  }, [requiredRole, setLocation]);

  const userRole = localStorage.getItem("userRole");
  
  // Only render children if role matches
  if (userRole === requiredRole) {
    return <>{children}</>;
  }

  // Show nothing while redirecting
  return null;
}
