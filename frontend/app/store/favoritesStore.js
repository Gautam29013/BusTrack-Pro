import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

/**
 * useFavoritesStore
 *
 * Manages saved/bookmarked stops (local + synced with backend when authenticated).
 * Locally stored so it works offline too.
 */
const useFavoritesStore = create(
  persist(
    (set, get) => ({
      // Map of stopId -> stop object
      savedStops: {},
      // Map of routeId -> route object  
      savedRoutes: {},
      isLoading: false,

      // ── Stop favorites (local-first, synced to backend) ──────────────────────
      isSavedStop: (stopId) => !!get().savedStops[stopId],

      saveStop: (stop) => {
        set((s) => ({
          savedStops: { ...s.savedStops, [stop.id]: { ...stop, savedAt: new Date().toISOString() } },
        }));
        // Sync to backend if authenticated (non-blocking)
        api.post('/users/saved-stops', { stopId: stop.id, stopData: stop }).catch(() => {});
      },

      removeStop: (stopId) => {
        set((s) => {
          const next = { ...s.savedStops };
          delete next[stopId];
          return { savedStops: next };
        });
        api.delete(`/users/saved-stops/${stopId}`).catch(() => {});
      },

      getSavedStops: () => Object.values(get().savedStops),

      // ── Route favorites (synced with existing backend) ───────────────────────
      isSavedRoute: (routeId) => !!get().savedRoutes[routeId],

      saveRoute: async (route) => {
        set((s) => ({
          savedRoutes: { ...s.savedRoutes, [route.id]: { ...route, savedAt: new Date().toISOString() } },
        }));
        try {
          await api.post('/users/favorites', { routeId: route.id });
        } catch {}
      },

      removeRoute: async (routeId) => {
        set((s) => {
          const next = { ...s.savedRoutes };
          delete next[routeId];
          return { savedRoutes: next };
        });
        try {
          await api.delete(`/users/favorites/${routeId}`);
        } catch {}
      },

      loadFavoritesFromServer: async () => {
        try {
          const { data } = await api.get('/users/favorites');
          if (data.success) {
            const map = {};
            data.data.forEach((r) => { map[r.id] = r; });
            set({ savedRoutes: map });
          }
        } catch {}
      },

      clearAll: () => set({ savedStops: {}, savedRoutes: {} }),
    }),
    {
      name: 'bustrakpro-favorites',
      partialize: (state) => ({
        savedStops: state.savedStops,
        savedRoutes: state.savedRoutes,
      }),
    }
  )
);

export default useFavoritesStore;
