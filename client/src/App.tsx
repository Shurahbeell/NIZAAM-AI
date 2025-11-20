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
import Medicines from "@/pages/medicines";
import MedicalProfile from "@/pages/medical-profile";
import LabTests from "@/pages/lab-tests";
import MedicineLibrary from "@/pages/medicine-library";
import DiseaseLibrary from "@/pages/disease-library";
import VaccinationTracker from "@/pages/vaccination-tracker";
import MentalHealth from "@/pages/mental-health";
import WomensHealth from "@/pages/womens-health";
import ChildHealth from "@/pages/child-health";
import Appointments from "@/pages/appointments";
import HospitalDashboard from "@/pages/hospital-dashboard";
import HospitalDoctors from "@/pages/hospital-doctors";
import HospitalAppointments from "@/pages/hospital-appointments";
import HospitalPrescriptions from "@/pages/hospital-prescriptions";
import HospitalReports from "@/pages/hospital-reports";
import HospitalEmergencies from "@/pages/hospital-emergencies";
import RoleGuard from "@/components/RoleGuard";
import MultiRoleGuard from "@/components/MultiRoleGuard";
import Emergency from "@/pages/emergency";
import Map from "@/pages/map";
import History from "@/pages/history";
import Profile from "@/pages/profile";
import FrontlinerDashboard from "@/pages/frontliner-dashboard";
import DispatchMonitor from "@/pages/dispatch-monitor";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Onboarding} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard">
        <RoleGuard requiredRole="patient">
          <Dashboard />
        </RoleGuard>
      </Route>
      <Route path="/symptom-chat">
        <RoleGuard requiredRole="patient">
          <SymptomChat />
        </RoleGuard>
      </Route>
      <Route path="/programs-chat" component={ProgramsChat} />
      <Route path="/medicines" component={Medicines} />
      <Route path="/medical-profile" component={MedicalProfile} />
      <Route path="/lab-tests" component={LabTests} />
      <Route path="/medicine-library" component={MedicineLibrary} />
      <Route path="/disease-library" component={DiseaseLibrary} />
      <Route path="/vaccinations" component={VaccinationTracker} />
      <Route path="/mental-health" component={MentalHealth} />
      <Route path="/womens-health" component={WomensHealth} />
      <Route path="/child-health" component={ChildHealth} />
      <Route path="/appointments" component={Appointments} />
      <Route path="/hospital">
        <RoleGuard requiredRole="hospital">
          <HospitalDashboard />
        </RoleGuard>
      </Route>
      <Route path="/hospital-dashboard">
        <RoleGuard requiredRole="hospital">
          <HospitalDashboard />
        </RoleGuard>
      </Route>
      <Route path="/hospital/dashboard">
        <RoleGuard requiredRole="hospital">
          <HospitalDashboard />
        </RoleGuard>
      </Route>
      <Route path="/hospital/doctors">
        <RoleGuard requiredRole="hospital">
          <HospitalDoctors />
        </RoleGuard>
      </Route>
      <Route path="/hospital/appointments">
        <RoleGuard requiredRole="hospital">
          <HospitalAppointments />
        </RoleGuard>
      </Route>
      <Route path="/hospital/prescriptions">
        <RoleGuard requiredRole="hospital">
          <HospitalPrescriptions />
        </RoleGuard>
      </Route>
      <Route path="/hospital/reports">
        <RoleGuard requiredRole="hospital">
          <HospitalReports />
        </RoleGuard>
      </Route>
      <Route path="/hospital/emergencies">
        <RoleGuard requiredRole="hospital">
          <HospitalEmergencies />
        </RoleGuard>
      </Route>
      <Route path="/emergency" component={Emergency} />
      <Route path="/map" component={Map} />
      <Route path="/history" component={History} />
      <Route path="/profile" component={Profile} />
      <Route path="/frontliner-dashboard">
        <RoleGuard requiredRole="frontliner">
          <FrontlinerDashboard />
        </RoleGuard>
      </Route>
      <Route path="/dispatch-monitor">
        <MultiRoleGuard allowedRoles={["hospital", "frontliner"]}>
          <DispatchMonitor />
        </MultiRoleGuard>
      </Route>
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
