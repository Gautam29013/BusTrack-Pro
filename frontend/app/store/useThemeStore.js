import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'dark', // 'light', 'dark', 'high-contrast'
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'bustrakpro-theme',
    }
  )
);

export default useThemeStore;
