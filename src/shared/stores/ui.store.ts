import { create } from "zustand";

interface UIState {
  sidebarMobileOpen: boolean;
  toggleSidebarMobile: () => void;
  closeSidebarMobile: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarMobileOpen: false,
  toggleSidebarMobile: () =>
    set((state) => ({ sidebarMobileOpen: !state.sidebarMobileOpen })),
  closeSidebarMobile: () => set({ sidebarMobileOpen: false }),
}));
