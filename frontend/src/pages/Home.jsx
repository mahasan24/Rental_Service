import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div>
      <h1 style={{ marginBottom: '0.5rem' }}>Welcome to Rentel Service.com</h1>
      <p style={{ color: '#555', marginBottom: '1.5rem' }}>
        Book rental vans online. View our fleet and get smart recommendations for your needs.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link
          to="/vans"
          style={{
            background: '#1e3a5f',
            color: 'white',
            padding: '0.75rem 1.25rem',
            borderRadius: '6px',
            fontWeight: '600',
          }}
        >
          Browse Vans
        </Link>
        <Link
          to="/login"
          style={{
            background: 'transparent',
            color: '#1e3a5f',
            padding: '0.75rem 1.25rem',
            borderRadius: '6px',
            border: '2px solid #1e3a5f',
            fontWeight: '600',
          }}
        >
          Login
        </Link>
      </div>
    </div>
  );
}
