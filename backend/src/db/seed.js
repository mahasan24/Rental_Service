import pool from './pool.js';

const vans = [
  {
    type: 'Passenger',
    name: 'Ford Transit 12-Seater',
    capacity: 12,
    specs_json: JSON.stringify({ engine: '3.5L V6', transmission: 'Automatic', fuel: 'Petrol', ac: true }),
    description: 'Spacious 12-seater passenger van, perfect for group trips and family outings.',
    price_per_day: 89.99,
    image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&h=400&fit=crop',
  },
  {
    type: 'Cargo',
    name: 'Mercedes Sprinter Cargo',
    capacity: 3,
    specs_json: JSON.stringify({ engine: '2.0L Turbo Diesel', transmission: 'Automatic', fuel: 'Diesel', payload_kg: 1500 }),
    description: 'Heavy-duty cargo van with ample storage. Ideal for moving and deliveries.',
    price_per_day: 74.99,
    image_url: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=600&h=400&fit=crop',
  },
  {
    type: 'Camper',
    name: 'VW California Beach',
    capacity: 4,
    specs_json: JSON.stringify({ engine: '2.0L TDI', transmission: 'Manual', fuel: 'Diesel', beds: 2, kitchenette: true }),
    description: 'Classic camper van with a pop-up roof, built-in kitchenette, and sleeping for four.',
    price_per_day: 109.99,
    image_url: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=600&h=400&fit=crop',
  },
  {
    type: 'Passenger',
    name: 'Toyota HiAce Commuter',
    capacity: 15,
    specs_json: JSON.stringify({ engine: '2.8L Diesel', transmission: 'Automatic', fuel: 'Diesel', ac: true }),
    description: 'High-capacity commuter van with comfortable seating for up to 15 passengers.',
    price_per_day: 99.99,
    image_url: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=600&h=400&fit=crop',
  },
  {
    type: 'Cargo',
    name: 'Ram ProMaster 2500',
    capacity: 2,
    specs_json: JSON.stringify({ engine: '3.6L V6', transmission: 'Automatic', fuel: 'Petrol', payload_kg: 1800 }),
    description: 'Full-size cargo van with the largest cargo area in its class.',
    price_per_day: 79.99,
    image_url: 'https://images.unsplash.com/photo-1532581140115-3e355d1ed1de?w=600&h=400&fit=crop',
  },
  {
    type: 'Camper',
    name: 'Winnebago Solis',
    capacity: 2,
    specs_json: JSON.stringify({ engine: '3.0L Turbo Diesel', transmission: 'Automatic', fuel: 'Diesel', beds: 1, kitchenette: true, shower: true }),
    description: 'Compact yet luxurious camper van with a wet bath, kitchen, and sleeping area.',
    price_per_day: 129.99,
    image_url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=600&h=400&fit=crop',
  },
  {
    type: 'Passenger',
    name: 'Nissan NV350 Urvan',
    capacity: 10,
    specs_json: JSON.stringify({ engine: '2.5L Diesel', transmission: 'Manual', fuel: 'Diesel', ac: true }),
    description: 'Reliable mid-size passenger van suitable for shuttle services and tours.',
    price_per_day: 69.99,
    image_url: 'https://images.unsplash.com/photo-1609520778163-a16fb3862581?w=600&h=400&fit=crop',
  },
  {
    type: 'Cargo',
    name: 'Ford E-Transit Electric',
    capacity: 2,
    specs_json: JSON.stringify({ engine: 'Electric Motor', transmission: 'Automatic', fuel: 'Electric', payload_kg: 1600, range_km: 200 }),
    description: 'Zero-emission electric cargo van for eco-friendly urban deliveries.',
    price_per_day: 84.99,
    image_url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=400&fit=crop',
  },
];

async function seed() {
  console.log('Seeding vans...');

  // Clear existing data
  await pool.query('DELETE FROM vans');

  for (const van of vans) {
    await pool.query(
      `INSERT INTO vans (type, name, capacity, specs_json, description, price_per_day, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [van.type, van.name, van.capacity, van.specs_json, van.description, van.price_per_day, van.image_url]
    );
    console.log(`  Inserted: ${van.name}`);
  }

  console.log(`Seeded ${vans.length} vans successfully.`);
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
