import { create } from 'zustand';

const useBusStore = create((set, get) => ({
  buses: {},          // { [busId]: { ...busData, latitude, longitude, speed, heading } }
  selectedBusId: null,
  searchQuery: '',
  filterRouteId: null,
  isConnected: false,

  // Called by Socket.io on each location-update event
  updateBusLocation: (data) => {
    set((state) => ({
      buses: {
        ...state.buses,
        [data.busId]: {
          ...state.buses[data.busId],
          ...data,
          lastUpdated: new Date(),
        },
      },
    }));
  },

  setBuses: (busArray) => {
    const map = {};
    busArray.forEach((b) => { map[b.id] = b; });
    set({ buses: map });
  },

  selectBus: (busId) => set({ selectedBusId: busId }),
  clearSelection: () => set({ selectedBusId: null }),

  setSearch: (q) => set({ searchQuery: q }),
  setFilterRoute: (routeId) => set({ filterRouteId: routeId }),
  setConnected: (val) => set({ isConnected: val }),

}));

export const useFilteredBuses = () => {
  const buses = useBusStore((s) => s.buses);
  const searchQuery = useBusStore((s) => s.searchQuery);
  const filterRouteId = useBusStore((s) => s.filterRouteId);

  // useMemo prevents returning a new array reference on every render
  // unless the underlying dependencies change, which fixes the infinite loop
  return require('react').useMemo(() => {
    let list = Object.values(buses);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          b.busNumber?.toString().toLowerCase().includes(q) ||
          b.routeName?.toLowerCase().includes(q)
      );
    }

    if (filterRouteId) {
      list = list.filter((b) => b.routeId === filterRouteId);
    }

    return list;
  }, [buses, searchQuery, filterRouteId]);
};

export default useBusStore;
