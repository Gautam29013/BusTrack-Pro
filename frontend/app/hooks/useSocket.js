'use client';
import { useEffect, useRef } from 'react';
import { getSocket, disconnectSocket } from '../lib/socket';
import useBusStore from '../store/busStore';
import useUIStore from '../store/uiStore';

export function useSocket() {
  const socketRef = useRef(null);
  const updateBusLocation = useBusStore((s) => s.updateBusLocation);
  const setConnected = useBusStore((s) => s.setConnected);
  const addToast = useUIStore((s) => s.addToast);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('location-update', (data) => {
      updateBusLocation(data);
    });

    return () => {
      socket.off('location-update');
    };
  }, [updateBusLocation, setConnected]);

  return socketRef.current;
}
