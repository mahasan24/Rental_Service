import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import client from '../api/client';

const COLORS = {
  primary: '#0f172a',
  secondary: '#1e293b',
  accent: '#3b82f6',
  accentLight: '#60a5fa',
  light: '#f8fafc',
  white: '#ffffff',
  muted: '#64748b',
  border: '#e2e8f0',
};

const DEFAULT_VAN_IMAGE = 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=400';

export default function VanList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vans, setVans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '');
  const [minCapacity, setMinCapacity] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortOption, setSortOption] = useState('price_asc');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchVans();
  }, [typeFilter, minCapacity, maxPrice, sortOption]);

  async function fetchVans() {
    setLoading(true);
    setError('');
    try {
      const parts = sortOption.split('_');
      const order = parts.pop();
      const sort = parts.join('_');
      const params = { sort, order };
      if (typeFilter) params.type = typeFilter;
      if (minCapacity) params.minCapacity = minCapacity;
      if (maxPrice) params.maxPrice = maxPrice;
      const res = await client.get('/vans', { params });
      setVans(res.data);
    } catch {
      setError('Failed to load vans. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function clearFilters() {
    setTypeFilter('');
    setMinCapacity('');
    setMaxPrice('');
    setSortOption('price_asc');
    setSearchParams({});
  }

  function handleTypeChange(type) {
    setTypeFilter(type);
    if (type) {
      setSearchParams({ type });
    } else {
      setSearchParams({});
    }
  }

  const s = {
    container: { maxWidth: 1200, margin: '0 auto', padding: '2rem 1rem' },
    header: { marginBottom: '2rem' },
    title: {
      fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 800,
      color: COLORS.primary, marginBottom: '0.5rem',
    },
    subtitle: { color: COLORS.muted, fontSize: '1.05rem' },
    filterSection: {
      display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end',
      padding: '1.5rem', background: COLORS.white, borderRadius: 16,
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: '2rem',
    },
    filterGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
    filterLabel: { fontSize: '0.8rem', fontWeight: 600, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px' },
    select: {
      padding: '0.65rem 1rem', border: `2px solid ${COLORS.border}`, borderRadius: 10,
      fontSize: '0.95rem', background: COLORS.white, minWidth: 150, cursor: 'pointer',
      transition: 'border-color 0.2s',
    },
    input: {
      padding: '0.65rem 1rem', border: `2px solid ${COLORS.border}`, borderRadius: 10,
      fontSize: '0.95rem', width: 120,
    },
    clearBtn: {
      padding: '0.65rem 1.25rem', background: COLORS.light, border: `2px solid ${COLORS.border}`,
      borderRadius: 10, cursor: 'pointer', fontSize: '0.9rem', color: COLORS.muted,
      fontWeight: 500, transition: 'all 0.2s',
    },
    viewToggle: {
      display: 'flex', gap: '0.5rem', marginLeft: 'auto',
    },
    viewBtn: {
      padding: '0.5rem 0.75rem', background: COLORS.light, border: 'none',
      borderRadius: 8, cursor: 'pointer', fontSize: '1rem',
    },
    viewBtnActive: { background: COLORS.accent, color: COLORS.white },
    resultsInfo: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: '1.5rem', color: COLORS.muted, fontSize: '0.95rem',
    },
    grid: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '1.5rem',
    },
    list: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    card: {
      background: COLORS.white, borderRadius: 20, overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)', transition: 'transform 0.3s, box-shadow 0.3s',
    },
    cardHover: { transform: 'translateY(-6px)', boxShadow: '0 12px 40px rgba(0,0,0,0.12)' },
    cardImg: { width: '100%', height: 200, objectFit: 'cover', background: '#eee' },
    cardBody: { padding: '1.25rem 1.5rem' },
    cardType: {
      display: 'inline-block', padding: '0.3rem 0.75rem', borderRadius: 20,
      fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem',
    },
    cardName: { fontSize: '1.2rem', fontWeight: 700, color: COLORS.primary, margin: '0.25rem 0' },
    cardDesc: { color: COLORS.muted, fontSize: '0.9rem', lineHeight: 1.5, margin: '0.75rem 0' },
    cardMeta: { display: 'flex', gap: '1rem', fontSize: '0.85rem', color: COLORS.muted },
    cardFooter: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '1rem 1.5rem', borderTop: `1px solid ${COLORS.border}`,
    },
    price: { fontSize: '1.25rem', fontWeight: 700, color: COLORS.accent },
    perDay: { fontSize: '0.85rem', color: COLORS.muted, fontWeight: 400 },
    viewBtn2: {
      padding: '0.65rem 1.5rem', background: COLORS.accent, color: COLORS.white,
      borderRadius: 10, textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600,
      transition: 'background 0.2s',
    },
    listCard: {
      display: 'flex', background: COLORS.white, borderRadius: 16,
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden',
      transition: 'box-shadow 0.2s',
    },
    listImg: { width: 200, height: 150, objectFit: 'cover', flexShrink: 0 },
    listBody: { flex: 1, padding: '1.25rem', display: 'flex', flexDirection: 'column' },
    listFooter: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto',
    },
    emptyState: {
      textAlign: 'center', padding: '4rem 2rem', background: COLORS.white,
      borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    },
    emptyIcon: { fontSize: '4rem', marginBottom: '1rem' },
    emptyTitle: { fontSize: '1.25rem', fontWeight: 600, color: COLORS.primary, marginBottom: '0.5rem' },
    emptyText: { color: COLORS.muted },
    errorBox: {
      padding: '1rem 1.5rem', background: '#fef2f2', color: '#dc2626', borderRadius: 12,
      marginBottom: '1.5rem', fontWeight: 500,
    },
    helpLink: {
      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
      padding: '0.75rem 1.5rem', background: COLORS.accent, color: COLORS.white,
      borderRadius: 10, textDecoration: 'none', fontWeight: 600, marginLeft: 'auto',
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
        <h1 style={s.title}>Browse Our Fleet</h1>
        <p style={s.subtitle}>Find the perfect van for your next adventure, move, or trip.</p>
      </div>

      <div style={s.filterSection}>
        <div style={s.filterGroup}>
          <label style={s.filterLabel}>Van Type</label>
          <select style={s.select} value={typeFilter} onChange={e => handleTypeChange(e.target.value)}>
            <option value="">All Types</option>
            <option value="Passenger">Passenger</option>
            <option value="Cargo">Cargo</option>
            <option value="Camper">Camper</option>
          </select>
        </div>
        <div style={s.filterGroup}>
          <label style={s.filterLabel}>Min Seats</label>
          <input style={s.input} type="number" min="1" placeholder="Any"
            value={minCapacity} onChange={e => setMinCapacity(e.target.value)} />
        </div>
        <div style={s.filterGroup}>
          <label style={s.filterLabel}>Max Price</label>
          <input style={s.input} type="number" min="0" step="10" placeholder="Any"
            value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
        </div>
        <div style={s.filterGroup}>
          <label style={s.filterLabel}>Sort By</label>
          <select style={s.select} value={sortOption} onChange={e => setSortOption(e.target.value)}>
            <option value="price_per_day_asc">Price: Low to High</option>
            <option value="price_per_day_desc">Price: High to Low</option>
            <option value="capacity_desc">Capacity: High to Low</option>
            <option value="capacity_asc">Capacity: Low to High</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
          </select>
        </div>
        <button style={s.clearBtn} onClick={clearFilters}>Clear All</button>
        <Link to="/help" style={s.helpLink}>
          Need help choosing?
        </Link>
      </div>

      {error && <div style={s.errorBox}>{error}</div>}

      <div style={s.resultsInfo}>
        <span>{loading ? 'Loading...' : `${vans.length} van${vans.length !== 1 ? 's' : ''} found`}</span>
        <div style={s.viewToggle}>
          <button
            style={{ ...s.viewBtn, ...(viewMode === 'grid' ? s.viewBtnActive : {}) }}
            onClick={() => setViewMode('grid')}
            title="Grid view"
          >
            ▦
          </button>
          <button
            style={{ ...s.viewBtn, ...(viewMode === 'list' ? s.viewBtnActive : {}) }}
            onClick={() => setViewMode('list')}
            title="List view"
          >
            ☰
          </button>
        </div>
      </div>

      {loading ? (
        <div style={s.emptyState}>
          <div style={s.emptyIcon}>🔍</div>
          <p style={s.emptyTitle}>Loading vans...</p>
        </div>
      ) : vans.length === 0 ? (
        <div style={s.emptyState}>
          <div style={s.emptyIcon}>🚐</div>
          <p style={s.emptyTitle}>No vans found</p>
          <p style={s.emptyText}>Try adjusting your filters or browse all vans.</p>
          <button style={{ ...s.clearBtn, marginTop: '1rem' }} onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={s.grid}>
          {vans.map(van => (
            <VanCardGrid key={van.id} van={van} s={s} typeColors={typeColors} />
          ))}
        </div>
      ) : (
        <div style={s.list}>
          {vans.map(van => (
            <VanCardList key={van.id} van={van} s={s} typeColors={typeColors} />
          ))}
        </div>
      )}
    </div>
  );
}

