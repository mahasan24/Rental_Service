import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const COLORS = {
  primary: '#0f172a',
  accent: '#3b82f6',
  white: '#ffffff',
  muted: '#64748b',
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isHome = location.pathname === '/';

  const s = {
    wrapper: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#f8fafc',
    },
    header: {
      background: COLORS.primary,
      color: COLORS.white,
      padding: '1rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    },
    logo: {
      color: COLORS.white,
      fontWeight: 800,
      fontSize: '1.4rem',
      textDecoration: 'none',
      letterSpacing: '-0.02em',
    },
    nav: { display: 'flex', gap: '1.5rem', alignItems: 'center' },
    navLink: {
      color: 'rgba(255,255,255,0.85)',
      textDecoration: 'none',
      fontWeight: 500,
      fontSize: '0.95rem',
      transition: 'color 0.2s',
    },
    userInfo: {
      display: 'flex', alignItems: 'center', gap: '1rem',
      padding: '0.4rem 0.75rem', background: 'rgba(255,255,255,0.1)',
      borderRadius: 8,
    },
    userName: { fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' },
    logoutBtn: {
      background: 'transparent',
      color: 'rgba(255,255,255,0.9)',
      border: '1px solid rgba(255,255,255,0.3)',
      padding: '0.4rem 0.9rem',
      borderRadius: 6,
      cursor: 'pointer',
      fontWeight: 500,
      fontSize: '0.85rem',
      transition: 'all 0.2s',
    },
    authBtns: { display: 'flex', gap: '0.75rem' },
    loginBtn: {
      color: COLORS.white,
      textDecoration: 'none',
      fontWeight: 500,
      padding: '0.5rem 1rem',
    },
    signupBtn: {
      background: COLORS.accent,
      color: COLORS.white,
      textDecoration: 'none',
      fontWeight: 600,
      padding: '0.5rem 1.25rem',
      borderRadius: 8,
      fontSize: '0.9rem',
    },
    main: {
      flex: 1,
      padding: isHome ? '0' : '1.5rem',
      maxWidth: isHome ? '100%' : '1400px',
      margin: '0 auto',
      width: '100%',
    },
    footer: {
      background: COLORS.primary,
      color: 'rgba(255,255,255,0.7)',
      padding: '3rem 2rem',
      marginTop: 'auto',
    },
    footerInner: {
      maxWidth: 1200,
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '2rem',
    },
    footerCol: { minWidth: 150 },
    footerTitle: { color: COLORS.white, fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' },
    footerLink: {
      display: 'block', color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
      marginBottom: '0.5rem', fontSize: '0.9rem', transition: 'color 0.2s',
    },
    footerBottom: {
      borderTop: '1px solid rgba(255,255,255,0.1)',
      marginTop: '2rem',
      paddingTop: '1.5rem',
      textAlign: 'center',
      fontSize: '0.85rem',
      color: 'rgba(255,255,255,0.5)',
    },
  };

  return (
    <div style={s.wrapper}>
      <header style={s.header}>
        <Link to="/" style={s.logo}>
          Rentel<span style={{ color: COLORS.accent }}>.</span>
        </Link>
        <nav style={s.nav}>
          <Link to="/vans" style={s.navLink}>Browse Vans</Link>
          <Link to="/help" style={s.navLink}>Get Help</Link>
          {user ? (
            <>
              <Link to="/bookings" style={s.navLink}>My Bookings</Link>
              <Link to="/profile" style={s.navLink}>Profile</Link>
              {user.role === 'admin' && (
                <Link to="/admin" style={{ ...s.navLink, color: COLORS.accent }}>Admin</Link>
              )}
              <div style={s.userInfo}>
                <span style={s.userName}>{user.name || user.email}</span>
                <button type="button" onClick={handleLogout} style={s.logoutBtn}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div style={s.authBtns}>
              <Link to="/login" style={s.loginBtn}>Login</Link>
              <Link to="/register" style={s.signupBtn}>Sign Up</Link>
            </div>
          )}
        </nav>
      </header>

      <main style={s.main}>
        {children}
      </main>

      <footer style={s.footer}>
        <div style={s.footerInner}>
          <div style={s.footerCol}>
            <div style={s.footerTitle}>Rentel</div>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.6)' }}>
              Your trusted partner for van rentals. Quality vehicles, transparent pricing, exceptional service.
            </p>
          </div>
          <div style={s.footerCol}>
            <div style={s.footerTitle}>Quick Links</div>
            <Link to="/vans" style={s.footerLink}>Browse Vans</Link>
            <Link to="/help" style={s.footerLink}>Get Help</Link>
            <Link to="/bookings" style={s.footerLink}>My Bookings</Link>
          </div>
          <div style={s.footerCol}>
            <div style={s.footerTitle}>Van Types</div>
            <Link to="/vans?type=Passenger" style={s.footerLink}>Passenger Vans</Link>
            <Link to="/vans?type=Cargo" style={s.footerLink}>Cargo Vans</Link>
            <Link to="/vans?type=Camper" style={s.footerLink}>Camper Vans</Link>
          </div>
          <div style={s.footerCol}>
            <div style={s.footerTitle}>Support</div>
            <span style={s.footerLink}>help@rentel.com</span>
            <span style={s.footerLink}>1-800-RENTEL</span>
            <span style={s.footerLink}>24/7 Customer Support</span>
          </div>
        </div>
        <div style={s.footerBottom}>
          © {new Date().getFullYear()} Rentel Service. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
