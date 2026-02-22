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

const DEFAULT_VAN_IMAGE = 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=400';

export default function AdminVans() {
  const { isAuthenticated } = useAuth();
  const [vans, setVans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVan, setEditingVan] = useState(null);
  const [formData, setFormData] = useState({
    name: '', type: 'Passenger', capacity: '', price_per_day: '',
    description: '', image_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (isAuthenticated) fetchVans();
  }, [isAuthenticated]);

  async function fetchVans() {
    try {
      const res = await client.get('/admin/vans');
      setVans(res.data.vans);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load vans');
    } finally {
      setLoading(false);
    }
  }

  function openModal(van = null) {
    if (van) {
      setEditingVan(van);
      setFormData({
        name: van.name, type: van.type, capacity: van.capacity,
        price_per_day: van.price_per_day, description: van.description || '',
        image_url: van.image_url || '',
      });
    } else {
      setEditingVan(null);
      setFormData({ name: '', type: 'Passenger', capacity: '', price_per_day: '', description: '', image_url: '' });
    }
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingVan) {
        await client.patch(`/admin/vans/${editingVan.id}`, formData);
      } else {
        await client.post('/admin/vans', formData);
      }
      setShowModal(false);
      fetchVans();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save van');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this van?')) return;
    try {
      await client.delete(`/admin/vans/${id}`);
      fetchVans();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete van');
    }
  }

  async function generateDescription() {
    if (!formData.name || !formData.type) return;
    setGenerating(true);
    try {
      const res = await client.post('/ai/generate-description', {
        vanName: formData.name,
        vanType: formData.type,
        capacity: formData.capacity,
      });
      setFormData(prev => ({ ...prev, description: res.data.description }));
    } catch {
      setError('Failed to generate description');
    } finally {
      setGenerating(false);
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
    addBtn: {
      padding: '0.75rem 1.5rem', background: COLORS.accent, color: COLORS.white,
      border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer',
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
    actionBtn: {
      padding: '0.4rem 0.75rem', border: 'none', borderRadius: 6, cursor: 'pointer',
      fontSize: '0.8rem', fontWeight: 500, marginRight: '0.5rem',
    },
    editBtn: { background: '#dbeafe', color: '#1d4ed8' },
    deleteBtn: { background: '#fef2f2', color: COLORS.error },
    modal: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000, padding: '1rem',
    },
    modalContent: {
      background: COLORS.white, borderRadius: 20, padding: '2rem',
      maxWidth: 500, width: '100%', maxHeight: '90vh', overflowY: 'auto',
    },
    modalTitle: { fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' },
    formGroup: { marginBottom: '1rem' },
    label: { display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.9rem' },
    input: {
      width: '100%', padding: '0.75rem', border: `2px solid ${COLORS.border}`,
      borderRadius: 10, fontSize: '0.95rem', boxSizing: 'border-box',
    },
    select: {
      width: '100%', padding: '0.75rem', border: `2px solid ${COLORS.border}`,
      borderRadius: 10, fontSize: '0.95rem', background: COLORS.white,
    },
    textarea: {
      width: '100%', padding: '0.75rem', border: `2px solid ${COLORS.border}`,
      borderRadius: 10, fontSize: '0.95rem', minHeight: 100, resize: 'vertical',
      boxSizing: 'border-box',
    },
    generateBtn: {
      padding: '0.5rem 1rem', background: COLORS.light, border: `1px solid ${COLORS.border}`,
      borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem', marginTop: '0.5rem',
    },
    modalActions: { display: 'flex', gap: '0.75rem', marginTop: '1.5rem' },
    cancelBtn: {
      flex: 1, padding: '0.75rem', background: COLORS.light, border: 'none',
      borderRadius: 10, cursor: 'pointer', fontWeight: 500,
    },
    saveBtn: {
      flex: 1, padding: '0.75rem', background: COLORS.accent, color: COLORS.white,
      border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600,
    },
    errorBox: {
      padding: '1rem', background: '#fef2f2', color: COLORS.error,
      borderRadius: 10, marginBottom: '1rem', fontSize: '0.9rem',
    },
  };

  const typeColors = {
    Passenger: { background: '#dbeafe', color: '#1d4ed8' },
    Cargo: { background: '#fef3c7', color: '#92400e' },
    Camper: { background: '#d1fae5', color: '#065f46' },
  };

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h1 style={s.title}>Manage Vans</h1>
        <nav style={s.nav}>
          <Link to="/admin" style={s.navLink}>Dashboard</Link>
          <Link to="/admin/vans" style={{ ...s.navLink, ...s.navLinkActive }}>Vans</Link>
          <Link to="/admin/users" style={s.navLink}>Users</Link>
          <Link to="/admin/bookings" style={s.navLink}>Bookings</Link>
          <Link to="/admin/settings" style={s.navLink}>Settings</Link>
        </nav>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <button style={s.addBtn} onClick={() => openModal()}>+ Add New Van</button>
      </div>

      {error && <div style={s.errorBox}>{error}</div>}

      <div style={s.card}>
        {loading ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: COLORS.muted }}>Loading...</p>
        ) : vans.length === 0 ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: COLORS.muted }}>No vans found</p>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Van</th>
                <th style={s.th}>Type</th>
                <th style={s.th}>Capacity</th>
                <th style={s.th}>Price/Day</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vans.map(van => (
                <tr key={van.id}>
                  <td style={s.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={van.image_url || DEFAULT_VAN_IMAGE}
                        alt={van.name}
                        style={s.vanImg}
                        onError={(e) => { e.target.src = DEFAULT_VAN_IMAGE; }}
                      />
                      <span style={{ fontWeight: 500 }}>{van.name}</span>
                    </div>
                  </td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, ...typeColors[van.type] }}>{van.type}</span>
                  </td>
                  <td style={s.td}>{van.capacity} seats</td>
                  <td style={s.td}>${Number(van.price_per_day).toFixed(2)}</td>
                  <td style={s.td}>
                    <button style={{ ...s.actionBtn, ...s.editBtn }} onClick={() => openModal(van)}>Edit</button>
                    <button style={{ ...s.actionBtn, ...s.deleteBtn }} onClick={() => handleDelete(van.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={s.modal} onClick={() => setShowModal(false)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <h2 style={s.modalTitle}>{editingVan ? 'Edit Van' : 'Add New Van'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={s.formGroup}>
                <label style={s.label}>Name</label>
                <input
                  style={s.input}
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Type</label>
                <select
                  style={s.select}
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="Passenger">Passenger</option>
                  <option value="Cargo">Cargo</option>
                  <option value="Camper">Camper</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={s.formGroup}>
                  <label style={s.label}>Capacity</label>
                  <input
                    style={s.input}
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                    required
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Price/Day ($)</label>
                  <input
                    style={s.input}
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price_per_day}
                    onChange={e => setFormData({ ...formData, price_per_day: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Image URL</label>
                <input
                  style={s.input}
                  value={formData.image_url}
                  onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Description</label>
                <textarea
                  style={s.textarea}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
                <button
                  type="button"
                  style={s.generateBtn}
                  onClick={generateDescription}
                  disabled={generating || !formData.name}
                >
                  {generating ? 'Generating...' : '✨ Generate with AI'}
                </button>
              </div>
              <div style={s.modalActions}>
                <button type="button" style={s.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" style={s.saveBtn} disabled={saving}>
                  {saving ? 'Saving...' : (editingVan ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
