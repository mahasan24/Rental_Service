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

export default function AdminSettings() {
  const { isAuthenticated } = useAuth();
  const [settings, setSettings] = useState({
    site_name: 'Rentel',
    site_description: 'Your trusted partner for van rentals',
    contact_email: 'help@rentel.com',
    contact_phone: '1-800-RENTEL',
    gemini_api_key: '',
    cancellation_hours: '24',
    min_booking_days: '1',
    max_booking_days: '30',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (isAuthenticated) fetchSettings();
  }, [isAuthenticated]);

  async function fetchSettings() {
    try {
      const res = await client.get('/admin/settings');
      setSettings(prev => ({ ...prev, ...res.data, gemini_api_key: '' }));
    } catch (err) {
      if (err.response?.status !== 403) {
        setError(err.response?.data?.error || 'Failed to load settings');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = { ...settings };
      if (!payload.gemini_api_key) {
        delete payload.gemini_api_key;
      }
      await client.put('/admin/settings', payload);
      setSuccess('Settings saved successfully!');
      setSettings(prev => ({ ...prev, gemini_api_key: '' }));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
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
    grid: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '1.5rem',
    },
    card: {
      background: COLORS.white, borderRadius: 16, padding: '1.5rem',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    },
    cardTitle: {
      fontSize: '1.1rem', fontWeight: 600, color: COLORS.primary,
      marginBottom: '1.25rem', paddingBottom: '0.75rem',
      borderBottom: `1px solid ${COLORS.border}`,
    },
    formGroup: { marginBottom: '1.25rem' },
    label: {
      display: 'block', marginBottom: '0.4rem', fontWeight: 500,
      fontSize: '0.9rem', color: COLORS.primary,
    },
    labelHint: { fontWeight: 400, color: COLORS.muted, fontSize: '0.8rem' },
    input: {
      width: '100%', padding: '0.75rem', border: `2px solid ${COLORS.border}`,
      borderRadius: 10, fontSize: '0.95rem', boxSizing: 'border-box',
      transition: 'border-color 0.2s',
    },
    inputPassword: { paddingRight: '3rem' },
    inputWrapper: { position: 'relative' },
    toggleBtn: {
      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
      background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem',
      color: COLORS.muted,
    },
    textarea: {
      width: '100%', padding: '0.75rem', border: `2px solid ${COLORS.border}`,
      borderRadius: 10, fontSize: '0.95rem', minHeight: 80, resize: 'vertical',
      boxSizing: 'border-box',
    },
    saveBtn: {
      padding: '0.85rem 2rem', background: COLORS.accent, color: COLORS.white,
      border: 'none', borderRadius: 10, fontWeight: 600, fontSize: '1rem',
      cursor: 'pointer', transition: 'background 0.2s',
    },
    errorBox: {
      padding: '1rem', background: '#fef2f2', color: COLORS.error,
      borderRadius: 10, marginBottom: '1rem', fontSize: '0.9rem',
    },
    successBox: {
      padding: '1rem', background: '#d1fae5', color: '#065f46',
      borderRadius: 10, marginBottom: '1rem', fontSize: '0.9rem',
    },
    infoBox: {
      padding: '1rem', background: '#dbeafe', color: '#1d4ed8',
      borderRadius: 10, marginBottom: '1rem', fontSize: '0.85rem',
    },
    statusIndicator: {
      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
      padding: '0.5rem 1rem', borderRadius: 8, fontSize: '0.85rem', fontWeight: 500,
    },
    statusActive: { background: '#d1fae5', color: '#065f46' },
    statusInactive: { background: '#fef3c7', color: '#92400e' },
  };

  if (loading) {
    return (
      <div style={s.container}>
        <div style={{ textAlign: 'center', padding: '4rem', color: COLORS.muted }}>
          Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h1 style={s.title}>Settings</h1>
        <nav style={s.nav}>
          <Link to="/admin" style={s.navLink}>Dashboard</Link>
          <Link to="/admin/vans" style={s.navLink}>Vans</Link>
          <Link to="/admin/users" style={s.navLink}>Users</Link>
          <Link to="/admin/bookings" style={s.navLink}>Bookings</Link>
          <Link to="/admin/settings" style={{ ...s.navLink, ...s.navLinkActive }}>Settings</Link>
        </nav>
      </div>

      {error && <div style={s.errorBox}>{error}</div>}
      {success && <div style={s.successBox}>{success}</div>}

      <form onSubmit={handleSubmit}>
        <div style={s.grid}>
          <div style={s.card}>
            <h2 style={s.cardTitle}>🏢 Site Information</h2>
            <div style={s.formGroup}>
              <label style={s.label}>Site Name</label>
              <input
                style={s.input}
                value={settings.site_name}
                onChange={e => setSettings({ ...settings, site_name: e.target.value })}
              />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Site Description</label>
              <textarea
                style={s.textarea}
                value={settings.site_description}
                onChange={e => setSettings({ ...settings, site_description: e.target.value })}
              />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Contact Email</label>
              <input
                style={s.input}
                type="email"
                value={settings.contact_email}
                onChange={e => setSettings({ ...settings, contact_email: e.target.value })}
              />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Contact Phone</label>
              <input
                style={s.input}
                value={settings.contact_phone}
                onChange={e => setSettings({ ...settings, contact_phone: e.target.value })}
              />
            </div>
          </div>

          <div style={s.card}>
            <h2 style={s.cardTitle}>🤖 AI Configuration (Google Gemini)</h2>
            <div style={s.infoBox}>
              Configure your Google Gemini API key to enable AI-powered features like the chat assistant and van description generation.
              Get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: '#1d4ed8' }}>Google AI Studio</a>.
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>
                Gemini API Key
                <span style={s.labelHint}> (leave empty to keep current)</span>
              </label>
              <div style={s.inputWrapper}>
                <input
                  style={{ ...s.input, ...s.inputPassword }}
                  type={showApiKey ? 'text' : 'password'}
                  value={settings.gemini_api_key}
                  onChange={e => setSettings({ ...settings, gemini_api_key: e.target.value })}
                  placeholder="AIza..."
                />
                <button
                  type="button"
                  style={s.toggleBtn}
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <span style={s.label}>Status: </span>
              <span style={{
                ...s.statusIndicator,
                ...(settings.gemini_key_configured ? s.statusActive : s.statusInactive),
              }}>
                {settings.gemini_key_configured ? '● API Key Configured' : '○ Not Configured'}
              </span>
            </div>
          </div>

          <div style={s.card}>
            <h2 style={s.cardTitle}>📋 Booking Rules</h2>
            <div style={s.formGroup}>
              <label style={s.label}>
                Free Cancellation Hours
                <span style={s.labelHint}> (hours before pickup)</span>
              </label>
              <input
                style={s.input}
                type="number"
                min="0"
                value={settings.cancellation_hours}
                onChange={e => setSettings({ ...settings, cancellation_hours: e.target.value })}
              />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Minimum Booking Days</label>
              <input
                style={s.input}
                type="number"
                min="1"
                value={settings.min_booking_days}
                onChange={e => setSettings({ ...settings, min_booking_days: e.target.value })}
              />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Maximum Booking Days</label>
              <input
                style={s.input}
                type="number"
                min="1"
                value={settings.max_booking_days}
                onChange={e => setSettings({ ...settings, max_booking_days: e.target.value })}
              />
            </div>
          </div>

          <div style={s.card}>
            <h2 style={s.cardTitle}>💳 Payment Settings</h2>
            <div style={s.infoBox}>
              Payment gateway integration coming soon. Currently all bookings are processed manually.
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>
                Stripe API Key
                <span style={s.labelHint}> (coming soon)</span>
              </label>
              <input
                style={{ ...s.input, background: COLORS.light }}
                type="password"
                placeholder="sk_live_..."
                disabled
              />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>
                PayPal Client ID
                <span style={s.labelHint}> (coming soon)</span>
              </label>
              <input
                style={{ ...s.input, background: COLORS.light }}
                type="text"
                placeholder="Client ID..."
                disabled
              />
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button type="submit" style={s.saveBtn} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
