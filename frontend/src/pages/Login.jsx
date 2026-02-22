import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const COLORS = {
  primary: '#0f172a',
  accent: '#3b82f6',
  accentLight: '#60a5fa',
  light: '#f8fafc',
  white: '#ffffff',
  muted: '#64748b',
  border: '#e2e8f0',
  error: '#dc2626',
  gradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3b82f6 100%)',
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await client.post('/auth/login', { email, password });
      login(data.user, data.token);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const s = {
    container: {
      minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1rem',
    },
    card: {
      width: '100%', maxWidth: 420, background: COLORS.white, borderRadius: 24,
      boxShadow: '0 10px 40px rgba(0,0,0,0.08)', padding: '2.5rem',
    },
    logo: {
      textAlign: 'center', marginBottom: '2rem',
    },
    logoText: {
      fontSize: '1.75rem', fontWeight: 800, color: COLORS.primary,
    },
    logoAccent: { color: COLORS.accent },
    title: {
      fontSize: '1.5rem', fontWeight: 700, color: COLORS.primary,
      textAlign: 'center', marginBottom: '0.5rem',
    },
    subtitle: {
      color: COLORS.muted, textAlign: 'center', marginBottom: '2rem', fontSize: '0.95rem',
    },
    form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
    label: {
      fontSize: '0.85rem', fontWeight: 600, color: COLORS.primary,
    },
    input: {
      padding: '0.85rem 1rem', border: `2px solid ${COLORS.border}`, borderRadius: 12,
      fontSize: '1rem', transition: 'border-color 0.2s, box-shadow 0.2s',
      outline: 'none',
    },
    inputFocus: { borderColor: COLORS.accent, boxShadow: '0 0 0 3px rgba(59,130,246,0.1)' },
    errorBox: {
      padding: '0.75rem 1rem', background: '#fef2f2', color: COLORS.error,
      borderRadius: 10, fontSize: '0.9rem', textAlign: 'center',
    },
    submitBtn: {
      padding: '1rem', background: COLORS.accent, color: COLORS.white,
      border: 'none', borderRadius: 12, fontSize: '1rem', fontWeight: 600,
      cursor: 'pointer', transition: 'background 0.2s, transform 0.2s',
      marginTop: '0.5rem',
    },
    submitBtnDisabled: { opacity: 0.7, cursor: 'not-allowed' },
    divider: {
      display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0',
      color: COLORS.muted, fontSize: '0.85rem',
    },
    dividerLine: { flex: 1, height: 1, background: COLORS.border },
    footer: {
      textAlign: 'center', marginTop: '1.5rem', color: COLORS.muted, fontSize: '0.95rem',
    },
    link: { color: COLORS.accent, fontWeight: 600, textDecoration: 'none' },
  };

  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={s.logo}>
          <span style={s.logoText}>Rentel<span style={s.logoAccent}>.</span></span>
        </div>
        <h1 style={s.title}>Welcome back</h1>
        <p style={s.subtitle}>Sign in to your account to continue</p>

        <form onSubmit={handleSubmit} style={s.form}>
          {error && <div style={s.errorBox}>{error}</div>}

          <div style={s.inputGroup}>
            <label style={s.label}>Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={s.input}
            />
          </div>

          <div style={s.inputGroup}>
            <label style={s.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              style={s.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...s.submitBtn, ...(loading ? s.submitBtnDisabled : {}) }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={s.divider}>
          <span style={s.dividerLine} />
          <span>or</span>
          <span style={s.dividerLine} />
        </div>

        <p style={s.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={s.link}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
