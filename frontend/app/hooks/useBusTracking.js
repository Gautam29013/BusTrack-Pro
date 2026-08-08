'use client';
import { useEffect } from 'react';
import { subscribeToBus, unsubscribeFromBus } from '../lib/socket';
import useBusStore from '../store/busStore';
import api from '../lib/api';

export function useBusTracking(busId = null) {
  const buses = useBusStore((s) => s.buses);
  const setBuses = useBusStore((s) => s.setBuses);
  const isConnected = useBusStore((s) => s.isConnected);

  // Load initial bus data from REST API
  useEffect(() => {
    api.get('/buses').then(({ data }) => {
      if (data.success) setBuses(data.data);
    }).catch(console.error);
  }, [setBuses]);

  // Subscribe to specific bus if busId is provided
  useEffect(() => {
    if (busId) {
      subscribeToBus(busId);
      return () => unsubscribeFromBus(busId);
    }
  }, [busId]);

  const selectedBus = busId ? buses[busId] : null;
  const allBuses = Object.values(buses);

  return { buses: allBuses, selectedBus, isConnected };
}
