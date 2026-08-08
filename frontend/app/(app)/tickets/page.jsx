'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../lib/api';

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBuying, setIsBuying] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data } = await api.get('/payments/tickets');
      if (data.success) setTickets(data.data);
    } catch (e) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyTicket = async (type, price) => {
    setIsBuying(true);
    try {
      // Mock Stripe Checkout
      const { data } = await api.post('/payments/checkout', { ticketType: type, price });
      if (data.success) {
        toast.success(data.message);
        setTickets([data.data, ...tickets]); // Prepend new ticket
      }
    } catch (e) {
      toast.error('Failed to purchase ticket');
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800 }}>My Tickets & Passes 🎟️</h1>
      </div>

      {/* Buy Tickets Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div className="glass-card" style={{ padding: '20px', border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.05)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#3b82f6', marginBottom: '8px' }}>Single Ride</h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>Valid for one trip within 2 hours of purchase.</p>
          <div style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px' }}>$2.50</div>
          <button 
            className="btn-primary" 
            style={{ width: '100%' }}
            onClick={() => handleBuyTicket('Single Ride', 2.50)}
            disabled={isBuying}
          >
            {isBuying ? 'Processing...' : 'Buy Single Ride'}
          </button>
        </div>

        <div className="glass-card" style={{ padding: '20px', border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.05)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#10b981', marginBottom: '8px' }}>Daily Pass</h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>Unlimited rides across all routes for 24 hours.</p>
          <div style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px' }}>$7.00</div>
          <button 
            className="btn-primary" 
            style={{ width: '100%', background: '#10b981' }}
            onClick={() => handleBuyTicket('Daily Pass', 7.00)}
            disabled={isBuying}
          >
            {isBuying ? 'Processing...' : 'Buy Daily Pass'}
          </button>
        </div>
      </div>

      {/* Active Tickets List */}
      <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Your Passes</h2>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>Loading tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          No active tickets found. Purchase a pass above to get started!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {tickets.map(ticket => {
            const isExpired = new Date(ticket.expires_at) < new Date();
            return (
              <div key={ticket.id} className="glass-card" style={{ padding: '20px', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap', opacity: isExpired ? 0.6 : 1 }}>
                
                {/* QR Code */}
                <div style={{ padding: '10px', background: 'white', borderRadius: '12px' }}>
                  <QRCodeSVG value={ticket.qr_data} size={100} fgColor={isExpired ? '#94a3b8' : '#0a0f1e'} />
                </div>

                {/* Ticket Details */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 700 }}>{ticket.ticket_type}</div>
                      <div style={{ fontSize: '13px', color: '#94a3b8', fontFamily: 'monospace' }}>ID: {ticket.qr_data}</div>
                    </div>
                    {isExpired ? (
                      <span className="badge" style={{ background: 'rgba(244,63,94,0.1)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.2)' }}>Expired</span>
                    ) : (
                      <span className="badge badge-green">Active</span>
                    )}
                  </div>
                  
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '12px' }}>
                    <strong>Purchased:</strong> {new Date(ticket.created_at).toLocaleString()} <br/>
                    <strong>Expires:</strong> {new Date(ticket.expires_at).toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
