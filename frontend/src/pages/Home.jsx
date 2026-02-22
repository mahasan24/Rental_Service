import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

const PREMIUM_COLORS = {
  primary: '#0f172a',
  secondary: '#1e293b',
  accent: '#3b82f6',
  accentLight: '#60a5fa',
  gold: '#f59e0b',
  success: '#10b981',
  light: '#f8fafc',
  muted: '#64748b',
  white: '#ffffff',
  gradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3b82f6 100%)',
  cardGradient: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(15,23,42,0.9) 100%)',
};

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [need, setNeed] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [personalizedVans, setPersonalizedVans] = useState([]);

  useEffect(() => {
    fetchPersonalized();
  }, [isAuthenticated]);

  async function fetchPersonalized() {
    try {
      const res = await client.get('/recommendations/personalized');
      setPersonalizedVans(res.data.vans?.slice(0, 4) || []);
    } catch {
      setPersonalizedVans([]);
    }
  }

  async function handleGetRecommendations(e) {
    e.preventDefault();
    if (!need.trim()) return;
    setLoading(true);
    try {
      const res = await client.post('/recommendations', { need: need.trim() });
      setRecommendations(res.data);
    } catch {
      setRecommendations({ vans: [], reason: 'Could not get recommendations. Try again.' });
    } finally {
      setLoading(false);
    }
  }

  const s = {
    hero: {
      background: PREMIUM_COLORS.gradient,
      color: PREMIUM_COLORS.white,
      padding: '5rem 2rem 6rem',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
      margin: '-1.5rem -1.5rem 0',
    },
    heroOverlay: {
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      background: 'radial-gradient(circle at 30% 20%, rgba(59,130,246,0.3) 0%, transparent 50%)',
      pointerEvents: 'none',
    },
    heroContent: { position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto' },
    heroTitle: {
      fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 800, marginBottom: '1rem',
      lineHeight: 1.1, letterSpacing: '-0.02em',
    },
    heroSubtitle: {
      fontSize: 'clamp(1rem, 2.5vw, 1.35rem)', color: 'rgba(255,255,255,0.85)',
      maxWidth: 600, margin: '0 auto 2.5rem', lineHeight: 1.6,
    },
    heroBtns: { display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' },
    btnPrimary: {
      background: PREMIUM_COLORS.accent, color: PREMIUM_COLORS.white,
      padding: '1rem 2.5rem', borderRadius: 12, fontWeight: 700, fontSize: '1.1rem',
      textDecoration: 'none', border: 'none', cursor: 'pointer',
      boxShadow: '0 4px 20px rgba(59,130,246,0.4)', transition: 'transform 0.2s, box-shadow 0.2s',
    },
    btnSecondary: {
      background: 'rgba(255,255,255,0.1)', color: PREMIUM_COLORS.white,
      padding: '1rem 2.5rem', borderRadius: 12, fontWeight: 600, fontSize: '1.1rem',
      textDecoration: 'none', border: '2px solid rgba(255,255,255,0.3)',
      backdropFilter: 'blur(10px)', transition: 'background 0.2s',
    },
    section: { padding: '4rem 1rem', maxWidth: 1200, margin: '0 auto' },
    sectionTitle: {
      fontSize: '2rem', fontWeight: 700, color: PREMIUM_COLORS.primary,
      marginBottom: '0.5rem', textAlign: 'center',
    },
    sectionSubtitle: {
      color: PREMIUM_COLORS.muted, textAlign: 'center', marginBottom: '2.5rem',
      fontSize: '1.1rem',
    },
    helpBox: {
      background: PREMIUM_COLORS.light, borderRadius: 24, padding: '3rem 2rem',
      boxShadow: '0 4px 30px rgba(0,0,0,0.06)', maxWidth: 700, margin: '0 auto',
    },
    helpTitle: {
      fontSize: '1.5rem', fontWeight: 700, color: PREMIUM_COLORS.primary,
      marginBottom: '0.5rem', textAlign: 'center',
    },
    helpSubtitle: {
      color: PREMIUM_COLORS.muted, textAlign: 'center', marginBottom: '1.5rem',
    },
    inputRow: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
    input: {
      flex: 1, minWidth: 250, padding: '1rem 1.25rem', fontSize: '1rem',
      border: '2px solid #e2e8f0', borderRadius: 12, outline: 'none',
      transition: 'border-color 0.2s',
    },
    helpBtn: {
      background: PREMIUM_COLORS.accent, color: PREMIUM_COLORS.white,
      padding: '1rem 2rem', borderRadius: 12, fontWeight: 600, fontSize: '1rem',
      border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
    },
    quickTags: {
      display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem',
      justifyContent: 'center',
    },
    tag: {
      padding: '0.5rem 1rem', background: PREMIUM_COLORS.white, border: '1px solid #e2e8f0',
      borderRadius: 20, fontSize: '0.85rem', color: PREMIUM_COLORS.secondary,
      cursor: 'pointer', transition: 'all 0.2s',
    },
    resultsBox: {
      marginTop: '2rem', padding: '1.5rem', background: PREMIUM_COLORS.white,
      borderRadius: 16, border: '1px solid #e2e8f0',
    },
    resultsTitle: { fontWeight: 600, color: PREMIUM_COLORS.primary, marginBottom: '1rem' },
    vanGrid: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '1.5rem',
    },
    vanCard: {
      borderRadius: 16, overflow: 'hidden', background: PREMIUM_COLORS.white,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transition: 'transform 0.3s, box-shadow 0.3s',
      cursor: 'pointer',
    },
    vanCardHover: { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(0,0,0,0.15)' },
    vanImg: { width: '100%', height: 180, objectFit: 'cover' },
    vanBody: { padding: '1.25rem' },
    vanType: {
      display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: 20,
      fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem',
    },
    vanName: { fontSize: '1.1rem', fontWeight: 700, color: PREMIUM_COLORS.primary, margin: '0.25rem 0' },
    vanPrice: { color: PREMIUM_COLORS.accent, fontWeight: 700, fontSize: '1.1rem' },
    features: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '2rem', marginTop: '2rem',
    },
    featureCard: {
      padding: '2rem', background: PREMIUM_COLORS.white, borderRadius: 20,
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)', textAlign: 'center',
    },
    featureIcon: {
      width: 64, height: 64, borderRadius: 16, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: '1.75rem', margin: '0 auto 1rem',
    },
    featureTitle: { fontSize: '1.2rem', fontWeight: 700, color: PREMIUM_COLORS.primary, marginBottom: '0.5rem' },
    featureDesc: { color: PREMIUM_COLORS.muted, lineHeight: 1.6 },
    stats: {
      display: 'flex', justifyContent: 'center', gap: '4rem', flexWrap: 'wrap',
      padding: '3rem 1rem', background: PREMIUM_COLORS.secondary, color: PREMIUM_COLORS.white,
      margin: '0 -1.5rem',
    },
    statItem: { textAlign: 'center' },
    statNum: { fontSize: '2.5rem', fontWeight: 800, color: PREMIUM_COLORS.accentLight },
    statLabel: { fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.25rem' },
  };

  const typeColors = {
    Passenger: { background: '#dbeafe', color: '#1d4ed8' },
    Cargo: { background: '#fef3c7', color: '#92400e' },
    Camper: { background: '#d1fae5', color: '#065f46' },
  };

  const quickSuggestions = ['Moving house', 'Family road trip', 'Camping weekend', 'Furniture delivery', 'Group outing'];

  return (
    <div>
      {/* Hero Section */}
      <section style={s.hero}>
        <div style={s.heroOverlay} />
        <div style={s.heroContent}>
          <h1 style={s.heroTitle}>
            Find Your Perfect<br />Rental Van
          </h1>
          <p style={s.heroSubtitle}>
            From weekend getaways to big moves, we have the right van for every journey.
            Smart recommendations, transparent pricing, instant booking.
          </p>
          <div style={s.heroBtns}>
            <Link to="/vans" style={s.btnPrimary}>Explore Our Fleet</Link>
            {!isAuthenticated && (
              <Link to="/register" style={s.btnSecondary}>Get Started Free</Link>
            )}
            {isAuthenticated && (
              <Link to="/bookings" style={s.btnSecondary}>My Bookings</Link>
            )}
          </div>
        </div>
      </section>

      {/* How Can We Help Section */}
      <section style={s.section}>
        <div style={s.helpBox}>
          <h2 style={s.helpTitle}>How can we help you today?</h2>
          <p style={s.helpSubtitle}>Tell us what you need the van for and we'll recommend the best options.</p>
          <form onSubmit={handleGetRecommendations}>
            <div style={s.inputRow}>
              <input
                type="text"
                style={s.input}
                placeholder="e.g., Moving to a new apartment, family camping trip..."
                value={need}
                onChange={e => setNeed(e.target.value)}
              />
              <button type="submit" style={s.helpBtn} disabled={loading}>
                {loading ? 'Finding...' : 'Get Recommendations'}
              </button>
            </div>
          </form>
          <div style={s.quickTags}>
            {quickSuggestions.map(tag => (
              <span
                key={tag}
                style={s.tag}
                onClick={() => { setNeed(tag); }}
                onKeyDown={e => e.key === 'Enter' && setNeed(tag)}
                tabIndex={0}
                role="button"
              >
                {tag}
              </span>
            ))}
          </div>

          {recommendations && (
            <div style={s.resultsBox}>
              <p style={s.resultsTitle}>{recommendations.reason}</p>
              {recommendations.vans?.length > 0 ? (
                <div style={s.vanGrid}>
                  {recommendations.vans.slice(0, 3).map(van => (
                    <VanCard key={van.id} van={van} s={s} typeColors={typeColors} onClick={() => navigate(`/vans/${van.id}`)} />
                  ))}
                </div>
              ) : (
                <p style={{ color: PREMIUM_COLORS.muted }}>No specific matches found. <Link to="/vans" style={{ color: PREMIUM_COLORS.accent }}>Browse all vans</Link></p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section style={s.stats}>
        <div style={s.statItem}>
          <div style={s.statNum}>500+</div>
          <div style={s.statLabel}>Happy Customers</div>
        </div>
        <div style={s.statItem}>
          <div style={s.statNum}>50+</div>
          <div style={s.statLabel}>Vans Available</div>
        </div>
        <div style={s.statItem}>
          <div style={s.statNum}>24/7</div>
          <div style={s.statLabel}>Support</div>
        </div>
        <div style={s.statItem}>
          <div style={s.statNum}>4.9★</div>
          <div style={s.statLabel}>Customer Rating</div>
        </div>
      </section>

      {/* Features Section */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>Why Choose Rentel?</h2>
        <p style={s.sectionSubtitle}>Everything you need for a seamless rental experience</p>
        <div style={s.features}>
          <div style={s.featureCard}>
            <div style={{ ...s.featureIcon, background: '#dbeafe' }}>🚐</div>
            <h3 style={s.featureTitle}>Diverse Fleet</h3>
            <p style={s.featureDesc}>From compact campers to spacious passenger vans, find the perfect fit for any occasion.</p>
          </div>
          <div style={s.featureCard}>
            <div style={{ ...s.featureIcon, background: '#fef3c7' }}>🤖</div>
            <h3 style={s.featureTitle}>Smart Recommendations</h3>
            <p style={s.featureDesc}>Our AI-powered system suggests the best van based on your specific needs.</p>
          </div>
          <div style={s.featureCard}>
            <div style={{ ...s.featureIcon, background: '#d1fae5' }}>💳</div>
            <h3 style={s.featureTitle}>Transparent Pricing</h3>
            <p style={s.featureDesc}>No hidden fees. See the full cost upfront before you book.</p>
          </div>
          <div style={s.featureCard}>
            <div style={{ ...s.featureIcon, background: '#fce7f3' }}>⚡</div>
            <h3 style={s.featureTitle}>Instant Booking</h3>
            <p style={s.featureDesc}>Book in seconds with real-time availability. No waiting, no hassle.</p>
          </div>
        </div>
      </section>

      {/* Personalized Recommendations */}
      {personalizedVans.length > 0 && (
        <section style={{ ...s.section, background: PREMIUM_COLORS.light, margin: '0 -1.5rem', padding: '4rem calc(1.5rem + 1rem)' }}>
          <h2 style={s.sectionTitle}>{isAuthenticated ? 'Recommended for You' : 'Popular Vans'}</h2>
          <p style={s.sectionSubtitle}>
            {isAuthenticated ? 'Based on your preferences and booking history' : 'Our most booked vans this month'}
          </p>
          <div style={{ ...s.vanGrid, maxWidth: 1200, margin: '0 auto' }}>
            {personalizedVans.map(van => (
              <VanCard key={van.id} van={van} s={s} typeColors={typeColors} onClick={() => navigate(`/vans/${van.id}`)} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/vans" style={{ ...s.btnPrimary, display: 'inline-block' }}>View All Vans</Link>
          </div>
        </section>
      )}
    </div>
  );
}

function VanCard({ van, s, typeColors, onClick }) {
  const [hovered, setHovered] = useState(false);
  const colors = typeColors[van.type] || { background: '#f3f4f6', color: '#374151' };

  return (
    <div
      style={{ ...s.vanCard, ...(hovered ? s.vanCardHover : {}) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      <img
        src={van.image_url || 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=400'}
        alt={van.name}
        style={s.vanImg}
      />
      <div style={s.vanBody}>
        <span style={{ ...s.vanType, ...colors }}>{van.type}</span>
        <h3 style={s.vanName}>{van.name}</h3>
        <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.5rem 0' }}>
          {van.capacity} seats
        </p>
        <p style={s.vanPrice}>${Number(van.price_per_day).toFixed(2)}/day</p>
      </div>
    </div>
  );
}
