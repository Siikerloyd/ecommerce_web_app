CREATE TABLE IF NOT EXISTS order_items (
    order_item_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(product_id),
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL CHECK (quantity >= 1),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),

    UNIQUE (order_id, product_id)
);