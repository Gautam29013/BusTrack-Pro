import { create } from 'zustand';

const useUIStore = create((set) => ({
  sidebarOpen: true,
  theme: 'dark',
  toasts: [],
  isMapLoaded: false,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (val) => set({ sidebarOpen: val }),
  setTheme: (theme) => set({ theme }),
  setMapLoaded: (val) => set({ isMapLoaded: val }),

  addToast: (toast) => {
    const id = Date.now();
    set((s) => ({ toasts: [...s.toasts, { id, ...toast }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },

  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export default useUIStore;
