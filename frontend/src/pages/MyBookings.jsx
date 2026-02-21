import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

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
    } catch {
      setError('Failed to load your bookings.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(id) {
    setCancellingId(id);
    try {
      await client.patch(`/bookings/${id}/cancel`);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    } catch {
      setError('Failed to cancel booking. Please try again.');
    } finally {
      setCancellingId(null);
    }
  }

  function daysBetween(start, end) {
    const diff = (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24);
    return Math.max(Math.ceil(diff) + 1, 1);
  }

  const s = {
    container: { maxWidth: 800, margin: '0 auto', padding: '2rem 1rem' },
    heading: { fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' },
    subtitle: { color: '#666', marginBottom: '1.5rem' },
    loginPrompt: {
      padding: '2rem', textAlign: 'center', background: '#f8f9fa',
      borderRadius: 12, color: '#555',
    },
    loginLink: { color: '#2563eb', fontWeight: 600 },
    errorBox: {
      padding: '1rem', background: '#fee2e2', color: '#b91c1c',
      borderRadius: 8, marginBottom: '1rem',
    },
    list: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    card: {
      display: 'flex', gap: '1rem', padding: '1rem', background: '#fff',
      border: '1px solid #e5e7eb', borderRadius: 12, alignItems: 'flex-start',
      flexWrap: 'wrap',
    },
    img: { width: 120, height: 90, objectFit: 'cover', borderRadius: 8 },
    body: { flex: 1, minWidth: 200 },
    vanName: { fontWeight: 700, fontSize: '1.1rem', margin: '0 0 0.25rem' },
    vanType: { color: '#666', fontSize: '0.85rem', marginBottom: '0.5rem' },
    dates: { fontSize: '0.9rem', color: '#444', marginBottom: '0.25rem' },
    total: { fontWeight: 600, color: '#2563eb', fontSize: '0.95rem' },
    statusBadge: {
      display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: 20,
      fontSize: '0.75rem', fontWeight: 600, marginTop: '0.5rem',
    },
    statusConfirmed: { background: '#d1fae5', color: '#065f46' },
    statusCancelled: { background: '#f3f4f6', color: '#6b7280' },
    actions: { display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' },
    link: { color: '#2563eb', fontSize: '0.9rem', textDecoration: 'none' },
    cancelBtn: {
      padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: '#fee2e2',
      color: '#b91c1c', border: 'none', borderRadius: 6, cursor: 'pointer',
      fontWeight: 500,
    },
    empty: { textAlign: 'center', padding: '3rem', color: '#888' },
  };

  if (!isAuthenticated) {
    return (
      <div style={s.container}>
        <h1 style={s.heading}>My Bookings</h1>
        <p style={s.subtitle}>View and manage your van reservations.</p>
        <div style={s.loginPrompt}>
          <p>Please <Link to="/login" style={s.loginLink}>log in</Link> to view your bookings.</p>
        </div>
      </div>
    );
  }

  if (loading) return <div style={{ ...s.container, textAlign: 'center', padding: '3rem' }}>Loading your bookings...</div>;
  if (error) return <div style={s.container}><h1 style={s.heading}>My Bookings</h1><div style={s.errorBox}>{error}</div></div>;

  return (
    <div style={s.container}>
      <h1 style={s.heading}>My Bookings</h1>
      <p style={s.subtitle}>View and manage your van reservations.</p>

      {bookings.length === 0 ? (
        <div style={s.empty}>
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>You have no bookings yet.</p>
          <Link to="/vans" style={s.loginLink}>Browse vans and book one</Link>
        </div>
      ) : (
        <div style={s.list}>
          {bookings.map(b => (
            <div key={b.id} style={s.card}>
              <img
                src={b.image_url || 'https://via.placeholder.com/120x90?text=Van'}
                alt={b.van_name}
                style={s.img}
              />
              <div style={s.body}>
                <div style={s.vanName}>{b.van_name}</div>
                <div style={s.vanType}>{b.van_type}</div>
                <div style={s.dates}>
                  {new Date(b.start_date).toLocaleDateString()} – {new Date(b.end_date).toLocaleDateString()}
                  {' · '}{daysBetween(b.start_date, b.end_date)} {daysBetween(b.start_date, b.end_date) === 1 ? 'day' : 'days'}
                </div>
                <div style={s.total}>
                  Total: ${(daysBetween(b.start_date, b.end_date) * Number(b.price_per_day)).toFixed(2)}
                </div>
                <span style={{
                  ...s.statusBadge,
                  ...(b.status === 'confirmed' ? s.statusConfirmed : s.statusCancelled),
                }}>
                  {b.status}
                </span>
              </div>
              <div style={s.actions}>
                <Link to={`/vans/${b.van_id}`} style={s.link}>View van</Link>
                {b.status === 'confirmed' && (
                  <button
                    style={s.cancelBtn}
                    onClick={() => handleCancel(b.id)}
                    disabled={cancellingId === b.id}
                  >
                    {cancellingId === b.id ? 'Cancelling...' : 'Cancel'}
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
