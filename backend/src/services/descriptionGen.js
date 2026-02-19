import pool from '../db/pool.js';

/**
 * Generate a marketing description for a van based on its specs.
 *
 * Currently uses a template + feature extraction approach.
 * In production, replace generateFromTemplate() with an LLM call
 * (e.g. OpenAI / Gemini via LangChain) for richer output.
 */

const TYPE_INTROS = {
  Passenger: [
    'Perfect for group travel,',
    'Ideal for family outings and shuttle services,',
    'Designed for comfortable passenger transport,',
  ],
  Cargo: [
    'Built for heavy-duty hauling,',
    'Your go-to solution for deliveries and moves,',
    'Engineered for maximum cargo capacity,',
  ],
  Camper: [
    'Your home on wheels,',
    'Adventure awaits in this fully-equipped camper,',
    'Hit the open road with comfort and freedom,',
  ],
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function extractFeatures(specs) {
  const features = [];
  if (specs.engine) features.push(`powered by a ${specs.engine} engine`);
  if (specs.transmission) features.push(`${specs.transmission.toLowerCase()} transmission`);
  if (specs.fuel === 'Electric') features.push('zero-emission electric drivetrain');
  else if (specs.fuel) features.push(`runs on ${specs.fuel.toLowerCase()}`);
  if (specs.ac) features.push('full climate control');
  if (specs.beds) features.push(`sleeping for ${specs.beds === 1 ? 'one' : specs.beds}`);
  if (specs.kitchenette) features.push('a built-in kitchenette');
  if (specs.shower) features.push('an onboard shower/wet bath');
  if (specs.payload_kg) features.push(`up to ${specs.payload_kg} kg payload capacity`);
  if (specs.range_km) features.push(`${specs.range_km} km range on a single charge`);
  return features;
}

function generateFromTemplate(van) {
  const specs = typeof van.specs_json === 'string' ? JSON.parse(van.specs_json) : (van.specs_json || {});
  const intros = TYPE_INTROS[van.type] || TYPE_INTROS.Passenger;
  const intro = pickRandom(intros);
  const features = extractFeatures(specs);

  let body = `the ${van.name}`;
  if (van.capacity) {
    body += van.type === 'Cargo'
      ? ` seats ${van.capacity} up front`
      : ` comfortably seats up to ${van.capacity}`;
  }

  if (features.length > 0) {
    const featureStr = features.length === 1
      ? features[0]
      : features.slice(0, -1).join(', ') + ' and ' + features[features.length - 1];
    body += `. It features ${featureStr}`;
  }

  body += '.';

  const closings = [
    'Book today and experience the difference.',
    'Reserve now and make your next trip effortless.',
    'Available for daily rental — book your dates now!',
  ];

  return `${intro} ${body} ${pickRandom(closings)}`;
}

/**
 * Generate a description for a van by ID.
 * Optionally save the description back to the database.
 */
export async function generateDescription(vanId, { save = false } = {}) {
  const result = await pool.query(
    'SELECT id, type, name, capacity, specs_json, price_per_day FROM vans WHERE id = $1',
    [vanId]
  );

  if (result.rows.length === 0) {
    return { error: 'Van not found', status: 404 };
  }

  const van = result.rows[0];
  const description = generateFromTemplate(van);

  if (save) {
    await pool.query('UPDATE vans SET description = $1 WHERE id = $2', [description, vanId]);
  }

  return {
    van_id: van.id,
    name: van.name,
    description,
    saved: save,
  };
}

/**
 * Generate descriptions for all vans that have no description yet.
 */
export async function generateMissingDescriptions() {
  const result = await pool.query(
    "SELECT id, type, name, capacity, specs_json, price_per_day FROM vans WHERE description IS NULL OR description = ''"
  );

  const generated = [];
  for (const van of result.rows) {
    const description = generateFromTemplate(van);
    await pool.query('UPDATE vans SET description = $1 WHERE id = $2', [description, van.id]);
    generated.push({ van_id: van.id, name: van.name, description });
  }

  return { count: generated.length, vans: generated };
}
