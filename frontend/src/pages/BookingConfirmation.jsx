import { useLocation, Link, Navigate } from 'react-router-dom';

export default function BookingConfirmation() {
  const location = useLocation();
  const booking = location.state?.booking;
  const van = location.state?.van;

  if (!booking) return <Navigate to="/vans" replace />;

  const days = (() => {
    const diff = (new Date(booking.end_date) - new Date(booking.start_date)) / (1000 * 60 * 60 * 24);
    return Math.max(Math.ceil(diff) + 1, 1);
  })();
  const total = van ? (days * Number(van.price_per_day)).toFixed(2) : null;

  const s = {
    container: { maxWidth: 600, margin: '0 auto', padding: '3rem 1rem', textAlign: 'center' },
    card: {
      background: '#fff', borderRadius: 16, padding: '2.5rem 2rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginTop: '1rem',
    },
    checkCircle: {
      width: 72, height: 72, borderRadius: '50%', background: '#d1fae5',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 1.25rem', fontSize: '2rem',
    },
    heading: { fontSize: '1.5rem', fontWeight: 700, color: '#065f46', margin: '0 0 0.5rem' },
    subtitle: { color: '#666', fontSize: '0.95rem', marginBottom: '1.5rem' },
    detailsBox: {
      background: '#f8f9fa', borderRadius: 10, padding: '1.25rem',
      textAlign: 'left', marginBottom: '1.5rem',
    },
    detailRow: {
      display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0',
      fontSize: '0.9rem',
    },
    detailLabel: { color: '#666' },
    detailValue: { fontWeight: 600, color: '#1e293b' },
    totalRow: {
      display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0 0',
      borderTop: '1px solid #e0e0e0', marginTop: '0.4rem',
      fontSize: '1.05rem', fontWeight: 700, color: '#1e293b',
    },
    bookingId: {
      display: 'inline-block', background: '#eff6ff', color: '#2563eb',
      padding: '0.3rem 0.8rem', borderRadius: 6, fontSize: '0.85rem',
      fontWeight: 600, marginBottom: '1.25rem',
    },
    actions: {
      display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap',
    },
    primaryBtn: {
      display: 'inline-block', padding: '0.7rem 1.5rem', background: '#2563eb',
      color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600,
      fontSize: '0.9rem',
    },
    secondaryBtn: {
      display: 'inline-block', padding: '0.7rem 1.5rem', background: '#f1f5f9',
      color: '#475569', borderRadius: 8, textDecoration: 'none', fontWeight: 500,
      fontSize: '0.9rem',
    },
  };

  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={s.checkCircle}>&#10003;</div>
        <h1 style={s.heading}>Booking Confirmed!</h1>
        <p style={s.subtitle}>Your van has been successfully reserved.</p>

        <div style={s.bookingId}>Booking #{booking.id}</div>

        <div style={s.detailsBox}>
          {van && (
            <div style={s.detailRow}>
              <span style={s.detailLabel}>Van</span>
              <span style={s.detailValue}>{van.name}</span>
            </div>
          )}
          {van && (
            <div style={s.detailRow}>
              <span style={s.detailLabel}>Type</span>
              <span style={s.detailValue}>{van.type}</span>
            </div>
          )}
          <div style={s.detailRow}>
            <span style={s.detailLabel}>Start Date</span>
            <span style={s.detailValue}>{new Date(booking.start_date).toLocaleDateString()}</span>
          </div>
          <div style={s.detailRow}>
            <span style={s.detailLabel}>End Date</span>
            <span style={s.detailValue}>{new Date(booking.end_date).toLocaleDateString()}</span>
          </div>
          <div style={s.detailRow}>
            <span style={s.detailLabel}>Duration</span>
            <span style={s.detailValue}>{days} {days === 1 ? 'day' : 'days'}</span>
          </div>
          <div style={s.detailRow}>
            <span style={s.detailLabel}>Status</span>
            <span style={{ ...s.detailValue, color: '#065f46' }}>{booking.status}</span>
          </div>
          {van && total && (
            <div style={s.totalRow}>
              <span>Total</span>
              <span>${total}</span>
            </div>
          )}
        </div>

        <div style={s.actions}>
          <Link to="/bookings" style={s.primaryBtn}>View My Bookings</Link>
          <Link to="/vans" style={s.secondaryBtn}>Browse More Vans</Link>
        </div>
      </div>
    </div>
  );
}
