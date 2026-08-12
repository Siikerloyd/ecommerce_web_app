CREATE TABLE IF NOT EXISTS delivery_profiles (
    delivery_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(user_id),
    vehicle_type VARCHAR(50),
    license_number VARCHAR(50),
    status delivery_status NOT NULL DEFAULT 'OFFLINE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);