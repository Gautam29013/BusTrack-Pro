'use client';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useSocket } from '../../hooks/useSocket';

export default function DriverPortal() {
  const socket = useSocket();
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [busNumber, setBusNumber] = useState('');
  const [isShiftActive, setIsShiftActive] = useState(false);
  
  const [location, setLocation] = useState({ lat: 28.6139, lng: 77.2090 });
  const [speed, setSpeed] = useState(0);
  
  const movementInterval = useRef(null);

  useEffect(() => {
    api.get('/routes').then(({ data }) => {
      if (data.success) setRoutes(data.data);
    }).catch(() => toast.error('Failed to load routes'));
  }, []);

  // Simulator for driver location
  const toggleShift = () => {
    if (!selectedRoute || !busNumber) {
      return toast.error('Please select a route and enter bus number.');
    }

    if (isShiftActive) {
      clearInterval(movementInterval.current);
      setIsShiftActive(false);
      toast('Shift ended');
    } else {
      setIsShiftActive(true);
      toast.success('Shift started! Broadcasting location...');
      
      // Simulate movement every 2 seconds
      movementInterval.current = setInterval(() => {
        setLocation(prev => {
          const newLat = prev.lat + (Math.random() - 0.5) * 0.005;
          const newLng = prev.lng + (Math.random() - 0.5) * 0.005;
          const simulatedSpeed = 20 + Math.random() * 30; // 20-50 km/h
          setSpeed(simulatedSpeed);
          
          if (socket) {
            socket.emit('driver_location_update', {
              id: `live-driver-${busNumber}`, // Unique bus ID
              busId: `live-driver-${busNumber}`,
              number: busNumber,
              routeId: selectedRoute,
              routeName: routes.find(r => r.id === selectedRoute)?.name || 'Driver Route',
              lat: newLat,
              lng: newLng,
              speed: simulatedSpeed,
              heading: Math.random() * 360,
              passengerCount: Math.floor(Math.random() * 30),
              status: 'on_time'
            });
          }

          return { lat: newLat, lng: newLng };
        });
      }, 2000);
    }
  };

  useEffect(() => {
    return () => clearInterval(movementInterval.current);
  }, []);

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto', height: '100%', overflowY: 'auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '24px' }}>Driver Portal 🚍</h1>

      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Shift Details</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Bus Number (e.g. B999)</label>
            <input 
              type="text" 
              className="input-field" 
              value={busNumber} 
              onChange={e => setBusNumber(e.target.value)} 
              disabled={isShiftActive}
              placeholder="Enter Bus Number"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Select Route</label>
            <select 
              className="input-field" 
              value={selectedRoute} 
              onChange={e => setSelectedRoute(e.target.value)}
              disabled={isShiftActive}
            >
              <option value="">-- Choose Route --</option>
              {routes.map(r => (
                <option key={r.id} value={r.id}>{r.number} - {r.name}</option>
              ))}
            </select>
          </div>

          <button 
            className="btn-primary" 
            style={{ 
              marginTop: '8px', 
              padding: '14px', 
              fontSize: '16px', 
              background: isShiftActive ? 'var(--accent-rose)' : 'var(--accent-emerald)',
              boxShadow: isShiftActive ? '0 0 20px rgba(244,63,94,0.4)' : '0 0 20px rgba(16,185,129,0.4)'
            }}
            onClick={toggleShift}
          >
            {isShiftActive ? '🛑 End Shift' : '▶️ Start Shift & Broadcast Location'}
          </button>
        </div>
      </div>

      {isShiftActive && (
        <div className="glass-card" style={{ padding: '24px', border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-emerald)' }}>🔴 Live Broadcasting</h3>
            <span className="badge badge-green">Active</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Speed</div>
              <div style={{ fontSize: '20px', fontWeight: 700 }}>{speed.toFixed(0)} <span style={{ fontSize: '12px', color: '#64748b' }}>km/h</span></div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Passengers</div>
              <div style={{ fontSize: '20px', fontWeight: 700 }}>~15</div>
            </div>
          </div>
          
          <div style={{ marginTop: '16px', fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>
            LAT: {location.lat.toFixed(6)} <br/>
            LNG: {location.lng.toFixed(6)}
          </div>
        </div>
      )}
    </div>
  );
}
