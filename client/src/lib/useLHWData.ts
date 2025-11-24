import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";
import { queryClient } from "./queryClient";
import { offlineQueue } from "./offlineQueue";
import { useAuthStore } from "./auth";

// Types
interface LHWProfile {
  id: string;
  username: string;
  fullName: string | null;
  phone: string | null;
  address: string | null;
  cnic: string | null;
  age: number | null;
  role: string;
}

interface LHWDashboard {
  assignedHouseholds: number;
  pendingVisits: number;
  overdueVaccinations: number;
  emergencyAlerts: number;
  households: any[];
}

interface LHWHousehold {
  id: string;
  lhwId: string;
  householdName: string;
  latitude: string;
  longitude: string;
  populationServed: number;
  createdAt: string;
}

interface MenstrualHygieneStatus {
  id: string;
  householdId: string;
  lastCycleDate: string | null;
  usesSafeProducts: boolean;
  notes: string | null;
  lhwId: string;
  createdAt: string;
  updatedAt: string;
}

interface MenstrualPadRequest {
  id: string;
  householdId: string;
  lhwId: string;
  quantityRequested: number;
  urgencyLevel: "low" | "medium" | "high";
  status: "pending" | "approved" | "delivered";
  createdAt: string;
  updatedAt: string;
}

interface MenstrualEducationSession {
  id: string;
  householdId: string;
  lhwId: string;
  materialsProvided: string[];
  topicsCovered: string[];
  feedbackForm: any;
  createdAt: string;
  updatedAt: string;
}

interface MenstrualDashboardStats {
  householdsTracked: number;
  householdsUsingUnsafeMaterials: number;
  pendingPadRequests: number;
  educationSessionsHeld: number;
  padsDelivered: number;
}

// Hook: Get LHW Profile
export const useLHWProfile = () => {
  return useQuery<LHWProfile>({
    queryKey: ["/api/lhw/profile"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/lhw/profile");
      if (!response.ok) throw new Error("Failed to fetch profile");
      return response.json();
    },
  });
};

// Menstrual Hygiene Hooks

