import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageContext, useLanguageProvider } from "@/lib/useLanguage";
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
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import LanguageSelector from "@/components/LanguageSelector";
import UserManual from "@/pages/user-manual";
import DiseaseChatbot from "@/pages/disease-chatbot";
import LHWDashboard from "@/pages/lhw/Dashboard";
import LHWHouseholds from "@/pages/lhw/Households";
import LHWVisitForm from "@/pages/lhw/VisitForm";
import LHWVaccinations from "@/pages/lhw/VaccinationTracker";
import LHWEducation from "@/pages/lhw/EducationHub";
import LHWInventory from "@/pages/lhw/Inventory";
import LHWEmergencies from "@/pages/lhw/Emergencies";
import MenstrualHygieneHub from "@/pages/lhw/MenstrualHygieneHub";
import HouseholdMenstrualProfile from "@/pages/lhw/HouseholdMenstrualProfile";
import MenstrualEducationForm from "@/pages/lhw/MenstrualEducationForm";
import PadDistribution from "@/pages/lhw/PadDistribution";

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
      <Route path="/disease-chatbot" component={DiseaseChatbot} />
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
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/admin-dashboard">
        <RoleGuard requiredRole="admin">
          <AdminDashboard />
        </RoleGuard>
      </Route>
      <Route path="/user-manual" component={UserManual} />
      <Route path="/lhw/dashboard">
        <RoleGuard requiredRole="lhw">
          <LHWDashboard />
        </RoleGuard>
      </Route>
      <Route path="/lhw/households">
        <RoleGuard requiredRole="lhw">
          <LHWHouseholds />
        </RoleGuard>
      </Route>
      <Route path="/lhw/visit-form">
        <RoleGuard requiredRole="lhw">
          <LHWVisitForm />
        </RoleGuard>
      </Route>
      <Route path="/lhw/vaccinations">
        <RoleGuard requiredRole="lhw">
          <LHWVaccinations />
        </RoleGuard>
      </Route>
      <Route path="/lhw/education">
        <RoleGuard requiredRole="lhw">
          <LHWEducation />
        </RoleGuard>
      </Route>
      <Route path="/lhw/inventory">
        <RoleGuard requiredRole="lhw">
          <LHWInventory />
        </RoleGuard>
      </Route>
      <Route path="/lhw/emergencies">
        <RoleGuard requiredRole="lhw">
          <LHWEmergencies />
        </RoleGuard>
      </Route>
      <Route path="/lhw/menstrual-hub">
        <RoleGuard requiredRole="lhw">
          <MenstrualHygieneHub />
        </RoleGuard>
      </Route>
      <Route path="/lhw/menstrual-profile">
        <RoleGuard requiredRole="lhw">
          <HouseholdMenstrualProfile />
        </RoleGuard>
      </Route>
      <Route path="/lhw/menstrual-education">
        <RoleGuard requiredRole="lhw">
          <MenstrualEducationForm />
        </RoleGuard>
      </Route>
      <Route path="/lhw/pad-distribution">
        <RoleGuard requiredRole="lhw">
          <PadDistribution />
        </RoleGuard>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const languageContext = useLanguageProvider();

  return (
    <LanguageContext.Provider value={languageContext}>
      <div dir={languageContext.dir}>
        <Router />
      </div>
    </LanguageContext.Provider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
