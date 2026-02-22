import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const DEFAULT_VAN_IMAGE = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop';

const COLORS = {
  primary: '#0f172a',
  accent: '#3b82f6',
  light: '#f8fafc',
  white: '#ffffff',
  muted: '#64748b',
  border: '#e2e8f0',
  success: '#10b981',
  error: '#dc2626',
};

export default function MyBookings() {
  const { isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    fetchBookings();
  }, [isAuthenticated]);

  async function fetchBookings() {
    setLoading(true);
    setError('');
    try {
      const res = await client.get('/bookings');
      setBookings(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to load your bookings.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(id) {
    setError('');
    setCancellingId(id);
    try {
      await client.patch(`/bookings/${id}/cancel`);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to cancel booking. Please try again.';
      setError(msg);
    } finally {
      setCancellingId(null);
    }
  }

  function daysBetween(start, end) {
    const diff = (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24);
    return Math.max(Math.ceil(diff) + 1, 1);
  }

  const s = {
    container: { maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' },
    header: { marginBottom: '2rem' },
    heading: { fontSize: '1.8rem', fontWeight: 700, color: COLORS.primary, marginBottom: '0.5rem' },
    subtitle: { color: COLORS.muted, fontSize: '1rem' },
    loginPrompt: {
      padding: '3rem', textAlign: 'center', background: COLORS.white,
      borderRadius: 16, color: COLORS.muted, boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    },
    loginLink: { color: COLORS.accent, fontWeight: 600 },
    errorBox: {
      padding: '1rem 1.5rem', background: '#fef2f2', color: COLORS.error,
      borderRadius: 12, marginBottom: '1.5rem', fontWeight: 500,
    },
    list: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
    card: {
      display: 'flex', gap: '1.25rem', padding: '1.25rem', background: COLORS.white,
      borderRadius: 16, alignItems: 'flex-start', flexWrap: 'wrap',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s',
    },
    img: {
      width: 140, height: 100, objectFit: 'cover', borderRadius: 12,
      background: COLORS.light,
    },
    body: { flex: 1, minWidth: 220 },
    vanName: { fontWeight: 700, fontSize: '1.15rem', color: COLORS.primary, margin: '0 0 0.25rem' },
    vanType: {
      display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: 12,
      fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.75rem',
      background: COLORS.light, color: COLORS.muted,
    },
    dates: { fontSize: '0.9rem', color: COLORS.primary, marginBottom: '0.5rem' },
    datesLabel: { color: COLORS.muted },
    total: { fontWeight: 600, color: COLORS.accent, fontSize: '1rem' },
    statusBadge: {
      display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: 20,
      fontSize: '0.75rem', fontWeight: 600, marginTop: '0.75rem',
    },
    statusConfirmed: { background: '#d1fae5', color: '#065f46' },
    statusCancelled: { background: '#f3f4f6', color: '#6b7280' },
    actions: { display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' },
    link: { color: COLORS.accent, fontSize: '0.9rem', textDecoration: 'none', fontWeight: 500 },
    cancelBtn: {
      padding: '0.5rem 1rem', fontSize: '0.85rem', background: '#fef2f2',
      color: COLORS.error, border: 'none', borderRadius: 8, cursor: 'pointer',
      fontWeight: 500, transition: 'background 0.2s',
    },
    empty: {
      textAlign: 'center', padding: '4rem 2rem', background: COLORS.white,
      borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    },
    emptyIcon: { fontSize: '3rem', marginBottom: '1rem' },
    retryBtn: {
      marginTop: '1rem', padding: '0.6rem 1.25rem', background: COLORS.accent,
      color: COLORS.white, border: 'none', borderRadius: 8, cursor: 'pointer',
      fontSize: '0.9rem', fontWeight: 500,
    },
  };

  if (!isAuthenticated) {
    return (
      <div style={s.container}>
        <div style={s.header}>
          <h1 style={s.heading}>My Bookings</h1>
          <p style={s.subtitle}>View and manage your van reservations.</p>
        </div>
        <div style={s.loginPrompt}>
          <div style={s.emptyIcon}>🔐</div>
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Please log in to view your bookings</p>
          <Link to="/login" style={s.loginLink}>Sign in to your account</Link>
        </div>
      </div>
    );
  }

  if (loading && bookings.length === 0) {
    return (
      <div style={s.container}>
        <div style={s.empty}>
          <div style={s.emptyIcon}>⏳</div>
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error && bookings.length === 0) {
    return (
      <div style={s.container}>
        <div style={s.header}>
          <h1 style={s.heading}>My Bookings</h1>
          <p style={s.subtitle}>View and manage your van reservations.</p>
        </div>
        <div style={s.errorBox}>{error}</div>
        <button type="button" style={s.retryBtn} onClick={() => fetchBookings()}>Try again</button>
      </div>
    );
  }

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h1 style={s.heading}>My Bookings</h1>
        <p style={s.subtitle}>View and manage your van reservations.</p>
      </div>

      {error && <div style={s.errorBox}>{error}</div>}

      {bookings.length === 0 ? (
        <div style={s.empty}>
          <div style={s.emptyIcon}>📋</div>
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: COLORS.primary }}>You have no bookings yet</p>
          <p style={{ color: COLORS.muted, marginBottom: '1rem' }}>Start by browsing our van collection</p>
          <Link to="/vans" style={{ ...s.retryBtn, textDecoration: 'none', display: 'inline-block' }}>Browse Vans</Link>
        </div>
      ) : (
        <div style={s.list}>
          {bookings.map(b => (
            <div key={b.id} style={s.card}>
              <img
                src={b.image_url || DEFAULT_VAN_IMAGE}
                alt={b.van_name}
                style={s.img}
                onError={(e) => { e.target.src = DEFAULT_VAN_IMAGE; }}
              />
              <div style={s.body}>
                <div style={s.vanName}>{b.van_name}</div>
                <span style={s.vanType}>{b.van_type}</span>
                <div style={s.dates}>
                  <span style={s.datesLabel}>Dates: </span>
                  {new Date(b.start_date).toLocaleDateString()} – {new Date(b.end_date).toLocaleDateString()}
                  {' '}({daysBetween(b.start_date, b.end_date)} {daysBetween(b.start_date, b.end_date) === 1 ? 'day' : 'days'})
                </div>
                <div style={s.total}>
                  Total: ${(daysBetween(b.start_date, b.end_date) * Number(b.price_per_day)).toFixed(2)}
                </div>
                <span style={{
                  ...s.statusBadge,
                  ...(b.status === 'confirmed' ? s.statusConfirmed : s.statusCancelled),
                }}>
                  {b.status === 'confirmed' ? '✓ Confirmed' : 'Cancelled'}
                </span>
              </div>
              <div style={s.actions}>
                <Link to={`/vans/${b.van_id}`} style={s.link}>View van →</Link>
                {b.status === 'confirmed' && (
                  <button
                    style={s.cancelBtn}
                    onClick={() => handleCancel(b.id)}
                    disabled={cancellingId === b.id}
                  >
                    {cancellingId === b.id ? 'Cancelling...' : 'Cancel Booking'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
