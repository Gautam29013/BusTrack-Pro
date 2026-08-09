'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../lib/api';
import useI18nStore from '../../store/i18nStore';

export default function TicketsPage() {
  const { t } = useI18nStore();
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
        <h1 style={{ fontSize: '28px', fontWeight: 800 }}>{t('my_tickets')} 🎟️</h1>
      </div>

      {/* Buy Tickets Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div className="glass-card" style={{ padding: '20px', border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.05)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-blue)', marginBottom: '8px' }}>{t('single_ride')}</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>{t('valid_one_trip')}</p>
          <div style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px' }}>$2.50</div>
          <button 
            className="btn-primary" 
            style={{ width: '100%' }}
            onClick={() => handleBuyTicket(t('single_ride'), 2.50)}
            disabled={isBuying}
          >
            {isBuying ? t('processing') : t('buy_single')}
          </button>
        </div>

        <div className="glass-card" style={{ padding: '20px', border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.05)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '8px' }}>{t('daily_pass')}</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>{t('valid_unlimited')}</p>
          <div style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px' }}>$7.00</div>
          <button 
            className="btn-primary" 
            style={{ width: '100%', background: 'var(--accent-emerald)' }}
            onClick={() => handleBuyTicket(t('daily_pass'), 7.00)}
            disabled={isBuying}
          >
            {isBuying ? t('processing') : t('buy_daily')}
          </button>
        </div>
      </div>

      {/* Active Tickets List */}
      <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>{t('your_passes')}</h2>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>{t('loading_tickets')}</div>
      ) : tickets.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          {t('no_tickets')}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {tickets.map(ticket => {
            const isExpired = new Date(ticket.expires_at) < new Date();
            return (
              <div key={ticket.id} className="glass-card" style={{ padding: '20px', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap', opacity: isExpired ? 0.6 : 1 }}>
                
                {/* QR Code */}
                <div style={{ padding: '10px', background: 'white', borderRadius: '12px' }}>
                  <QRCodeSVG value={ticket.qr_data} size={100} fgColor={isExpired ? 'var(--text-secondary)' : 'var(--bg-primary)'} />
                </div>

                {/* Ticket Details */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 700 }}>{ticket.ticket_type}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>ID: {ticket.qr_data}</div>
                    </div>
                    {isExpired ? (
                      <span className="badge" style={{ background: 'rgba(244,63,94,0.1)', color: 'var(--accent-rose)', border: '1px solid rgba(244,63,94,0.2)' }}>{t('expired')}</span>
                    ) : (
                      <span className="badge badge-green">{t('active')}</span>
                    )}
                  </div>
                  
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '12px' }}>
                    <strong>{t('purchased')}:</strong> {new Date(ticket.created_at).toLocaleString()} <br/>
                    <strong>{t('expires')}:</strong> {new Date(ticket.expires_at).toLocaleString()}
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
