'use client';
import { useEffect, useRef, useCallback } from 'react';
import useBusStore from '../store/busStore';

const PROXIMITY_STOP_COUNT = 2; // Notify when bus is within 2 stops (approx 2 min)
const NOTIFIED_BUSES = new Set(); // Don't re-notify the same bus twice per session

/**
 * useNotifications
 *
 * - Registers the Service Worker
 * - Requests notification permission
 * - Watches tracked buses and fires a browser notification
 *   when a bus's ETA drops to ≤2 minutes
 */
export function useNotifications() {
  const permissionRef = useRef('default');

  // Register Service Worker
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[SW] Registered:', reg.scope);
      })
      .catch((err) => {
        console.warn('[SW] Registration failed:', err);
      });
  }, []);

  // Request permission on first mount
  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
    if (Notification.permission === 'granted') {
      permissionRef.current = 'granted';
      return 'granted';
    }
    const result = await Notification.requestPermission();
    permissionRef.current = result;
    return result;
  }, []);

  // Fire a notification
  const notify = useCallback((title, body, url = '/dashboard') => {
    if (typeof window === 'undefined') return;
    if (Notification.permission !== 'granted') return;

    // Use service worker for richer notifications if available
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        body,
        url,
      });
    } else {
      new Notification(title, { body, icon: '/bus-icon.svg' });
    }
  }, []);

  return { requestPermission, notify };
}

/**
 * useBusProximityAlerts
 *
 * Watches the bus store and fires notifications when a tracked bus
 * has ETA ≤ 2 minutes. Must be called inside a component that
 * also calls useNotifications().
 */
export function useBusProximityAlerts(trackedBusId) {
  const buses = useBusStore((s) => s.buses);
  const { notify } = useNotifications();

  useEffect(() => {
    if (!trackedBusId) return;
    const bus = buses[trackedBusId];
    if (!bus) return;

    const eta = bus.eta_minutes;
    const key = `${trackedBusId}-${eta}`;

    if (eta !== null && eta !== undefined && eta <= PROXIMITY_STOP_COUNT && !NOTIFIED_BUSES.has(key)) {
      NOTIFIED_BUSES.add(key);
      notify(
        `🚌 Bus ${bus.busNumber || bus.number} is almost here!`,
        `Arriving in approximately ${eta} minute${eta === 1 ? '' : 's'}. Get ready!`,
        '/dashboard'
      );
    }
  }, [buses, trackedBusId, notify]);
}
