CREATE TYPE user_role AS ENUM (
    'CUSTOMER',
    'ADMIN',
    'DELIVERY'
);


CREATE TYPE delivery_status AS ENUM (
    'AVAILABLE',
    'BUSY',
    'OFFLINE'
);


CREATE TYPE product_status AS ENUM (
    'ACTIVE',
    'OUT_OF_STOCK',
    'DISCONTINUED'
);


CREATE TYPE order_status AS ENUM (
    'PENDING',
    'CONFIRMED',
    'PREPARING',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED'
);


CREATE TYPE payment_method AS ENUM (
    'CASH_ON_DELIVERY',
    'CREDIT_CARD',
    'PAYPAL'
);


CREATE TYPE payment_status AS ENUM (
    'PENDING',
    'PAID',
    'FAILED',
    'REFUNDED'
);


CREATE TYPE notification_type AS ENUM (
    'ORDER',
    'PAYMENT',
    'PROMOTION',
    'SYSTEM'
);