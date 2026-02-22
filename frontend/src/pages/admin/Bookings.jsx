import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';

const COLORS = {
  primary: '#0f172a',
  accent: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#dc2626',
  light: '#f8fafc',
  white: '#ffffff',
  muted: '#64748b',
  border: '#e2e8f0',
};

const DEFAULT_VAN_IMAGE = 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=400';

export default function AdminBookings() {
  const { isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (isAuthenticated) fetchBookings();
  }, [isAuthenticated, page, statusFilter]);

  async function fetchBookings() {
    setLoading(true);
    try {
      const res = await client.get('/admin/bookings', { params: { page, status: statusFilter } });
      setBookings(res.data.bookings);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(bookingId, newStatus) {
    try {
      await client.patch(`/admin/bookings/${bookingId}/status`, { status: newStatus });
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update booking');
    }
  }

  function daysBetween(start, end) {
    const diff = (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24);
    return Math.max(Math.ceil(diff) + 1, 1);
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const s = {
    container: { maxWidth: 1400, margin: '0 auto', padding: '2rem 1rem' },
    header: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem',
    },
    title: { fontSize: '1.75rem', fontWeight: 700, color: COLORS.primary, margin: 0 },
    nav: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
    navLink: {
      padding: '0.6rem 1.25rem', background: COLORS.white, color: COLORS.primary,
      textDecoration: 'none', borderRadius: 10, fontWeight: 500, fontSize: '0.9rem',
      border: `1px solid ${COLORS.border}`, transition: 'all 0.2s',
    },
    navLinkActive: { background: COLORS.accent, color: COLORS.white, borderColor: COLORS.accent },
    filterRow: {
      display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center',
    },
    filterLabel: { color: COLORS.muted, fontSize: '0.9rem' },
    select: {
      padding: '0.6rem 1rem', border: `2px solid ${COLORS.border}`,
      borderRadius: 10, fontSize: '0.9rem', background: COLORS.white, minWidth: 150,
    },
    card: { background: COLORS.white, borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: {
      textAlign: 'left', padding: '1rem', borderBottom: `2px solid ${COLORS.border}`,
      color: COLORS.muted, fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase',
    },
    td: { padding: '1rem', borderBottom: `1px solid ${COLORS.border}`, fontSize: '0.9rem' },
    vanImg: { width: 60, height: 45, objectFit: 'cover', borderRadius: 8 },
    badge: {
      display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: 20,
      fontSize: '0.75rem', fontWeight: 600,
    },
    badgeConfirmed: { background: '#d1fae5', color: '#065f46' },
    badgeCancelled: { background: '#f3f4f6', color: '#6b7280' },
    badgeCompleted: { background: '#dbeafe', color: '#1d4ed8' },
    statusSelect: {
      padding: '0.4rem 0.75rem', border: `1px solid ${COLORS.border}`,
      borderRadius: 6, fontSize: '0.85rem', background: COLORS.white,
    },
    pagination: {
      display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem',
    },
    pageBtn: {
      padding: '0.5rem 1rem', border: `1px solid ${COLORS.border}`, borderRadius: 8,
      background: COLORS.white, cursor: 'pointer', fontSize: '0.9rem',
    },
    pageBtnActive: { background: COLORS.accent, color: COLORS.white, borderColor: COLORS.accent },
    errorBox: {
      padding: '1rem', background: '#fef2f2', color: COLORS.error,
      borderRadius: 10, marginBottom: '1rem', fontSize: '0.9rem',
    },
  };

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h1 style={s.title}>Manage Bookings</h1>
        <nav style={s.nav}>
          <Link to="/admin" style={s.navLink}>Dashboard</Link>
          <Link to="/admin/vans" style={s.navLink}>Vans</Link>
          <Link to="/admin/users" style={s.navLink}>Users</Link>
          <Link to="/admin/bookings" style={{ ...s.navLink, ...s.navLinkActive }}>Bookings</Link>
          <Link to="/admin/settings" style={s.navLink}>Settings</Link>
        </nav>
      </div>

      <div style={s.filterRow}>
        <span style={s.filterLabel}>Filter by status:</span>
        <select
          style={s.select}
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Bookings</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {error && <div style={s.errorBox}>{error}</div>}

      <div style={s.card}>
        {loading ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: COLORS.muted }}>Loading...</p>
        ) : bookings.length === 0 ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: COLORS.muted }}>No bookings found</p>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Van</th>
                <th style={s.th}>Customer</th>
                <th style={s.th}>Dates</th>
                <th style={s.th}>Total</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => (
                <tr key={booking.id}>
                  <td style={s.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={booking.image_url || DEFAULT_VAN_IMAGE}
                        alt={booking.van_name}
                        style={s.vanImg}
                        onError={(e) => { e.target.src = DEFAULT_VAN_IMAGE; }}
                      />
                      <div>
                        <div style={{ fontWeight: 500 }}>{booking.van_name}</div>
                        <div style={{ fontSize: '0.8rem', color: COLORS.muted }}>{booking.van_type}</div>
                      </div>
                    </div>
                  </td>
                  <td style={s.td}>
                    <div style={{ fontWeight: 500 }}>{booking.user_name}</div>
                    <div style={{ fontSize: '0.8rem', color: COLORS.muted }}>{booking.user_email}</div>
                  </td>
                  <td style={s.td}>
                    <div>{new Date(booking.start_date).toLocaleDateString()}</div>
                    <div style={{ fontSize: '0.8rem', color: COLORS.muted }}>
                      to {new Date(booking.end_date).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: COLORS.muted }}>
                      ({daysBetween(booking.start_date, booking.end_date)} days)
                    </div>
                  </td>
                  <td style={s.td}>
                    <div style={{ fontWeight: 600, color: COLORS.accent }}>
                      ${(daysBetween(booking.start_date, booking.end_date) * Number(booking.price_per_day)).toFixed(2)}
                    </div>
                  </td>
                  <td style={s.td}>
                    <span style={{
                      ...s.badge,
                      ...(booking.status === 'confirmed' ? s.badgeConfirmed :
                          booking.status === 'completed' ? s.badgeCompleted : s.badgeCancelled),
                    }}>
                      {booking.status}
                    </span>
                  </td>
                  <td style={s.td}>
                    <select
                      style={s.statusSelect}
                      value={booking.status}
                      onChange={e => handleStatusChange(booking.id, e.target.value)}
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div style={s.pagination}>
          <button
            style={s.pageBtn}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
            Math.max(0, page - 3),
            Math.min(totalPages, page + 2)
          ).map(p => (
            <button
              key={p}
              style={{ ...s.pageBtn, ...(p === page ? s.pageBtnActive : {}) }}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            style={s.pageBtn}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
