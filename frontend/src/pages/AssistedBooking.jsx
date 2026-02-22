import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Questionnaire from '../components/Questionnaire';
import RecommendedVans from '../components/RecommendedVans';
import client from '../api/client';

const COLORS = {
  primary: '#0f172a',
  accent: '#3b82f6',
  accentLight: '#60a5fa',
  light: '#f8fafc',
  white: '#ffffff',
  muted: '#64748b',
  gradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3b82f6 100%)',
};

export default function AssistedBooking() {
  const navigate = useNavigate();
  const [step, setStep] = useState('questionnaire');
  const [needText, setNeedText] = useState('');
  const [customNeed, setCustomNeed] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleQuestionnaireComplete(generatedNeed, answers) {
    setNeedText(generatedNeed);
    await fetchRecommendations(generatedNeed);
  }

  async function fetchRecommendations(need) {
    setLoading(true);
    try {
      const res = await client.post('/recommendations', { need });
      setRecommendations(res.data);
      setStep('results');
    } catch {
      setRecommendations({ vans: [], reason: 'Could not get recommendations.' });
      setStep('results');
    } finally {
      setLoading(false);
    }
  }

  async function handleCustomSearch(e) {
    e.preventDefault();
    if (!customNeed.trim()) return;
    setNeedText(customNeed.trim());
    await fetchRecommendations(customNeed.trim());
  }

  function handleSkip() {
    navigate('/vans');
  }

  const s = {
    container: { minHeight: '80vh', padding: '2rem 1rem' },
    hero: {
      textAlign: 'center', marginBottom: '3rem', padding: '2rem',
    },
    heroTitle: {
      fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800,
      color: COLORS.primary, marginBottom: '0.75rem',
    },
    heroSubtitle: {
      fontSize: '1.1rem', color: COLORS.muted, maxWidth: 500, margin: '0 auto',
    },
    resultsContainer: { maxWidth: 1000, margin: '0 auto' },
    resultsHeader: {
      textAlign: 'center', marginBottom: '2rem',
    },
    resultsTitle: {
      fontSize: '1.75rem', fontWeight: 700, color: COLORS.primary, marginBottom: '0.5rem',
    },
    resultsReason: { color: COLORS.muted, fontSize: '1rem' },
    vanGrid: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '1.5rem', marginBottom: '2rem',
    },
    vanCard: {
      background: COLORS.white, borderRadius: 20, overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transition: 'transform 0.3s, box-shadow 0.3s',
      cursor: 'pointer',
    },
    vanCardHover: { transform: 'translateY(-6px)', boxShadow: '0 12px 40px rgba(0,0,0,0.15)' },
    vanImg: { width: '100%', height: 180, objectFit: 'cover' },
    vanBody: { padding: '1.5rem' },
    vanType: {
      display: 'inline-block', padding: '0.3rem 0.8rem', borderRadius: 20,
      fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem',
    },
    vanName: { fontSize: '1.2rem', fontWeight: 700, color: COLORS.primary, margin: '0.25rem 0' },
    vanMeta: { color: COLORS.muted, fontSize: '0.9rem', marginBottom: '0.5rem' },
    vanPrice: { color: COLORS.accent, fontWeight: 700, fontSize: '1.15rem' },
    bookBtn: {
      display: 'block', width: '100%', marginTop: '1rem', padding: '0.75rem',
      background: COLORS.accent, color: COLORS.white, border: 'none',
      borderRadius: 10, fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer',
    },
    actions: {
      display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem',
    },
    secondaryBtn: {
      padding: '0.75rem 1.5rem', background: 'transparent', color: COLORS.accent,
      border: `2px solid ${COLORS.accent}`, borderRadius: 10, fontWeight: 600,
      cursor: 'pointer', fontSize: '0.95rem',
    },
    primaryBtn: {
      padding: '0.75rem 1.5rem', background: COLORS.accent, color: COLORS.white,
      border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer',
      fontSize: '0.95rem',
    },
    loading: {
      textAlign: 'center', padding: '4rem', color: COLORS.muted, fontSize: '1.1rem',
    },
    emptyState: {
      textAlign: 'center', padding: '3rem', background: COLORS.white,
      borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    },
    emptyTitle: { fontSize: '1.25rem', fontWeight: 600, color: COLORS.primary, marginBottom: '0.5rem' },
    emptyText: { color: COLORS.muted, marginBottom: '1.5rem' },
  };

  const typeColors = {
    Passenger: { background: '#dbeafe', color: '#1d4ed8' },
    Cargo: { background: '#fef3c7', color: '#92400e' },
    Camper: { background: '#d1fae5', color: '#065f46' },
  };

  if (loading) {
    return (
      <div style={s.container}>
        <div style={s.loading}>
          <p>Finding the perfect vans for you...</p>
        </div>
      </div>
    );
  }

  if (step === 'results' && recommendations) {
    return (
      <div style={s.container}>
        <div style={s.resultsContainer}>
          <div style={s.resultsHeader}>
            <h1 style={s.resultsTitle}>Here's What We Recommend</h1>
            <p style={s.resultsReason}>{recommendations.reason}</p>
          </div>

          {recommendations.vans?.length > 0 ? (
            <div style={s.vanGrid}>
              {recommendations.vans.map(van => (
                <VanResultCard
                  key={van.id}
                  van={van}
                  s={s}
                  typeColors={typeColors}
                  onBook={() => navigate(`/book/${van.id}`)}
                  onView={() => navigate(`/vans/${van.id}`)}
                />
              ))}
            </div>
          ) : (
            <div style={s.emptyState}>
              <h3 style={s.emptyTitle}>No exact matches found</h3>
              <p style={s.emptyText}>We couldn't find vans matching your specific criteria, but you can browse our full fleet.</p>
              <button style={s.primaryBtn} onClick={() => navigate('/vans')}>
                Browse All Vans
              </button>
            </div>
          )}

          <div style={s.actions}>
            <button style={s.secondaryBtn} onClick={() => setStep('questionnaire')}>
              Start Over
            </button>
            <button style={s.primaryBtn} onClick={() => navigate('/vans')}>
              Browse All Vans
            </button>
          </div>
        </div>
      </div>
    );
  }

  const quickSuggestions = ['Moving house', 'Family road trip', 'Camping weekend', 'Furniture delivery', 'Group outing', 'Wedding transport'];

  return (
    <div style={s.container}>
      <div style={s.hero}>
        <h1 style={s.heroTitle}>Let Us Help You Find the Perfect Van</h1>
        <p style={s.heroSubtitle}>
          Answer a few quick questions or tell us what you need directly.
        </p>
      </div>

      <div style={{
        background: COLORS.white, borderRadius: 20, padding: '2rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)', maxWidth: 600, margin: '0 auto 2rem',
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: COLORS.primary, marginBottom: '1rem', textAlign: 'center' }}>
          Quick Search
        </h3>
        <form onSubmit={handleCustomSearch} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={customNeed}
            onChange={e => setCustomNeed(e.target.value)}
            placeholder="e.g., Moving to a new apartment, family camping trip..."
            style={{
              flex: 1, minWidth: 200, padding: '0.85rem 1rem', fontSize: '1rem',
              border: `2px solid ${COLORS.light}`, borderRadius: 12,
            }}
          />
          <button type="submit" style={{
            padding: '0.85rem 1.5rem', background: COLORS.accent, color: COLORS.white,
            border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer',
          }}>
            Find Vans
          </button>
        </form>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem', justifyContent: 'center' }}>
          {quickSuggestions.map(tag => (
            <span
              key={tag}
              onClick={() => { setCustomNeed(tag); }}
              style={{
                padding: '0.4rem 0.85rem', background: COLORS.light, border: `1px solid ${COLORS.muted}20`,
                borderRadius: 20, fontSize: '0.8rem', color: COLORS.muted, cursor: 'pointer',
              }}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setCustomNeed(tag)}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', color: COLORS.muted, margin: '1.5rem 0' }}>— or —</div>

      <Questionnaire onComplete={handleQuestionnaireComplete} onSkip={handleSkip} />
    </div>
  );
}

function VanResultCard({ van, s, typeColors, onBook, onView }) {
  const [hovered, setHovered] = useState(false);
  const colors = typeColors[van.type] || { background: '#f3f4f6', color: '#374151' };

  return (
    <div
      style={{ ...s.vanCard, ...(hovered ? s.vanCardHover : {}) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={van.image_url || 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=400'}
        alt={van.name}
        style={s.vanImg}
        onClick={onView}
      />
      <div style={s.vanBody}>
        <span style={{ ...s.vanType, ...colors }}>{van.type}</span>
        <h3 style={s.vanName}>{van.name}</h3>
        <p style={s.vanMeta}>{van.capacity} seats</p>
        <p style={s.vanPrice}>${Number(van.price_per_day).toFixed(2)}/day</p>
        <button style={s.bookBtn} onClick={onBook}>
          Book This Van
        </button>
      </div>
    </div>
  );
}
