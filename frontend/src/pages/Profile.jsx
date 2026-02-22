import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

const DEFAULT_VAN_IMAGE = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop';

const COLORS = {
  primary: '#0f172a',
  accent: '#3b82f6',
  accentLight: '#60a5fa',
  success: '#10b981',
  warning: '#f59e0b',
  light: '#f8fafc',
  white: '#ffffff',
  muted: '#64748b',
  border: '#e2e8f0',
};

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const [history, setHistory] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, completed: 0, cancelled: 0 });

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  async function fetchData() {
    setLoading(true);
    try {
      const [historyRes, recsRes] = await Promise.all([
        client.get('/recommendations/history'),
        client.get('/recommendations/personalized'),
      ]);
      const bookings = historyRes.data.history || [];
      setHistory(bookings);
      setRecommendations(recsRes.data.vans || []);

      const total = bookings.length;
      const completed = bookings.filter(b => b.status === 'confirmed').length;
      const cancelled = bookings.filter(b => b.status === 'cancelled').length;
      setStats({ total, completed, cancelled });
    } catch {
      setHistory([]);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const s = {
    container: { maxWidth: 1000, margin: '0 auto', padding: '2rem 1rem' },
    header: {
      display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2rem',
      padding: '2rem', background: COLORS.white, borderRadius: 20,
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    },
    avatar: {
      width: 80, height: 80, borderRadius: '50%', background: COLORS.accent,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '2rem', color: COLORS.white, fontWeight: 700,
    },
    userInfo: { flex: 1 },
    userName: { fontSize: '1.5rem', fontWeight: 700, color: COLORS.primary, margin: 0 },
    userEmail: { color: COLORS.muted, fontSize: '0.95rem' },
    statsRow: { display: 'flex', gap: '1.5rem', marginTop: '1rem' },
    stat: {
      padding: '0.5rem 1rem', background: COLORS.light, borderRadius: 10,
      textAlign: 'center',
    },
    statNum: { fontSize: '1.25rem', fontWeight: 700, color: COLORS.primary },
    statLabel: { fontSize: '0.75rem', color: COLORS.muted },
    section: { marginBottom: '2rem' },
    sectionTitle: {
      fontSize: '1.25rem', fontWeight: 700, color: COLORS.primary,
      marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
    },
    card: {
      background: COLORS.white, borderRadius: 16, padding: '1.5rem',
      boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
    },
    historyList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    historyItem: {
      display: 'flex', gap: '1rem', padding: '1rem', background: COLORS.light,
      borderRadius: 12, alignItems: 'center',
    },
    historyImg: { width: 80, height: 60, objectFit: 'cover', borderRadius: 8 },
    historyInfo: { flex: 1 },
    historyName: { fontWeight: 600, color: COLORS.primary, marginBottom: '0.25rem' },
    historyDates: { fontSize: '0.85rem', color: COLORS.muted },
    statusBadge: {
      padding: '0.25rem 0.75rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
    },
    statusConfirmed: { background: '#d1fae5', color: '#065f46' },
    statusCancelled: { background: '#f3f4f6', color: '#6b7280' },
    vanGrid: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '1rem',
    },
    vanCard: {
      background: COLORS.light, borderRadius: 12, overflow: 'hidden',
      transition: 'transform 0.2s',
    },
    vanImg: { width: '100%', height: 120, objectFit: 'cover' },
    vanBody: { padding: '1rem' },
    vanName: { fontWeight: 600, color: COLORS.primary, fontSize: '0.95rem' },
    vanPrice: { color: COLORS.accent, fontWeight: 600, fontSize: '0.9rem' },
    emptyState: {
      textAlign: 'center', padding: '2rem', color: COLORS.muted,
    },
    link: { color: COLORS.accent, fontWeight: 500 },
  };

  if (loading) {
    return (
      <div style={s.container}>
        <div style={{ textAlign: 'center', padding: '4rem', color: COLORS.muted }}>
          Loading your profile...
        </div>
      </div>
    );
  }

  return (
    <div style={s.container}>
      {/* Profile Header */}
      <div style={s.header}>
        <div style={s.avatar}>
          {(user?.name || user?.email || 'U')[0].toUpperCase()}
        </div>
        <div style={s.userInfo}>
          <h1 style={s.userName}>{user?.name || 'Welcome!'}</h1>
          <p style={s.userEmail}>{user?.email}</p>
          <div style={s.statsRow}>
            <div style={s.stat}>
              <div style={s.statNum}>{stats.total}</div>
              <div style={s.statLabel}>Total Bookings</div>
            </div>
            <div style={s.stat}>
              <div style={{ ...s.statNum, color: COLORS.success }}>{stats.completed}</div>
              <div style={s.statLabel}>Completed</div>
            </div>
            <div style={s.stat}>
              <div style={{ ...s.statNum, color: COLORS.muted }}>{stats.cancelled}</div>
              <div style={s.statLabel}>Cancelled</div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking History */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>
          <span>📋</span> Booking History
        </h2>
        <div style={s.card}>
          {history.length === 0 ? (
            <div style={s.emptyState}>
              <p>No bookings yet.</p>
              <Link to="/vans" style={s.link}>Browse vans and make your first booking</Link>
            </div>
          ) : (
            <div style={s.historyList}>
              {history.slice(0, 5).map(booking => (
                <div key={booking.id} style={s.historyItem}>
                  <img
                    src={booking.image_url || DEFAULT_VAN_IMAGE}
                    alt={booking.van_name}
                    style={s.historyImg}
                    onError={(e) => { e.target.src = DEFAULT_VAN_IMAGE; }}
                  />
                  <div style={s.historyInfo}>
                    <div style={s.historyName}>{booking.van_name}</div>
                    <div style={s.historyDates}>
                      {new Date(booking.start_date).toLocaleDateString()} – {new Date(booking.end_date).toLocaleDateString()}
                    </div>
                  </div>
                  <span style={{
                    ...s.statusBadge,
                    ...(booking.status === 'confirmed' ? s.statusConfirmed : s.statusCancelled),
                  }}>
                    {booking.status}
                  </span>
                </div>
              ))}
              {history.length > 5 && (
                <Link to="/bookings" style={{ ...s.link, textAlign: 'center', display: 'block', marginTop: '0.5rem' }}>
                  View all {history.length} bookings →
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Recommended for You */}
      {recommendations.length > 0 && (
        <section style={s.section}>
          <h2 style={s.sectionTitle}>
            <span>✨</span> Recommended for You
          </h2>
          <div style={s.vanGrid}>
            {recommendations.slice(0, 4).map(van => (
              <Link key={van.id} to={`/vans/${van.id}`} style={{ textDecoration: 'none' }}>
                <div style={s.vanCard}>
                  <img
                    src={van.image_url || DEFAULT_VAN_IMAGE}
                    alt={van.name}
                    style={s.vanImg}
                    onError={(e) => { e.target.src = DEFAULT_VAN_IMAGE; }}
                  />
                  <div style={s.vanBody}>
                    <div style={s.vanName}>{van.name}</div>
                    <div style={s.vanPrice}>${Number(van.price_per_day).toFixed(2)}/day</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
