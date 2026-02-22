import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';

const COLORS = {
  primary: '#0f172a',
  accent: '#3b82f6',
  accentLight: '#60a5fa',
  light: '#f8fafc',
  white: '#ffffff',
  muted: '#64748b',
};

const TYPE_COLORS = {
  Passenger: { background: '#dbeafe', color: '#1d4ed8' },
  Cargo: { background: '#fef3c7', color: '#92400e' },
  Camper: { background: '#d1fae5', color: '#065f46' },
};

export default function RecommendedVans({ needText, title = 'Recommended Vans', limit = 4 }) {
  const [vans, setVans] = useState([]);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [needText]);

  async function fetchRecommendations() {
    setLoading(true);
    try {
      let res;
      if (needText) {
        res = await client.post('/recommendations', { need: needText });
      } else {
        res = await client.get('/recommendations/personalized');
      }
      setVans(res.data.vans?.slice(0, limit) || []);
      setReason(res.data.reason || '');
    } catch {
      setVans([]);
    } finally {
      setLoading(false);
    }
  }

  const s = {
    container: { marginTop: '2rem' },
    header: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: '1rem',
    },
    title: { fontSize: '1.25rem', fontWeight: 700, color: COLORS.primary },
    reason: { fontSize: '0.9rem', color: COLORS.muted, marginBottom: '1rem' },
    grid: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
      gap: '1.25rem',
    },
    card: {
      background: COLORS.white, borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'transform 0.2s, box-shadow 0.2s',
    },
    cardHover: { transform: 'translateY(-4px)', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' },
    img: { width: '100%', height: 140, objectFit: 'cover' },
    body: { padding: '1rem' },
    type: {
      display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: 12,
      fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.4rem',
    },
    name: { fontSize: '1rem', fontWeight: 600, color: COLORS.primary, margin: '0.25rem 0' },
    meta: { fontSize: '0.85rem', color: COLORS.muted },
    price: { color: COLORS.accent, fontWeight: 700, fontSize: '1rem', marginTop: '0.5rem' },
    viewAll: {
      display: 'inline-block', marginTop: '1.5rem', color: COLORS.accent,
      fontWeight: 600, fontSize: '0.95rem',
    },
    loading: { textAlign: 'center', padding: '2rem', color: COLORS.muted },
    empty: { textAlign: 'center', padding: '2rem', color: COLORS.muted },
  };

  if (loading) {
    return <div style={s.loading}>Finding recommendations...</div>;
  }

  if (vans.length === 0) {
    return null;
  }

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h3 style={s.title}>{title}</h3>
      </div>
      {reason && <p style={s.reason}>{reason}</p>}
      <div style={s.grid}>
        {vans.map(van => (
          <VanCard key={van.id} van={van} s={s} />
        ))}
      </div>
      <Link to="/vans" style={s.viewAll}>View all vans →</Link>
    </div>
  );
}

function VanCard({ van, s }) {
  const [hovered, setHovered] = useState(false);
  const typeStyle = TYPE_COLORS[van.type] || { background: '#f3f4f6', color: '#374151' };

  return (
    <Link
      to={`/vans/${van.id}`}
      style={{ textDecoration: 'none' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ ...s.card, ...(hovered ? s.cardHover : {}) }}>
        <img
          src={van.image_url || 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=400'}
          alt={van.name}
          style={s.img}
        />
        <div style={s.body}>
          <span style={{ ...s.type, ...typeStyle }}>{van.type}</span>
          <h4 style={s.name}>{van.name}</h4>
          <p style={s.meta}>{van.capacity} seats</p>
          <p style={s.price}>${Number(van.price_per_day).toFixed(2)}/day</p>
        </div>
      </div>
    </Link>
  );
}
