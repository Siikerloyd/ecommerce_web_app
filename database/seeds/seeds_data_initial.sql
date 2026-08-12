-- ==========================================
-- Reset tables before inserting test data
-- This clears old data and resets identity IDs
-- ==========================================

TRUNCATE TABLE 
order_status_history,
notifications,
reviews,
payments,
order_items,
orders,
wishlist_items,
cart_items,
carts,
delivery_profiles,
addresses,
product_images,
products,
brands,
categories,
users
RESTART IDENTITY CASCADE;


-- ==========================================
-- Insert Users
-- Roles:
-- CUSTOMER  -> normal customer account
-- ADMIN     -> administrator account
-- DELIVERY  -> delivery person account
-- ==========================================

INSERT INTO users
(first_name, last_name, email, phone_number, password_hash, role)
VALUES
('Ahmed', 'Ben Ali', 'ahmed@test.com', '20123456', 'hashed_password_123', 'CUSTOMER'),
('Admin', 'Account', 'admin@test.com', '20987654', 'hashed_admin_password', 'ADMIN'),
('Ali', 'Delivery', 'delivery@test.com', '21555555', 'hashed_delivery_password', 'DELIVERY');


-- ==========================================
-- Insert Categories
-- Electronics is the parent category
-- Phones, Laptops and Accessories are subcategories
-- ==========================================

INSERT INTO categories
(category_name, description)
VALUES
('Electronics', 'Electronic devices and accessories');


INSERT INTO categories
(category_name, description, parent_category_id)
VALUES
('Phones', 'Smartphones and mobile phones', 1),
('Laptops', 'Portable computers', 1),
('Accessories', 'Chargers, cases and other accessories', 1);


-- ==========================================
-- Insert Brands
-- ==========================================

INSERT INTO brands
(brand_name, logo_url)
VALUES
('Samsung', 'https://example.com/logos/samsung.png'),
('Apple', 'https://example.com/logos/apple.png'),
('Xiaomi', 'https://example.com/logos/xiaomi.png'),
('Lenovo', 'https://example.com/logos/lenovo.png');


-- ==========================================
-- Insert Products
-- Products are linked to:
-- category_id -> categories table
-- brand_id    -> brands table
-- ==========================================

INSERT INTO products
(sku, name, description, price, stock_quantity, category_id, brand_id)
VALUES
(
'SAM-S25-001',
'Samsung Galaxy S25',
'Flagship Samsung smartphone with AMOLED display.',
2999.99,
50,
2,
1
),
(
'APP-IP16-001',
'iPhone 16 Pro',
'Apple flagship smartphone with A18 chip.',
4499.99,
35,
2,
2
),
(
'LEN-LG7-001',
'Lenovo Legion 7',
'Gaming laptop with RTX graphics.',
6999.99,
15,
3,
4
),
(
'XIA-RN14-001',
'Xiaomi Redmi Note 14',
'Affordable Android smartphone.',
999.99,
80,
2,
3
);


-- ==========================================
-- Insert Product Images
-- is_primary = TRUE means main image displayed first
-- ==========================================

INSERT INTO product_images
(product_id, image_url, is_primary)
VALUES
(1,'https://example.com/products/s25-front.jpg',TRUE),
(1,'https://example.com/products/s25-back.jpg',FALSE),

(2,'https://example.com/products/iphone16-front.jpg',TRUE),
(2,'https://example.com/products/iphone16-side.jpg',FALSE),

(3,'https://example.com/products/legion7-main.jpg',TRUE),
(3,'https://example.com/products/legion7-keyboard.jpg',FALSE),

(4,'https://example.com/products/redmi14-main.jpg',TRUE),
(4,'https://example.com/products/redmi14-back.jpg',FALSE);


-- ==========================================
-- Insert User Addresses
-- User 1 (Ahmed) has two addresses
-- User 3 (Ali Delivery) has one address
-- ==========================================

INSERT INTO addresses
(user_id, title, street, city, postal_code, country, phone_number, is_default)
VALUES
(1,'Home','12 Habib Bourguiba Avenue','Tunis','1001','Tunisia','20123456',TRUE),
(1,'Work','25 Mohamed V Street','Tunis','1002','Tunisia','20123456',FALSE),
(3,'Home','8 Carthage Street','Ariana','2080','Tunisia','21555555',TRUE);


-- ==========================================
-- Insert Delivery Profile
-- Links delivery account with delivery information
-- ==========================================

INSERT INTO delivery_profiles
(user_id, vehicle_type, status)
VALUES
(3,'Motorcycle','AVAILABLE');


-- ==========================================
-- Insert Shopping Cart
-- Ahmed creates a cart
-- ==========================================

INSERT INTO carts
(user_id)
VALUES
(1);


-- ==========================================
-- Insert Cart Items
-- Products currently in Ahmed's cart
-- ==========================================

INSERT INTO cart_items
(cart_id, product_id, quantity)
VALUES
(1,1,2),
(1,2,1);


-- ==========================================
-- Insert Wishlist Items
-- Ahmed saved these products
-- ==========================================

INSERT INTO wishlist_items
(user_id, product_id)
VALUES
(1,3),
(1,4);


-- ==========================================
-- Insert Order
-- Customer placed an order
-- ==========================================

INSERT INTO orders
(order_number, user_id, delivery_id, address_id, total_price)
VALUES
('ORD-0001',1,1,1,10499.97);


-- ==========================================
-- Insert Order Items
-- Products purchased in the order
-- ==========================================

INSERT INTO order_items
(order_id, product_id, product_name, quantity, price)
VALUES
(1,1,'Samsung Galaxy S25',2,2999.99),
(1,2,'iPhone 16 Pro',1,4499.99);


-- ==========================================
-- Insert Payment
-- Cash on delivery example
-- ==========================================

INSERT INTO payments
(order_id, payment_method, payment_status, transaction_id, amount)
VALUES
(1,'CASH_ON_DELIVERY','PENDING',NULL,10499.97);


-- ==========================================
-- Insert Reviews
-- Customers reviewing products
-- ==========================================

INSERT INTO reviews
(user_id, product_id, rating, comment)
VALUES
(1,1,5,'Excellent phone, very fast and good battery life.'),
(1,2,4,'Great performance but a little expensive.');


-- ==========================================
-- Insert Notifications
-- Messages sent to users
-- ==========================================

INSERT INTO notifications
(user_id, type, message)
VALUES
(1,'ORDER','Your order ORD-0001 has been confirmed.');


-- ==========================================
-- Insert Order Status History
-- Tracks order progress
-- ==========================================

INSERT INTO order_status_history
(order_id, status)
VALUES
(1,'PENDING'),
(1,'CONFIRMED'),
(1,'SHIPPED');