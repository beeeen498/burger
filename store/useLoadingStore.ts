import { create } from "zustand";

// ---------- shared "is the page ready" flag ----------
// any component can read this, any component can update it
interface LoadingStore {
  isPageReady: boolean;
  setPageReady: (ready: boolean) => void;
}

export const useLoadingStore = create<LoadingStore>((set) => ({
  isPageReady: true, // starts true so pages with no async data aren't blocked
  setPageReady: (ready) => set({ isPageReady: ready }),
}));