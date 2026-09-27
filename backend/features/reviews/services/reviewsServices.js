const pool = require("../../../config/connect_database.js");
const AppError = require("../../../utils/AppError.js");

exports.createReview = async (userId, data) => {
    const { product_id, rating, comment } = data;

    try {
        // Check that the product exists
        const product = await pool.query(
            `
            SELECT product_id
            FROM products
            WHERE product_id = $1
            `,
            [product_id]
        );

        if (product.rowCount === 0) {
            throw new AppError("Product not found", 404);
        }

        // Check that user bought the product
        // and the order was delivered
        const deliveredOrder = await pool.query(
            `
            SELECT o.order_id
            FROM orders o
            JOIN order_items oi
                ON oi.order_id = o.order_id
            WHERE o.user_id = $1
              AND oi.product_id = $2
              AND o.status = 'DELIVERED'
            LIMIT 1
            `,
            [userId, product_id]
        );

        if (deliveredOrder.rowCount === 0) {
            throw new AppError(
                "You can only review products from delivered orders",
                403
            );
        }

        // Create review
        const result = await pool.query(
            `
            INSERT INTO reviews (
                user_id,
                product_id,
                rating,
                comment
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *
            `,
            [userId, product_id, rating, comment ?? null]
        );

        return result.rows[0];

    } catch (error) {
        if (error.code === "22P02") {
            throw new AppError("Invalid product ID", 400);
        }

        if (error.code === "23505") {
            throw new AppError(
                "You have already reviewed this product",
                409
            );
        }

        throw error;
    }
};


exports.getProductReviews = async (productId) => {
    try {
        const product = await pool.query(
            `
            SELECT product_id
            FROM products
            WHERE product_id = $1
            `,
            [productId]
        );

        if (product.rowCount === 0) {
            throw new AppError("Product not found", 404);
        }

        const result = await pool.query(
            `
            SELECT
                review_id,
                user_id,
                product_id,
                rating,
                comment,
                created_at,
                updated_at
            FROM reviews
            WHERE product_id = $1
            ORDER BY created_at DESC
            `,
            [productId]
        );

        return result.rows;

    } catch (error) {
        if (error.code === "22P02") {
            throw new AppError("Invalid product ID", 400);
        }

        throw error;
    }
};


exports.getReviewById = async (reviewId) => {
    try {
        const result = await pool.query(
            `
            SELECT *
            FROM reviews
            WHERE review_id = $1
            `,
            [reviewId]
        );

        if (result.rowCount === 0) {
            throw new AppError("Review not found", 404);
        }

        return result.rows[0];

    } catch (error) {
        if (error.code === "22P02") {
            throw new AppError("Invalid review ID", 400);
        }

        throw error;
    }
};


exports.updateReview = async (reviewId, userId, data) => {
    const { rating, comment } = data;

    try {
        const result = await pool.query(
            `
            UPDATE reviews
            SET
                rating = COALESCE($1, rating),
                comment = COALESCE($2, comment),
                updated_at = CURRENT_TIMESTAMP
            WHERE review_id = $3
              AND user_id = $4
            RETURNING *
            `,
            [rating ?? null, comment ?? null, reviewId, userId]
        );

        if (result.rowCount === 0) {
            const review = await pool.query(
                `
                SELECT review_id
                FROM reviews
                WHERE review_id = $1
                `,
                [reviewId]
            );

            if (review.rowCount === 0) {
                throw new AppError("Review not found", 404);
            }

            throw new AppError("Forbidden", 403);
        }

        return result.rows[0];

    } catch (error) {
        if (error.code === "22P02") {
            throw new AppError("Invalid review ID", 400);
        }

        throw error;
    }
};


exports.deleteReview = async (reviewId, userId) => {
    try {
        //we delete the user review based on review and user id 
        const result = await pool.query(
            `
            DELETE FROM reviews
            WHERE review_id = $1
            AND user_id = $2
            `,
            [reviewId, userId]
        );

        if (result.rowCount === 0) {
            throw new AppError("Review not found", 404);
        }

    } catch (error) {
        if (error.code === "22P02") {
            throw new AppError("Invalid review ID", 400);
        }

        throw error;
    }
};