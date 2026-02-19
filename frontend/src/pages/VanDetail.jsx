import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';

export default function VanDetail() {
  const { id } = useParams();
  const [van, setVan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchVan() {
      try {
        const res = await client.get(`/vans/${id}`);
        setVan(res.data);
      } catch (err) {
        setError(err.response?.status === 404 ? 'Van not found.' : 'Failed to load van details.');
      } finally {
        setLoading(false);
      }
    }
    fetchVan();
  }, [id]);

  const typeColors = {
    Passenger: { background: '#dbeafe', color: '#1d4ed8' },
    Cargo: { background: '#fef3c7', color: '#92400e' },
    Camper: { background: '#d1fae5', color: '#065f46' },
  };

  const s = {
    container: { maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' },
    backLink: { color: '#2563eb', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 },
    card: {
      marginTop: '1rem', borderRadius: 14, overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)', background: '#fff',
    },
    image: { width: '100%', height: 360, objectFit: 'cover', background: '#eee' },
    body: { padding: '1.5rem 2rem' },
    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' },
    name: { fontSize: '1.6rem', fontWeight: 700, margin: 0 },
    badge: {
      display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: 20,
      fontSize: '0.8rem', fontWeight: 600,
    },
    price: { fontSize: '1.5rem', fontWeight: 700, color: '#2563eb' },
    perDay: { fontSize: '0.85rem', color: '#888', fontWeight: 400 },
    desc: { margin: '1.25rem 0', color: '#444', lineHeight: 1.6, fontSize: '0.95rem' },
    specsTitle: { fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem', color: '#333' },
    specsGrid: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '0.6rem',
    },
    specItem: {
      display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.9rem',
      background: '#f8f9fa', borderRadius: 8, fontSize: '0.88rem',
    },
    specLabel: { color: '#666', textTransform: 'capitalize' },
    specValue: { fontWeight: 600, color: '#1e293b' },
    infoRow: {
      display: 'flex', gap: '2rem', marginTop: '1.25rem', paddingTop: '1.25rem',
      borderTop: '1px solid #f0f0f0', flexWrap: 'wrap',
    },
    infoItem: { display: 'flex', flexDirection: 'column', gap: '0.2rem' },
    infoLabel: { fontSize: '0.78rem', color: '#888', fontWeight: 500 },
    infoValue: { fontSize: '1rem', fontWeight: 600, color: '#1e293b' },
    actions: {
      display: 'flex', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.25rem',
      borderTop: '1px solid #f0f0f0',
    },
    bookBtn: {
      display: 'inline-block', padding: '0.75rem 2rem', background: '#2563eb',
      color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: '1rem',
      fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'background 0.2s',
    },
    backBtn: {
      display: 'inline-block', padding: '0.75rem 2rem', background: '#f1f5f9',
      color: '#475569', borderRadius: 8, textDecoration: 'none', fontSize: '1rem',
      fontWeight: 500,
    },
    center: { textAlign: 'center', padding: '4rem 1rem', color: '#888' },
    errorBox: { textAlign: 'center', padding: '4rem 1rem', color: '#b91c1c' },
  };

  if (loading) return <div style={s.center}>Loading van details...</div>;
  if (error) return <div style={s.errorBox}><p style={{ fontSize: '1.2rem' }}>{error}</p><Link to="/vans" style={s.backLink}>Back to vans</Link></div>;
  if (!van) return null;

  const specs = typeof van.specs_json === 'string' ? JSON.parse(van.specs_json) : (van.specs_json || {});
  const colors = typeColors[van.type] || { background: '#f3f4f6', color: '#374151' };

  return (
    <div style={s.container}>
      <Link to="/vans" style={s.backLink}>&larr; Back to all vans</Link>

      <div style={s.card}>
        <img
          src={van.image_url || 'https://via.placeholder.com/900x360?text=Van'}
          alt={van.name}
          style={s.image}
        />

        <div style={s.body}>
          <div style={s.topRow}>
            <div>
              <span style={{ ...s.badge, ...colors }}>{van.type}</span>
              <h1 style={s.name}>{van.name}</h1>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={s.price}>
                ${Number(van.price_per_day).toFixed(2)} <span style={s.perDay}>/ day</span>
              </div>
            </div>
          </div>

          {van.description && <p style={s.desc}>{van.description}</p>}

          <div style={s.infoRow}>
            <div style={s.infoItem}>
              <span style={s.infoLabel}>Capacity</span>
              <span style={s.infoValue}>{van.capacity} {van.capacity === 1 ? 'person' : 'people'}</span>
            </div>
            <div style={s.infoItem}>
              <span style={s.infoLabel}>Type</span>
              <span style={s.infoValue}>{van.type}</span>
            </div>
            <div style={s.infoItem}>
              <span style={s.infoLabel}>Daily Rate</span>
              <span style={s.infoValue}>${Number(van.price_per_day).toFixed(2)}</span>
            </div>
          </div>

          {Object.keys(specs).length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={s.specsTitle}>Specifications</h3>
              <div style={s.specsGrid}>
                {Object.entries(specs).map(([key, value]) => (
                  <div key={key} style={s.specItem}>
                    <span style={s.specLabel}>{key.replace(/_/g, ' ')}</span>
                    <span style={s.specValue}>{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={s.actions}>
            <Link to={`/book/${van.id}`} style={s.bookBtn}>Book This Van</Link>
            <Link to="/vans" style={s.backBtn}>Browse Other Vans</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
