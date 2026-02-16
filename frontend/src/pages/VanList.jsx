import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';

export default function VanList() {
  const [vans, setVans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter state
  const [typeFilter, setTypeFilter] = useState('');
  const [minCapacity, setMinCapacity] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('price_per_day');

  useEffect(() => {
    fetchVans();
  }, [typeFilter, minCapacity, maxPrice, sort]);

  async function fetchVans() {
    setLoading(true);
    setError('');
    try {
      const params = { sort };
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
    setSort('price_per_day');
  }

  const styles = {
    container: { maxWidth: 1100, margin: '0 auto', padding: '2rem 1rem' },
    heading: { fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' },
    subtitle: { color: '#666', marginBottom: '1.5rem' },
    filterBar: {
      display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end',
      padding: '1rem', background: '#f8f9fa', borderRadius: 10, marginBottom: '1.5rem',
    },
    filterGroup: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
    filterLabel: { fontSize: '0.8rem', fontWeight: 600, color: '#555' },
    select: {
      padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: 6,
      fontSize: '0.9rem', background: '#fff', minWidth: 140,
    },
    input: {
      padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: 6,
      fontSize: '0.9rem', width: 110,
    },
    clearBtn: {
      padding: '0.5rem 1rem', background: '#e9ecef', border: 'none', borderRadius: 6,
      cursor: 'pointer', fontSize: '0.85rem', color: '#555', alignSelf: 'flex-end',
    },
    grid: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '1.5rem',
    },
    card: {
      border: '1px solid #e0e0e0', borderRadius: 12, overflow: 'hidden',
      background: '#fff', transition: 'box-shadow 0.2s, transform 0.2s',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    },
    cardHover: { boxShadow: '0 4px 16px rgba(0,0,0,0.12)', transform: 'translateY(-2px)' },
    cardImg: { width: '100%', height: 200, objectFit: 'cover', background: '#eee' },
    cardBody: { padding: '1rem 1.25rem' },
    cardType: {
      display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: 20,
      fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem',
    },
    cardName: { fontSize: '1.15rem', fontWeight: 600, margin: '0.25rem 0' },
    cardDesc: { color: '#666', fontSize: '0.85rem', lineHeight: 1.4, margin: '0.5rem 0' },
    cardFooter: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0.75rem 1.25rem', borderTop: '1px solid #f0f0f0',
    },
    price: { fontSize: '1.1rem', fontWeight: 700, color: '#2563eb' },
    perDay: { fontSize: '0.8rem', color: '#888', fontWeight: 400 },
    capacity: { fontSize: '0.85rem', color: '#555' },
    viewBtn: {
      display: 'inline-block', padding: '0.5rem 1.2rem', background: '#2563eb',
      color: '#fff', borderRadius: 6, textDecoration: 'none', fontSize: '0.85rem',
      fontWeight: 600, transition: 'background 0.2s',
    },
    emptyState: { textAlign: 'center', padding: '3rem', color: '#888' },
    errorBox: {
      padding: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: 8,
      marginBottom: '1rem',
    },
  };

  const typeColors = {
    Passenger: { background: '#dbeafe', color: '#1d4ed8' },
    Cargo: { background: '#fef3c7', color: '#92400e' },
    Camper: { background: '#d1fae5', color: '#065f46' },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Browse Vans</h1>
      <p style={styles.subtitle}>Find the perfect van for your next adventure or move.</p>

      {/* Filter bar */}
      <div style={styles.filterBar}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Type</label>
          <select style={styles.select} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            <option value="Passenger">Passenger</option>
            <option value="Cargo">Cargo</option>
            <option value="Camper">Camper</option>
          </select>
        </div>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Min Capacity</label>
          <input style={styles.input} type="number" min="1" placeholder="e.g. 4"
            value={minCapacity} onChange={e => setMinCapacity(e.target.value)} />
        </div>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Max Price / day</label>
          <input style={styles.input} type="number" min="0" step="5" placeholder="e.g. 100"
            value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
        </div>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Sort By</label>
          <select style={styles.select} value={sort} onChange={e => setSort(e.target.value)}>
            <option value="price_per_day">Price</option>
            <option value="capacity">Capacity</option>
            <option value="name">Name</option>
          </select>
        </div>
        <button style={styles.clearBtn} onClick={clearFilters}>Clear Filters</button>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      {loading ? (
        <div style={styles.emptyState}>Loading vans...</div>
      ) : vans.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No vans found</p>
          <p>Try adjusting your filters.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {vans.map(van => (
            <VanCard key={van.id} van={van} styles={styles} typeColors={typeColors} />
          ))}
        </div>
      )}
    </div>
  );
}

function VanCard({ van, styles, typeColors }) {
  const [hovered, setHovered] = useState(false);
  const colors = typeColors[van.type] || { background: '#f3f4f6', color: '#374151' };

  return (
    <div
      style={{ ...styles.card, ...(hovered ? styles.cardHover : {}) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={van.image_url || 'https://via.placeholder.com/400x200?text=Van'}
        alt={van.name}
        style={styles.cardImg}
      />
      <div style={styles.cardBody}>
        <span style={{ ...styles.cardType, ...colors }}>{van.type}</span>
        <h3 style={styles.cardName}>{van.name}</h3>
        <p style={styles.cardDesc}>
          {van.description ? van.description.slice(0, 100) + (van.description.length > 100 ? '...' : '') : 'No description available.'}
        </p>
        <p style={styles.capacity}>Seats: {van.capacity}</p>
      </div>
      <div style={styles.cardFooter}>
        <span style={styles.price}>
          ${Number(van.price_per_day).toFixed(2)} <span style={styles.perDay}>/ day</span>
        </span>
        <Link to={`/vans/${van.id}`} style={styles.viewBtn}>View Details</Link>
      </div>
    </div>
  );
}
