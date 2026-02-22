import pool from '../db/pool.js';

/**
 * Recommendation rules: map use-case keywords to van types.
 * Scored by relevance (higher = stronger match).
 */
const USE_CASE_RULES = [
  { keywords: ['moving', 'move', 'relocate', 'furniture', 'apartment', 'house'], type: 'Cargo', score: 10 },
  { keywords: ['delivery', 'transport', 'haul', 'load', 'cargo', 'goods'], type: 'Cargo', score: 9 },
  { keywords: ['camping', 'camp', 'road trip', 'adventure', 'travel', 'vacation'], type: 'Camper', score: 10 },
  { keywords: ['overnight', 'sleep', 'weekend getaway', 'nature'], type: 'Camper', score: 8 },
  { keywords: ['family', 'group', 'team', 'shuttle', 'passengers', 'people'], type: 'Passenger', score: 10 },
  { keywords: ['tour', 'trip', 'outing', 'excursion', 'day trip'], type: 'Passenger', score: 7 },
  { keywords: ['wedding', 'event', 'party', 'celebration'], type: 'Passenger', score: 8 },
  { keywords: ['business', 'corporate', 'work', 'commercial'], type: 'Cargo', score: 6 },
];

const CAPACITY_HINTS = [
  { keywords: ['small', 'compact', 'solo', 'alone', '1 person', '2 people'], maxCapacity: 4 },
  { keywords: ['medium', 'couple', '3 people', '4 people', '5 people'], maxCapacity: 8 },
  { keywords: ['large', 'big', 'many', 'group', '6 people', '10 people', '12 people'], minCapacity: 6 },
];

function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
}

function matchKeywords(text, keywords) {
  const textLower = text.toLowerCase();
  const tokens = tokenize(text);
  let matches = 0;
  for (const kw of keywords) {
    if (textLower.includes(kw) || tokens.some(t => t.includes(kw) || kw.includes(t))) {
      matches++;
    }
  }
  return matches;
}

/**
 * Analyze user need text and return recommended van types with scores.
 */
export function analyzeNeed(needText) {
  const scores = { Passenger: 0, Cargo: 0, Camper: 0 };

  for (const rule of USE_CASE_RULES) {
    const matches = matchKeywords(needText, rule.keywords);
    if (matches > 0) {
      scores[rule.type] += rule.score * matches;
    }
  }

  const capacityFilter = { minCapacity: null, maxCapacity: null };
  for (const hint of CAPACITY_HINTS) {
    if (matchKeywords(needText, hint.keywords) > 0) {
      if (hint.minCapacity) capacityFilter.minCapacity = hint.minCapacity;
      if (hint.maxCapacity) capacityFilter.maxCapacity = hint.maxCapacity;
    }
  }

  const sorted = Object.entries(scores)
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([type, score]) => ({ type, score }));

  return { recommendations: sorted, capacityFilter };
}

/**
 * Get recommended vans based on need text and optional user history.
 */
export async function getRecommendedVans(needText, userId = null, limit = 6) {
  const { recommendations, capacityFilter } = analyzeNeed(needText);

  if (recommendations.length === 0) {
    const fallback = await pool.query(
      'SELECT id, type, name, capacity, description, price_per_day, image_url FROM vans ORDER BY price_per_day ASC LIMIT $1',
      [limit]
    );
    return { vans: fallback.rows, matchedTypes: [], reason: 'Here are some popular vans for you' };
  }

  const topTypes = recommendations.slice(0, 2).map(r => r.type);

  let query = `SELECT id, type, name, capacity, description, price_per_day, image_url FROM vans WHERE type = ANY($1)`;
  const params = [topTypes];
  let paramIndex = 2;

  if (capacityFilter.minCapacity) {
    query += ` AND capacity >= $${paramIndex}`;
    params.push(capacityFilter.minCapacity);
    paramIndex++;
  }
  if (capacityFilter.maxCapacity) {
    query += ` AND capacity <= $${paramIndex}`;
    params.push(capacityFilter.maxCapacity);
    paramIndex++;
  }

  query += ` ORDER BY price_per_day ASC LIMIT $${paramIndex}`;
  params.push(limit);

  const result = await pool.query(query, params);

  // If no results with filters, try without capacity filters
  if (result.rows.length === 0) {
    const fallbackQuery = await pool.query(
      'SELECT id, type, name, capacity, description, price_per_day, image_url FROM vans WHERE type = ANY($1) ORDER BY price_per_day ASC LIMIT $2',
      [topTypes, limit]
    );
    
    // If still no results, return all vans
    if (fallbackQuery.rows.length === 0) {
      const allVans = await pool.query(
        'SELECT id, type, name, capacity, description, price_per_day, image_url FROM vans ORDER BY price_per_day ASC LIMIT $1',
        [limit]
      );
      return {
        vans: allVans.rows,
        matchedTypes: [],
        reason: `We recommend these vans for "${needText.slice(0, 30)}${needText.length > 30 ? '...' : ''}"`,
      };
    }
    
    return {
      vans: fallbackQuery.rows,
      matchedTypes: topTypes,
      reason: `Perfect ${topTypes[0]} vans for "${needText.slice(0, 30)}${needText.length > 30 ? '...' : ''}"`,
    };
  }

  let reason = `Perfect ${topTypes[0]} vans for "${needText.slice(0, 30)}${needText.length > 30 ? '...' : ''}"`;
  if (userId) {
    const historyResult = await pool.query(
      `SELECT DISTINCT v.type FROM bookings b JOIN vans v ON v.id = b.van_id WHERE b.user_id = $1 LIMIT 3`,
      [userId]
    );
    if (historyResult.rows.length > 0) {
      reason += ' based on your preferences';
    }
  }

  return {
    vans: result.rows,
    matchedTypes: topTypes,
    reason,
  };
}

/**
 * Get user's booking history for personalization.
 */
export async function getUserBookingHistory(userId, limit = 10) {
  const result = await pool.query(
    `SELECT b.id, b.van_id, b.start_date, b.end_date, b.status, b.created_at,
            v.name AS van_name, v.type AS van_type, v.price_per_day, v.image_url
     FROM bookings b
     JOIN vans v ON v.id = b.van_id
     WHERE b.user_id = $1
     ORDER BY b.created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}

/**
 * Get personalized recommendations based on user history.
 */
export async function getPersonalizedRecommendations(userId, limit = 4) {
  const history = await getUserBookingHistory(userId, 5);

  if (history.length === 0) {
    const popular = await pool.query(
      'SELECT id, type, name, capacity, description, price_per_day, image_url FROM vans ORDER BY price_per_day ASC LIMIT $1',
      [limit]
    );
    return { vans: popular.rows, reason: 'Popular vans to get you started' };
  }

  const typeCounts = {};
  for (const booking of history) {
    typeCounts[booking.van_type] = (typeCounts[booking.van_type] || 0) + 1;
  }

  const preferredType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0][0];

  const result = await pool.query(
    `SELECT id, type, name, capacity, description, price_per_day, image_url
     FROM vans WHERE type = $1 ORDER BY price_per_day ASC LIMIT $2`,
    [preferredType, limit]
  );

  return {
    vans: result.rows,
    reason: `Based on your preference for ${preferredType} vans`,
    preferredType,
  };
}
