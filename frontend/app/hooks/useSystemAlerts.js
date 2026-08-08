import { useEffect } from 'react';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
let socket;

export function useSystemAlerts() {
  useEffect(() => {
    if (!socket) {
      socket = io(socketUrl, { transports: ['websocket'] });
    }

    const handleAlert = (alert) => {
      // Use different toast styles based on severity
      const style = {
        background: alert.severity === 'error' ? 'rgba(244,63,94,0.95)' : 'rgba(13,20,36,0.95)',
        color: 'white',
        border: alert.severity === 'error' ? '1px solid #f43f5e' : '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(16px)',
        fontSize: '14px',
        fontWeight: 600,
        padding: '12px 16px',
      };

      const icon = alert.severity === 'error' ? '🚨' : '📢';

      toast.success(alert.message, {
        icon,
        style,
        duration: alert.severity === 'error' ? 8000 : 5000,
        position: 'top-center'
      });
    };

    socket.on('system_alert', handleAlert);

    return () => {
      socket.off('system_alert', handleAlert);
    };
  }, []);
}
