import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';

const COLORS = {
  primary: '#0f172a',
  accent: '#3b82f6',
  success: '#10b981',
  error: '#dc2626',
  light: '#f8fafc',
  white: '#ffffff',
  muted: '#64748b',
  border: '#e2e8f0',
};

export default function AdminUsers() {
  const { isAuthenticated, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (isAuthenticated) fetchUsers();
  }, [isAuthenticated, page, search]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await client.get('/admin/users', { params: { page, search } });
      setUsers(res.data.users);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(userId, newRole) {
    try {
      await client.patch(`/admin/users/${userId}`, { role: newRole });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user');
    }
  }

  async function handleDelete(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await client.delete(`/admin/users/${userId}`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user');
    }
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
    searchBox: {
      display: 'flex', gap: '0.75rem', marginBottom: '1.5rem',
    },
    searchInput: {
      flex: 1, maxWidth: 300, padding: '0.75rem 1rem',
      border: `2px solid ${COLORS.border}`, borderRadius: 10, fontSize: '0.95rem',
    },
    card: { background: COLORS.white, borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: {
      textAlign: 'left', padding: '1rem', borderBottom: `2px solid ${COLORS.border}`,
      color: COLORS.muted, fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase',
    },
    td: { padding: '1rem', borderBottom: `1px solid ${COLORS.border}`, fontSize: '0.9rem' },
    avatar: {
      width: 40, height: 40, borderRadius: '50%', background: COLORS.accent,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: COLORS.white, fontWeight: 600, fontSize: '0.9rem',
    },
    badge: {
      display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: 20,
      fontSize: '0.75rem', fontWeight: 600,
    },
    badgeAdmin: { background: '#fef3c7', color: '#92400e' },
    badgeUser: { background: '#dbeafe', color: '#1d4ed8' },
    select: {
      padding: '0.4rem 0.75rem', border: `1px solid ${COLORS.border}`,
      borderRadius: 6, fontSize: '0.85rem', background: COLORS.white,
    },
    actionBtn: {
      padding: '0.4rem 0.75rem', border: 'none', borderRadius: 6, cursor: 'pointer',
      fontSize: '0.8rem', fontWeight: 500, background: '#fef2f2', color: COLORS.error,
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
        <h1 style={s.title}>Manage Users</h1>
        <nav style={s.nav}>
          <Link to="/admin" style={s.navLink}>Dashboard</Link>
          <Link to="/admin/vans" style={s.navLink}>Vans</Link>
          <Link to="/admin/users" style={{ ...s.navLink, ...s.navLinkActive }}>Users</Link>
          <Link to="/admin/bookings" style={s.navLink}>Bookings</Link>
          <Link to="/admin/settings" style={s.navLink}>Settings</Link>
        </nav>
      </div>

      <div style={s.searchBox}>
        <input
          style={s.searchInput}
          placeholder="Search by name or email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {error && <div style={s.errorBox}>{error}</div>}

      <div style={s.card}>
        {loading ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: COLORS.muted }}>Loading...</p>
        ) : users.length === 0 ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: COLORS.muted }}>No users found</p>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>User</th>
                <th style={s.th}>Email</th>
                <th style={s.th}>Role</th>
                <th style={s.th}>Joined</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td style={s.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={s.avatar}>
                        {(user.name || user.email)[0].toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 500 }}>{user.name || 'No name'}</span>
                    </div>
                  </td>
                  <td style={s.td}>{user.email}</td>
                  <td style={s.td}>
                    <select
                      style={s.select}
                      value={user.role}
                      onChange={e => handleRoleChange(user.id, e.target.value)}
                      disabled={user.id === currentUser?.id}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={s.td}>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td style={s.td}>
                    {user.id !== currentUser?.id && (
                      <button style={s.actionBtn} onClick={() => handleDelete(user.id)}>
                        Delete
                      </button>
                    )}
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
