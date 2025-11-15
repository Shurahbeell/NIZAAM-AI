import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Onboarding from "@/pages/onboarding";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import SymptomChat from "@/pages/symptom-chat";
import ProgramsChat from "@/pages/programs-chat";
import Appointments from "@/pages/appointments";
import Emergency from "@/pages/emergency";
import Map from "@/pages/map";
import History from "@/pages/history";
import Profile from "@/pages/profile";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Onboarding} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/symptom-chat" component={SymptomChat} />
      <Route path="/programs-chat" component={ProgramsChat} />
      <Route path="/appointments" component={Appointments} />
      <Route path="/emergency" component={Emergency} />
      <Route path="/map" component={Map} />
      <Route path="/history" component={History} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
