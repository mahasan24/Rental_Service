import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        background: '#1e3a5f',
        color: 'white',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link to="/" style={{ color: 'white', fontWeight: 'bold', fontSize: '1.25rem' }}>
          Rentel Service.com
        </Link>
        <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/vans" style={{ color: 'rgba(255,255,255,0.9)' }}>Vans</Link>
          {user ? (
            <>
              <Link to="/bookings" style={{ color: 'rgba(255,255,255,0.9)' }}>My Bookings</Link>
              <span style={{ fontSize: '0.9rem' }}>{user.name || user.email}</span>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  background: 'transparent',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.6)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '4px',
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'rgba(255,255,255,0.9)' }}>Login</Link>
              <Link to="/register" style={{ color: 'rgba(255,255,255,0.9)' }}>Sign up</Link>
            </>
          )}
        </nav>
      </header>
      <main style={{ flex: 1, padding: '1.5rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {children}
      </main>
    </div>
  );
}
