CREATE TABLE IF NOT EXISTS payments (
    payment_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(order_id),
    payment_method payment_method DEFAULT 'CASH_ON_DELIVERY',
    payment_status payment_status DEFAULT 'PENDING',
    transaction_id VARCHAR(255) UNIQUE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);