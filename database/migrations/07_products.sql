CREATE TABLE IF NOT EXISTS products (
    product_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    stock_quantity INT NOT NULL CHECK (stock_quantity >= 0),
    status product_status NOT NULL DEFAULT 'ACTIVE',
    category_id INT REFERENCES categories(category_id),
    brand_id INT REFERENCES brands(brand_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);