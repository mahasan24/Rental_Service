import request from 'supertest';
import app from './app.js';

describe('Health', () => {
  it('GET /health returns 200 and status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
  });
});

describe('Auth API', () => {
  const unique = `test-${Date.now()}@example.com`;

  it('POST /api/auth/register rejects missing email', async () => {
    const res = await request(app).post('/api/auth/register').send({ password: 'secret' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email|required/i);
  });

  it('POST /api/auth/register rejects missing password', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'a@b.com' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/password|required/i);
  });

  it('POST /api/auth/register creates user and returns token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: unique, password: 'password123', name: 'Test User' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toMatchObject({ email: unique, name: 'Test User' });
  });

  it('POST /api/auth/register rejects duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: unique, password: 'other' });
    expect(res.status).toBe(409);
    expect(res.body.error).toBeDefined();
  });

  it('POST /api/auth/login rejects missing credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });

  it('POST /api/auth/login rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: unique, password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('POST /api/auth/login returns user and token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: unique, password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(unique);
  });
});

describe('Vans API', () => {
  it('GET /api/vans returns 200 and array', async () => {
    const res = await request(app).get('/api/vans');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/vans?type=Passenger returns filtered list', async () => {
    const res = await request(app).get('/api/vans').query({ type: 'Passenger' });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/vans/:id returns 404 for non-existent van', async () => {
    const res = await request(app).get('/api/vans/999999');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  it('GET /api/vans/1 returns van when exists', async () => {
    const list = await request(app).get('/api/vans');
    if (list.body.length === 0) return;
    const id = list.body[0].id;
    const res = await request(app).get(`/api/vans/${id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', id);
    expect(res.body).toHaveProperty('name');
    expect(res.body).toHaveProperty('price_per_day');
  });
});

describe('Bookings API', () => {
  let token;
  let vanId;
  const bookingUser = `booking-${Date.now()}@test.example.com`;

  beforeAll(async () => {
    await request(app).post('/api/auth/register').send({
      email: bookingUser,
      password: 'password123',
      name: 'Booking Test',
    });
    const loginRes = await request(app).post('/api/auth/login').send({
      email: bookingUser,
      password: 'password123',
    });
    token = loginRes.body.token;
    const vansRes = await request(app).get('/api/vans');
    vanId = vansRes.body[0]?.id ?? 1;
  });

  it('GET /api/bookings without token returns 401', async () => {
    const res = await request(app).get('/api/bookings');
    expect(res.status).toBe(401);
  });

  it('GET /api/bookings with token returns 200 and array', async () => {
    const res = await request(app)
      .get('/api/bookings')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/bookings/availability requires query params', async () => {
    const res = await request(app)
      .get('/api/bookings/availability')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it('GET /api/bookings/availability returns available flag', async () => {
    const start = new Date();
    start.setDate(start.getDate() + 30);
    const end = new Date(start);
    end.setDate(end.getDate() + 2);
    const res = await request(app)
      .get('/api/bookings/availability')
      .set('Authorization', `Bearer ${token}`)
      .query({
        van_id: vanId,
        start_date: start.toISOString().split('T')[0],
        end_date: end.toISOString().split('T')[0],
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('available');
  });

  it('POST /api/bookings without body returns 400', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('POST /api/bookings with valid data returns 201', async () => {
    const start = new Date();
    start.setDate(start.getDate() + 60);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        van_id: vanId,
        start_date: start.toISOString().split('T')[0],
        end_date: end.toISOString().split('T')[0],
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('van_id', vanId);
    expect(res.body).toHaveProperty('status', 'confirmed');
  });
});
