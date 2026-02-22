import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import RecommendedVans from '../components/RecommendedVans';

const COLORS = {
  primary: '#0f172a',
  accent: '#3b82f6',
  accentLight: '#60a5fa',
  success: '#10b981',
  light: '#f8fafc',
  white: '#ffffff',
  muted: '#64748b',
  border: '#e2e8f0',
};

export default function VanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
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
    container: { maxWidth: 1100, margin: '0 auto', padding: '2rem 1rem' },
    breadcrumb: {
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      marginBottom: '1.5rem', fontSize: '0.9rem', color: COLORS.muted,
    },
    breadcrumbLink: { color: COLORS.accent, textDecoration: 'none', fontWeight: 500 },
    mainGrid: {
      display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem',
      alignItems: 'start',
    },
    imageContainer: {
      borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
    },
    image: { width: '100%', height: 420, objectFit: 'cover', display: 'block' },
    sidebar: {
      background: COLORS.white, borderRadius: 20, padding: '1.75rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)', position: 'sticky', top: '2rem',
    },
    badge: {
      display: 'inline-block', padding: '0.35rem 0.9rem', borderRadius: 20,
      fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem',
    },
    name: { fontSize: '1.5rem', fontWeight: 700, color: COLORS.primary, margin: '0 0 0.5rem' },
    rating: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' },
    stars: { color: '#f59e0b', fontSize: '1rem' },
    ratingText: { fontSize: '0.85rem', color: COLORS.muted },
    priceBox: {
      background: COLORS.light, borderRadius: 12, padding: '1.25rem',
      marginBottom: '1.5rem', textAlign: 'center',
    },
    price: { fontSize: '2rem', fontWeight: 800, color: COLORS.primary },
    perDay: { fontSize: '1rem', color: COLORS.muted, fontWeight: 400 },
    bookBtn: {
      display: 'block', width: '100%', padding: '1rem', background: COLORS.accent,
      color: COLORS.white, border: 'none', borderRadius: 12, fontSize: '1.1rem',
      fontWeight: 700, cursor: 'pointer', textAlign: 'center', textDecoration: 'none',
      transition: 'background 0.2s, transform 0.2s',
    },
    features: {
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem',
      marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: `1px solid ${COLORS.border}`,
    },
    feature: {
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      fontSize: '0.9rem', color: COLORS.primary,
    },
    featureIcon: { color: COLORS.success, fontSize: '1rem' },
    detailsSection: { marginTop: '2rem' },
    sectionTitle: {
      fontSize: '1.25rem', fontWeight: 700, color: COLORS.primary,
      marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
    },
    description: {
      color: COLORS.muted, lineHeight: 1.8, fontSize: '1rem',
      background: COLORS.white, padding: '1.5rem', borderRadius: 16,
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    },
    specsGrid: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      gap: '1rem', background: COLORS.white, padding: '1.5rem', borderRadius: 16,
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    },
    specItem: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0.75rem 1rem', background: COLORS.light, borderRadius: 10,
    },
    specLabel: { color: COLORS.muted, fontSize: '0.9rem', textTransform: 'capitalize' },
    specValue: { fontWeight: 600, color: COLORS.primary, fontSize: '0.95rem' },
    center: {
      textAlign: 'center', padding: '4rem 1rem', color: COLORS.muted,
      background: COLORS.white, borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    },
    errorBox: {
      textAlign: 'center', padding: '4rem 1rem', background: COLORS.white,
      borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    },
    errorTitle: { fontSize: '1.25rem', color: '#dc2626', marginBottom: '1rem' },
  };

  if (loading) {
    return (
      <div style={s.container}>
        <div style={s.center}>
          <p style={{ fontSize: '1.1rem' }}>Loading van details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={s.container}>
        <div style={s.errorBox}>
          <p style={s.errorTitle}>{error}</p>
          <Link to="/vans" style={{ ...s.bookBtn, display: 'inline-block', width: 'auto', padding: '0.75rem 2rem' }}>
            Browse All Vans
          </Link>
        </div>
      </div>
    );
  }

  if (!van) return null;

  const specs = typeof van.specs_json === 'string' ? JSON.parse(van.specs_json) : (van.specs_json || {});
  const colors = typeColors[van.type] || { background: '#f3f4f6', color: '#374151' };

  const quickFeatures = [
    { icon: '👥', label: `${van.capacity} seats` },
    { icon: '✓', label: 'Insured' },
    { icon: '🔄', label: 'Free cancellation' },
    { icon: '📍', label: 'GPS included' },
  ];

  return (
    <div style={s.container}>
      <div style={s.breadcrumb}>
        <Link to="/" style={s.breadcrumbLink}>Home</Link>
        <span>/</span>
        <Link to="/vans" style={s.breadcrumbLink}>Vans</Link>
        <span>/</span>
        <span>{van.name}</span>
      </div>

      <div style={s.mainGrid}>
        <div>
          <div style={s.imageContainer}>
            <img
              src={van.image_url || 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800'}
              alt={van.name}
              style={s.image}
            />
          </div>

          <div style={s.detailsSection}>
            {van.description && (
              <>
                <h2 style={s.sectionTitle}>About This Van</h2>
                <p style={s.description}>{van.description}</p>
              </>
            )}

            {Object.keys(specs).length > 0 && (
              <div style={{ marginTop: '2rem' }}>
                <h2 style={s.sectionTitle}>Specifications</h2>
                <div style={s.specsGrid}>
                  {Object.entries(specs).map(([key, value]) => (
                    <div key={key} style={s.specItem}>
                      <span style={s.specLabel}>{key.replace(/_/g, ' ')}</span>
                      <span style={s.specValue}>
                        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={s.sidebar}>
          <span style={{ ...s.badge, ...colors }}>{van.type}</span>
          <h1 style={s.name}>{van.name}</h1>
          <div style={s.rating}>
            <span style={s.stars}>★★★★★</span>
            <span style={s.ratingText}>4.9 (128 reviews)</span>
          </div>

          <div style={s.priceBox}>
            <span style={s.price}>${Number(van.price_per_day).toFixed(2)}</span>
            <span style={s.perDay}> / day</span>
          </div>

          <Link to={`/book/${van.id}`} style={s.bookBtn}>
            Book Now
          </Link>

          <div style={s.features}>
            {quickFeatures.map((f, i) => (
              <div key={i} style={s.feature}>
                <span style={s.featureIcon}>{f.icon}</span>
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <RecommendedVans title="Similar Vans You Might Like" limit={4} />
    </div>
  );
}