function VanCardGrid({ van, s, typeColors }) {
  const [hovered, setHovered] = useState(false);
  const colors = typeColors[van.type] || { background: '#f3f4f6', color: '#374151' };

  return (
    <div
      style={{ ...s.card, ...(hovered ? s.cardHover : {}) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={van.image_url || DEFAULT_VAN_IMAGE}
        alt={van.name}
        style={s.cardImg}
        onError={(e) => { e.target.src = DEFAULT_VAN_IMAGE; }}
      />
      <div style={s.cardBody}>
        <span style={{ ...s.cardType, ...colors }}>{van.type}</span>
        <h3 style={s.cardName}>{van.name}</h3>
        <p style={s.cardDesc}>
          {van.description ? van.description.slice(0, 90) + (van.description.length > 90 ? '...' : '') : 'Quality rental van ready for your journey.'}
        </p>
        <div style={s.cardMeta}>
          <span>{van.capacity} seats</span>
        </div>
      </div>
      <div style={s.cardFooter}>
        <span style={s.price}>
          ${Number(van.price_per_day).toFixed(2)} <span style={s.perDay}>/ day</span>
        </span>
        <Link to={`/vans/${van.id}`} style={s.viewBtn2}>View Details</Link>
      </div>
    </div>
  );
}

function VanCardList({ van, s, typeColors }) {
  const colors = typeColors[van.type] || { background: '#f3f4f6', color: '#374151' };

  return (
    <div style={s.listCard}>
      <img
        src={van.image_url || DEFAULT_VAN_IMAGE}
        alt={van.name}
        style={s.listImg}
        onError={(e) => { e.target.src = DEFAULT_VAN_IMAGE; }}
      />
      <div style={s.listBody}>
        <div>
          <span style={{ ...s.cardType, ...colors }}>{van.type}</span>
          <h3 style={{ ...s.cardName, marginTop: '0.25rem' }}>{van.name}</h3>
          <p style={{ ...s.cardDesc, marginBottom: '0.5rem' }}>
            {van.description ? van.description.slice(0, 120) + (van.description.length > 120 ? '...' : '') : 'Quality rental van ready for your journey.'}
          </p>
          <span style={{ fontSize: '0.85rem', color: COLORS.muted }}>{van.capacity} seats</span>
        </div>
        <div style={s.listFooter}>
          <span style={s.price}>
            ${Number(van.price_per_day).toFixed(2)} <span style={s.perDay}>/ day</span>
          </span>
          <Link to={`/vans/${van.id}`} style={s.viewBtn2}>View Details</Link>
        </div>
      </div>
    </div>
  );
}
