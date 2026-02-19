import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function BookingForm() {
  const { vanId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [van, setVan] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [available, setAvailable] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    async function fetchVan() {
      try {
        const res = await client.get(`/vans/${vanId}`);
        setVan(res.data);
      } catch {
        setError('Failed to load van details.');
      } finally {
        setLoading(false);
      }
    }
    fetchVan();
  }, [vanId]);

  useEffect(() => {
    if (!startDate || !endDate || !van) {
      setAvailable(null);
      return;
    }
    let cancelled = false;
    async function check() {
      try {
        const res = await client.get('/bookings/availability', {
          params: { van_id: van.id, start_date: startDate, end_date: endDate },
        });
        if (!cancelled) setAvailable(res.data.available);
      } catch {
        if (!cancelled) setAvailable(null);
      }
    }
    check();
    return () => { cancelled = true; };
  }, [startDate, endDate, van]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!startDate || !endDate) {
      setError('Please select both start and end dates.');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError('End date must be on or after start date.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await client.post('/bookings', {
        van_id: parseInt(vanId, 10),
        start_date: startDate,
        end_date: endDate,
      });
      navigate('/booking-confirmation', { state: { booking: res.data, van } });
    } catch (err) {
      const msg = err.response?.data?.error || 'Booking failed. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  function getDayCount() {
    if (!startDate || !endDate) return 0;
    const diff = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
    return Math.max(Math.ceil(diff) + 1, 1);
  }

  const days = getDayCount();
  const total = van ? (days * Number(van.price_per_day)).toFixed(2) : '0.00';

  const s = {
    container: { maxWidth: 700, margin: '0 auto', padding: '2rem 1rem' },
    backLink: { color: '#2563eb', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 },
    card: {
      marginTop: '1rem', borderRadius: 14, overflow: 'hidden', background: '#fff',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    },
    vanHeader: {
      display: 'flex', gap: '1rem', padding: '1.25rem', background: '#f8f9fa',
      alignItems: 'center',
    },
    vanImg: { width: 100, height: 70, objectFit: 'cover', borderRadius: 8 },
    vanInfo: { flex: 1 },
    vanName: { fontWeight: 700, fontSize: '1.1rem', margin: 0 },
    vanType: { color: '#666', fontSize: '0.85rem' },
    vanPrice: { fontWeight: 700, color: '#2563eb', fontSize: '1rem' },
    form: { padding: '1.5rem' },
    fieldRow: { display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' },
    fieldGroup: { flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: '0.3rem' },
    label: { fontSize: '0.85rem', fontWeight: 600, color: '#444' },
    input: {
      padding: '0.6rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 8,
      fontSize: '0.95rem', outline: 'none',
    },
    summary: {
      padding: '1rem 1.25rem', background: '#f0f7ff', borderRadius: 10,
      marginBottom: '1.25rem',
    },
    summaryRow: {
      display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0',
      fontSize: '0.9rem', color: '#555',
    },
    summaryTotal: {
      display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0 0',
      borderTop: '1px solid #d0e0f0', marginTop: '0.4rem', fontSize: '1.05rem',
      fontWeight: 700, color: '#1e293b',
    },
    availBadge: {
      display: 'inline-block', padding: '0.3rem 0.75rem', borderRadius: 20,
      fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem',
    },
    availYes: { background: '#d1fae5', color: '#065f46' },
    availNo: { background: '#fee2e2', color: '#991b1b' },
    submitBtn: {
      width: '100%', padding: '0.8rem', background: '#2563eb', color: '#fff',
      border: 'none', borderRadius: 8, fontSize: '1rem', fontWeight: 600,
      cursor: 'pointer', transition: 'background 0.2s',
    },
    disabledBtn: { background: '#93c5fd', cursor: 'not-allowed' },
    errorBox: {
      padding: '0.75rem', background: '#fee2e2', color: '#b91c1c', borderRadius: 8,
      marginBottom: '1rem', fontSize: '0.9rem',
    },
    center: { textAlign: 'center', padding: '4rem', color: '#888' },
  };

  if (loading) return <div style={s.center}>Loading...</div>;
  if (!van && error) return <div style={s.center}><p style={{ color: '#b91c1c' }}>{error}</p><Link to="/vans" style={s.backLink}>Back to vans</Link></div>;
  if (!van) return null;

  const canSubmit = startDate && endDate && available === true && !submitting;

  return (
    <div style={s.container}>
      <Link to={`/vans/${van.id}`} style={s.backLink}>&larr; Back to {van.name}</Link>

      <div style={s.card}>
        <div style={s.vanHeader}>
          <img src={van.image_url || 'https://via.placeholder.com/100x70?text=Van'} alt={van.name} style={s.vanImg} />
          <div style={s.vanInfo}>
            <h2 style={s.vanName}>{van.name}</h2>
            <span style={s.vanType}>{van.type} · {van.capacity} seats</span>
          </div>
          <span style={s.vanPrice}>${Number(van.price_per_day).toFixed(2)}/day</span>
        </div>

        <form style={s.form} onSubmit={handleSubmit}>
          {error && <div style={s.errorBox}>{error}</div>}

          <div style={s.fieldRow}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Start Date</label>
              <input type="date" style={s.input} min={today} value={startDate}
                onChange={e => { setStartDate(e.target.value); if (endDate && e.target.value > endDate) setEndDate(''); }} />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>End Date</label>
              <input type="date" style={s.input} min={startDate || today} value={endDate}
                onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>

          {startDate && endDate && available !== null && (
            <span style={{ ...s.availBadge, ...(available ? s.availYes : s.availNo) }}>
              {available ? 'Available for selected dates' : 'Not available — choose different dates'}
            </span>
          )}

          {startDate && endDate && (
            <div style={s.summary}>
              <div style={s.summaryRow}><span>Daily rate</span><span>${Number(van.price_per_day).toFixed(2)}</span></div>
              <div style={s.summaryRow}><span>Duration</span><span>{days} {days === 1 ? 'day' : 'days'}</span></div>
              <div style={s.summaryTotal}><span>Total</span><span>${total}</span></div>
            </div>
          )}

          <button type="submit" style={{ ...s.submitBtn, ...(!canSubmit ? s.disabledBtn : {}) }} disabled={!canSubmit}>
            {submitting ? 'Booking...' : 'Confirm Booking'}
          </button>

          {!isAuthenticated && (
            <p style={{ textAlign: 'center', marginTop: '0.75rem', color: '#666', fontSize: '0.85rem' }}>
              You need to <Link to="/login" style={{ color: '#2563eb' }}>log in</Link> to book a van.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
