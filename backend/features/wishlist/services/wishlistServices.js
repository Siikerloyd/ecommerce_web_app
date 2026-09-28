const pool = require("../../../config/connect_database.js");
const AppError = require("../../../utils/AppError.js");

exports.addToWishlist = async (userId, productId) => {
    try {
        // 1. Check product exists
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

        // 2. Add product to wishlist
        const result = await pool.query(
            `
            INSERT INTO wishlist_items (
                user_id,
                product_id
            )
            VALUES ($1, $2)
            RETURNING *
            `,
            [userId, productId]
        );

        return result.rows[0];

    } catch (error) {
        // Invalid product ID
        if (error.code === "22P02") {
            throw new AppError("Invalid product ID", 400);
        }

        // Already in wishlist
        if (error.code === "23505") {
            throw new AppError(
                "Product is already in your wishlist",
                409
            );
        }

        throw error;
    }
};


exports.getwishlist = async (userId) => {
    const result = await pool.query(
        `
        SELECT
            wi.wishlist_item_id,
            wi.product_id,
            p.name,
            p.price,
            p.stock_quantity,
            wi.created_at
        FROM wishlist_items wi
        JOIN products p
            ON p.product_id = wi.product_id
        WHERE wi.user_id = $1
        ORDER BY wi.created_at DESC
        `,
        [userId]
    );

    return result.rows;
};

exports.deleteProductWishlist = async (productId, userId) => {
    try {
        const deleted = await pool.query(
            `
        delete from wishlist_items
        where user_id=$1
        and product_id=$2
        returning *
        `, [userId, productId]
        )
        if (deleted.rowCount === 0) {
            throw new AppError('product is not in youre wishlist!',404);
        }
        return deleted.rows[0];
    } catch (error) {
        if (error.code === "22P02") {
            throw new AppError("Invalid product ID", 400);
        }

        throw error;
    }
}