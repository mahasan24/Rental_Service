CREATE TABLE vans (
  id SERIAL PRIMARY KEY,
  type VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  capacity INTEGER NOT NULL,
  specs_json JSONB DEFAULT '{}',
  description TEXT,
  price_per_day DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vans_type ON vans(type);
CREATE INDEX idx_vans_capacity ON vans(capacity);
