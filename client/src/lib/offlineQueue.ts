import { queryClient } from "./queryClient";

export interface QueuedAction {
  id: string;
  type: "visit" | "vaccination" | "education" | "emergency" | "inventory";
  payload: any;
  timestamp: number;
  synced: boolean;
}

const STORAGE_KEY = "lhw_offline_queue";

export const offlineQueue = {
  // Add action to queue
  add: (type: QueuedAction["type"], payload: any): QueuedAction => {
    const actions = offlineQueue.getAll();
    const newAction: QueuedAction = {
      id: `${type}_${Date.now()}_${Math.random()}`,
      type,
      payload,
      timestamp: Date.now(),
      synced: false,
    };
    actions.push(newAction);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actions));
    return newAction;
  },

  // Get all queued actions
  getAll: (): QueuedAction[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  // Get unsynced actions
  getUnsynced: (): QueuedAction[] => {
    return offlineQueue.getAll().filter((a) => !a.synced);
  },

  // Mark action as synced
  markSynced: (id: string) => {
    const actions = offlineQueue.getAll();
    const updated = actions.map((a) =>
      a.id === id ? { ...a, synced: true } : a
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  // Remove action
  remove: (id: string) => {
    const actions = offlineQueue.getAll().filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actions));
  },

  // Clear all
  clear: () => {
    localStorage.removeItem(STORAGE_KEY);
  },

  // Sync all unsynced actions
  syncAll: async (syncFn: (action: QueuedAction) => Promise<void>) => {
    const unsynced = offlineQueue.getUnsynced();
    const results: { success: string[]; failed: string[] } = {
      success: [],
      failed: [],
    };

    for (const action of unsynced) {
      try {
        await syncFn(action);
        offlineQueue.markSynced(action.id);
        results.success.push(action.id);
      } catch (error) {
        console.error(`Failed to sync ${action.id}:`, error);
        results.failed.push(action.id);
      }
    }

    // Invalidate relevant queries after sync
    queryClient.invalidateQueries({
      queryKey: ["/api/lhw/dashboard"],
    });
    queryClient.invalidateQueries({
      queryKey: ["/api/lhw/households"],
    });

    return results;
  },
};

// Monitor online/offline status
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = React.useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
};

import React from "react";
