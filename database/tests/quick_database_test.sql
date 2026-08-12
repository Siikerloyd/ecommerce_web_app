-- ==========================================
-- Check Users
-- ==========================================

SELECT * FROM users;


-- ==========================================
-- Check Categories
-- ==========================================

SELECT * FROM categories;


-- Test parent/sub-category relationship

SELECT 
    child.category_name AS sub_category,
    parent.category_name AS parent_category
FROM categories child
LEFT JOIN categories parent
ON child.parent_category_id = parent.category_id;


-- ==========================================
-- Check Brands
-- ==========================================

SELECT * FROM brands;


-- ==========================================
-- Check Products
-- ==========================================

SELECT * FROM products;


-- Test Products with Brands and Categories

SELECT
    p.product_id,
    p.name,
    b.brand_name,
    c.category_name,
    p.price,
    p.stock_quantity
FROM products p
JOIN brands b
ON p.brand_id = b.brand_id
JOIN categories c
ON p.category_id = c.category_id;


-- ==========================================
-- Check Product Images
-- ==========================================

SELECT * FROM product_images;


-- Test Product + Images relationship

SELECT
    p.name,
    pi.image_url,
    pi.is_primary
FROM products p
JOIN product_images pi
ON p.product_id = pi.product_id
ORDER BY p.product_id, pi.is_primary DESC;


-- ==========================================
-- Check Addresses
-- ==========================================

SELECT * FROM addresses;


-- Test Users + Addresses relationship

SELECT
    u.first_name,
    u.last_name,
    a.title,
    a.city,
    a.country
FROM addresses a
JOIN users u
ON a.user_id = u.user_id;


-- ==========================================
-- Check Delivery Profiles
-- ==========================================

SELECT * FROM delivery_profiles;


-- Test Users + Delivery Profiles

SELECT
    u.first_name,
    u.last_name,
    dp.vehicle_type,
    dp.status
FROM users u
JOIN delivery_profiles dp
ON u.user_id = dp.user_id;


-- ==========================================
-- Check Carts
-- ==========================================

SELECT * FROM carts;


-- Check Cart Items

SELECT * FROM cart_items;


-- Test Users + Carts + Cart Items + Products

SELECT
    u.first_name,
    p.name,
    ci.quantity,
    p.price
FROM cart_items ci
JOIN carts c
ON ci.cart_id = c.cart_id
JOIN users u
ON c.user_id = u.user_id
JOIN products p
ON ci.product_id = p.product_id;


-- ==========================================
-- Check Wishlist
-- ==========================================

SELECT * FROM wishlist_items;


-- Test Users + Wishlist + Products

SELECT
    u.first_name,
    p.name
FROM wishlist_items w
JOIN users u
ON w.user_id = u.user_id
JOIN products p
ON w.product_id = p.product_id;


-- ==========================================
-- Check Orders
-- ==========================================

SELECT * FROM orders;


-- Test Orders + Users + Addresses

SELECT
    o.order_number,
    u.first_name,
    a.city,
    o.status,
    o.total_price
FROM orders o
JOIN users u
ON o.user_id = u.user_id
JOIN addresses a
ON o.address_id = a.address_id;


-- ==========================================
-- Check Order Items
-- ==========================================

SELECT * FROM order_items;


-- Test Orders + Products + Order Items

SELECT
    o.order_number,
    p.name,
    oi.quantity,
    oi.price
FROM order_items oi
JOIN orders o
ON oi.order_id = o.order_id
JOIN products p
ON oi.product_id = p.product_id;


-- ==========================================
-- Check Payments
-- ==========================================

SELECT * FROM payments;


-- Test Orders + Payments

SELECT
    o.order_number,
    p.payment_method,
    p.payment_status,
    p.amount
FROM payments p
JOIN orders o
ON p.order_id = o.order_id;


-- ==========================================
-- Check Reviews
-- ==========================================

SELECT * FROM reviews;


-- Test Users + Products + Reviews

SELECT
    u.first_name,
    p.name,
    r.rating,
    r.comment
FROM reviews r
JOIN users u
ON r.user_id = u.user_id
JOIN products p
ON r.product_id = p.product_id;


-- ==========================================
-- Check Notifications
-- ==========================================

SELECT * FROM notifications;


-- Test Users + Notifications

SELECT
    u.first_name,
    n.type,
    n.message,
    n.is_read
FROM notifications n
JOIN users u
ON n.user_id = u.user_id;


-- ==========================================
-- Check Order Status History
-- ==========================================

SELECT * FROM order_status_history;


-- Test Orders + Status History

SELECT
    o.order_number,
    h.status,
    h.changed_at
FROM order_status_history h
JOIN orders o
ON h.order_id = o.order_id
ORDER BY h.changed_at;