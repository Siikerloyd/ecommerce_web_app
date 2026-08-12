CREATE TABLE IF NOT EXISTS orders (
    order_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL REFERENCES users(user_id),
    delivery_id INT REFERENCES delivery_profiles(delivery_id),
    address_id INT NOT NULL REFERENCES addresses(address_id),
    status order_status NOT NULL DEFAULT 'PENDING',
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);