export const useMenstrualHygieneStatus = (householdId: string) => {
  return useQuery<MenstrualHygieneStatus | null>({
    queryKey: ["/api/lhw/menstrual/household-status", householdId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/lhw/menstrual/household-status?householdId=${householdId}`);
      if (!response.ok) throw new Error("Failed to fetch menstrual status");
      return response.json();
    },
  });
};

export const useMenstrualPadRequests = () => {
  return useQuery<MenstrualPadRequest[]>({
    queryKey: ["/api/lhw/menstrual/requests"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/lhw/menstrual/requests");
      if (!response.ok) throw new Error("Failed to fetch pad requests");
      return response.json();
    },
  });
};

export const useMenstrualEducationSessions = () => {
  return useQuery<MenstrualEducationSession[]>({
    queryKey: ["/api/lhw/menstrual/sessions"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/lhw/menstrual/sessions");
      if (!response.ok) throw new Error("Failed to fetch education sessions");
      return response.json();
    },
  });
};

export const useMenstrualDashboardStats = () => {
  return useQuery<MenstrualDashboardStats>({
    queryKey: ["/api/lhw/menstrual/dashboard-stats"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/lhw/menstrual/dashboard-stats");
      if (!response.ok) throw new Error("Failed to fetch dashboard stats");
      return response.json();
    },
  });
};

export const useUpdateMenstrualStatus = () => {
  return useMutation({
    mutationFn: async (data: { householdId: string; lastCycleDate?: string; usesSafeProducts: boolean; notes?: string }) => {
      const response = await apiRequest("POST", "/api/lhw/menstrual/update-status", data);
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lhw/menstrual/household-status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/lhw/menstrual/dashboard-stats"] });
    },
  });
};

export const useRequestPads = () => {
  return useMutation({
    mutationFn: async (data: { householdId: string; quantityRequested: number; urgencyLevel?: string }) => {
      const response = await apiRequest("POST", "/api/lhw/menstrual/request-pads", data);
      if (!response.ok) throw new Error("Failed to request pads");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lhw/menstrual/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/lhw/menstrual/dashboard-stats"] });
    },
  });
};

export const useCreateEducationSession = () => {
  return useMutation({
    mutationFn: async (data: {
      householdId: string;
      materialsProvided?: string[];
      topicsCovered?: string[];
      feedbackForm?: any;
    }) => {
      const response = await apiRequest("POST", "/api/lhw/menstrual/create-education-session", data);
      if (!response.ok) throw new Error("Failed to create education session");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lhw/menstrual/sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/lhw/menstrual/dashboard-stats"] });
    },
  });
};

// Hook: Get LHW Dashboard
export const useLHWDashboard = () => {
  return useQuery<LHWDashboard>({
    queryKey: ["/api/lhw/dashboard"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/lhw/dashboard");
      if (!response.ok) throw new Error("Failed to fetch dashboard");
      return response.json();
    },
  });
};

// Hook: Get LHW Households
export const useLHWHouseholds = () => {
  return useQuery<LHWHousehold[]>({
    queryKey: ["/api/lhw/households"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/lhw/households");
      if (!response.ok) throw new Error("Failed to fetch households");
      return response.json();
    },
  });
};

// Hook: Submit Visit Log
export const useSubmitVisit = () => {
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: async (data: any) => {
      try {
        const response = await apiRequest("POST", "/api/lhw/visit-log", data);
        if (!response.ok) throw new Error("Failed to submit visit");
        return response.json();
      } catch (error) {
        // Queue for offline sync
        offlineQueue.add("visit", data);
        return { queued: true };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/lhw/dashboard"],
      });
    },
  });
};

// Hook: Update Vaccination Status
export const useUpdateVaccination = () => {
  return useMutation({
    mutationFn: async (data: {
      vaccinationId: string;
      status: "completed" | "missed" | "pending";
      completedAt?: string;
    }) => {
      try {
        const response = await apiRequest(
          "POST",
          "/api/lhw/vaccination",
          data
        );
        if (!response.ok) throw new Error("Failed to update vaccination");
        return response.json();
      } catch (error) {
        offlineQueue.add("vaccination", data);
        return { queued: true };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/lhw/dashboard"],
      });
    },
  });
};

// Hook: Submit Education Session
export const useSubmitEducationSession = () => {
  return useMutation({
    mutationFn: async (data: {
      topic: string;
      audienceSize: number;
      notes: string;
    }) => {
      try {
        const response = await apiRequest(
          "POST",
          "/api/lhw/education-session",
          data
        );
        if (!response.ok) throw new Error("Failed to submit education session");
        return response.json();
      } catch (error) {
        offlineQueue.add("education", data);
        return { queued: true };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/lhw/dashboard"],
      });
    },
  });
};

// Hook: Report Emergency
export const useReportEmergency = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      try {
        const response = await apiRequest("POST", "/api/lhw/emergency", data);
        if (!response.ok) throw new Error("Failed to report emergency");
        return response.json();
      } catch (error) {
        offlineQueue.add("emergency", data);
        return { queued: true };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/lhw/dashboard"],
      });
    },
  });
};

// Hook: Get Inventory
export const useLHWInventory = () => {
  return useQuery({
    queryKey: ["/api/lhw/inventory"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/lhw/inventory");
      if (!response.ok) throw new Error("Failed to fetch inventory");
      return response.json();
    },
  });
};

// Hook: Update Inventory
export const useUpdateInventory = () => {
  return useMutation({
    mutationFn: async (data: {
      itemId: string;
      quantity: number;
      status?: string;
    }) => {
      try {
        const response = await apiRequest(
          "POST",
          "/api/lhw/inventory",
          data
        );
        if (!response.ok) throw new Error("Failed to update inventory");
        return response.json();
      } catch (error) {
        offlineQueue.add("inventory", data);
        return { queued: true };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/lhw/inventory"],
      });
    },
  });
};

// Hook: Sync offline queue
export const useSyncOfflineQueue = () => {
  return useMutation({
    mutationFn: async () => {
      return offlineQueue.syncAll(async (action) => {
        const response = await apiRequest("POST", "/api/lhw/sync", {
          type: action.type,
          payload: action.payload,
        });
        if (!response.ok) throw new Error("Sync failed");
      });
    },
  });
};
