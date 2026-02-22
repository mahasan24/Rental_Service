import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';

const COLORS = {
  primary: '#0f172a',
  secondary: '#1e293b',
  accent: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#dc2626',
  light: '#f8fafc',
  white: '#ffffff',
  muted: '#64748b',
  border: '#e2e8f0',
};

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  async function fetchStats() {
    try {
      const res = await client.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const s = {
    container: { maxWidth: 1400, margin: '0 auto', padding: '2rem 1rem' },
    header: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem',
    },
    title: { fontSize: '1.75rem', fontWeight: 700, color: COLORS.primary, margin: 0 },
    subtitle: { color: COLORS.muted, marginTop: '0.25rem' },
    nav: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
    navLink: {
      padding: '0.6rem 1.25rem', background: COLORS.white, color: COLORS.primary,
      textDecoration: 'none', borderRadius: 10, fontWeight: 500, fontSize: '0.9rem',
      border: `1px solid ${COLORS.border}`, transition: 'all 0.2s',
    },
    navLinkActive: { background: COLORS.accent, color: COLORS.white, borderColor: COLORS.accent },
    statsGrid: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '1.5rem', marginBottom: '2rem',
    },
    statCard: {
      background: COLORS.white, borderRadius: 16, padding: '1.5rem',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    },
    statIcon: {
      width: 48, height: 48, borderRadius: 12, display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
      marginBottom: '1rem',
    },
    statValue: { fontSize: '2rem', fontWeight: 700, color: COLORS.primary },
    statLabel: { color: COLORS.muted, fontSize: '0.9rem', marginTop: '0.25rem' },
    section: { marginBottom: '2rem' },
    sectionTitle: { fontSize: '1.25rem', fontWeight: 600, color: COLORS.primary, marginBottom: '1rem' },
    card: {
      background: COLORS.white, borderRadius: 16, padding: '1.5rem',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: {
      textAlign: 'left', padding: '0.75rem 1rem', borderBottom: `2px solid ${COLORS.border}`,
      color: COLORS.muted, fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase',
    },
    td: {
      padding: '0.75rem 1rem', borderBottom: `1px solid ${COLORS.border}`,
      fontSize: '0.9rem', color: COLORS.primary,
    },
    badge: {
      display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: 20,
      fontSize: '0.75rem', fontWeight: 600,
    },
    badgeConfirmed: { background: '#d1fae5', color: '#065f46' },
    badgeCancelled: { background: '#f3f4f6', color: '#6b7280' },
    errorBox: {
      padding: '1rem 1.5rem', background: '#fef2f2', color: COLORS.error,
      borderRadius: 12, marginBottom: '1.5rem',
    },
    loadingBox: { textAlign: 'center', padding: '4rem', color: COLORS.muted },
  };

  if (loading) {
    return (
      <div style={s.container}>
        <div style={s.loadingBox}>Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={s.container}>
        <div style={s.errorBox}>{error}</div>
        <Link to="/" style={{ color: COLORS.accent }}>← Back to Home</Link>
      </div>
    );
  }

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Admin Dashboard</h1>
          <p style={s.subtitle}>Welcome back, {user?.name || 'Admin'}</p>
        </div>
        <nav style={s.nav}>
          <Link to="/admin" style={{ ...s.navLink, ...s.navLinkActive }}>Dashboard</Link>
          <Link to="/admin/vans" style={s.navLink}>Vans</Link>
          <Link to="/admin/users" style={s.navLink}>Users</Link>
          <Link to="/admin/bookings" style={s.navLink}>Bookings</Link>
          <Link to="/admin/settings" style={s.navLink}>Settings</Link>
        </nav>
      </div>

      <div style={s.statsGrid}>
        <div style={s.statCard}>
          <div style={{ ...s.statIcon, background: '#dbeafe' }}>👥</div>
          <div style={s.statValue}>{stats?.users || 0}</div>
          <div style={s.statLabel}>Total Users</div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIcon, background: '#fef3c7' }}>🚐</div>
          <div style={s.statValue}>{stats?.vans || 0}</div>
          <div style={s.statLabel}>Total Vans</div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIcon, background: '#d1fae5' }}>📋</div>
          <div style={s.statValue}>{stats?.bookings || 0}</div>
          <div style={s.statLabel}>Total Bookings</div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIcon, background: '#fce7f3' }}>💰</div>
          <div style={s.statValue}>${(stats?.revenue || 0).toLocaleString()}</div>
          <div style={s.statLabel}>Total Revenue</div>
        </div>
      </div>

      <section style={s.section}>
        <h2 style={s.sectionTitle}>Recent Bookings</h2>
        <div style={s.card}>
          {stats?.recentBookings?.length > 0 ? (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Customer</th>
                  <th style={s.th}>Van</th>
                  <th style={s.th}>Dates</th>
                  <th style={s.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentBookings.map(booking => (
                  <tr key={booking.id}>
                    <td style={s.td}>
                      <div style={{ fontWeight: 500 }}>{booking.user_name}</div>
                      <div style={{ fontSize: '0.8rem', color: COLORS.muted }}>{booking.user_email}</div>
                    </td>
                    <td style={s.td}>
                      <div style={{ fontWeight: 500 }}>{booking.van_name}</div>
                      <div style={{ fontSize: '0.8rem', color: COLORS.muted }}>{booking.van_type}</div>
                    </td>
                    <td style={s.td}>
                      {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                    </td>
                    <td style={s.td}>
                      <span style={{
                        ...s.badge,
                        ...(booking.status === 'confirmed' ? s.badgeConfirmed : s.badgeCancelled),
                      }}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: COLORS.muted, textAlign: 'center', padding: '2rem' }}>No recent bookings</p>
          )}
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div style={s.card}>
          <h3 style={{ ...s.sectionTitle, marginBottom: '0.75rem' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/admin/vans" style={{ ...s.navLink, textAlign: 'center' }}>+ Add New Van</Link>
            <Link to="/admin/bookings" style={{ ...s.navLink, textAlign: 'center' }}>View All Bookings</Link>
            <Link to="/admin/settings" style={{ ...s.navLink, textAlign: 'center' }}>Configure Settings</Link>
          </div>
        </div>
        <div style={s.card}>
          <h3 style={{ ...s.sectionTitle, marginBottom: '0.75rem' }}>System Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: COLORS.muted }}>API Status</span>
              <span style={{ color: COLORS.success, fontWeight: 500 }}>● Online</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: COLORS.muted }}>Database</span>
              <span style={{ color: COLORS.success, fontWeight: 500 }}>● Connected</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: COLORS.muted }}>AI Service</span>
              <span style={{ color: stats?.aiConfigured ? COLORS.success : COLORS.warning, fontWeight: 500 }}>
                {stats?.aiConfigured ? '● Active' : '○ Not Configured'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
