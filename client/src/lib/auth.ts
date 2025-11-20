import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  username: string;
  role: "patient" | "hospital" | "frontliner";
  hospitalId?: string;
  // Profile fields
  fullName?: string;
  phone?: string;
  cnic?: string;
  address?: string;
  age?: number;
  bloodGroup?: string;
  emergencyContact?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token, user) => {
        const oldState = get();
        console.log("[Auth Store] 🔄 setAuth called:", {
          NEW_USER: { username: user.username, id: user.id, role: user.role },
          OLD_USER: oldState.user ? { username: oldState.user.username, id: oldState.user.id, role: oldState.user.role } : null,
          tokenChanged: oldState.token !== token
        });
        
        // CRITICAL FIX: Explicitly set both token AND user in a single state update
        // This ensures localStorage persistence happens with the correct values
        set({ token, user });
        
        console.log("[Auth Store] ✅ State updated. Verifying...");
        const newState = get();
        console.log("[Auth Store] 📊 Verification:", {
          storedUser: newState.user ? { username: newState.user.username, id: newState.user.id } : null,
          tokensMatch: newState.token === token,
          usersMatch: newState.user?.id === user.id
        });
        
        // Double-check localStorage
        const localStorageValue = localStorage.getItem("auth-storage");
        if (localStorageValue) {
          const parsed = JSON.parse(localStorageValue);
          console.log("[Auth Store] 💾 localStorage check:", {
            storedUsername: parsed.state?.user?.username,
            storedUserId: parsed.state?.user?.id,
            matchesExpected: parsed.state?.user?.id === user.id
          });
        }
      },
      logout: () => {
        console.log("[Auth Store] 🚪 Logging out");
        set({ token: null, user: null });
      },
      isAuthenticated: () => !!get().token && !!get().user,
    }),
    {
      name: "auth-storage",
    }
  )
);

// Helper to get auth headers
export function getAuthHeaders(): Record<string, string> {
  const token = useAuthStore.getState().token;
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
}

// Helper to check if token is expired (simple check)
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}
