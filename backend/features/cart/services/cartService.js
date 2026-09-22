
const pool = require('../../../config/connect_database.js');
const AppError = require('../../../utils/AppError.js');


exports.getCart = async (userId) => {

    const query = await pool.query(
        `
        SELECT
            c.cart_id,
            ci.cart_item_id,
            ci.product_id,
            ci.quantity,
            p.sku,
            p.name,
            p.price,
            p.stock_quantity,
            p.status,
            p.price * ci.quantity AS subtotal
        FROM carts c
        JOIN cart_items ci
            ON ci.cart_id = c.cart_id
        JOIN products p
            ON p.product_id = ci.product_id
        WHERE c.user_id = $1;
        `,
        [userId]
    );

    const cart = query.rows;

    const total = cart.reduce((sum, item) => {
        return sum + Number(item.subtotal);
    }, 0);

    return {
        cart_id: cart[0]?.cart_id ?? null,
        items: cart,
        total
    };
};

exports.addToCart = async (productId, quantity, userId) => {
    //1.make sure inserted values are correct 
    if (!(Number(productId) > 0)) {
        throw new AppError("invalid product", 400);
    }
    if (!(Number(quantity) > 0)) {
        throw new AppError("invalid quantity value", 400);
    }
    let client;
    try {
        //2.start transaction
        client = await pool.connect();
        await client.query("BEGIN");
        //3.check that product exists
        const checkdProduct = await client.query(
            `
            select stock_quantity,status from products
            where product_id=$1;
            `, [productId]
        )
        if (checkdProduct.rowCount === 0) {
            throw new AppError("product does not exist", 404);
        }
        //4.get databse values for product (stock and status) 
        const stock = Number(checkdProduct.rows[0].stock_quantity);
        const status = checkdProduct.rows[0].status;
        //5.make sure product status is active not discontinued or out_of_stock
        if (status !== "ACTIVE") {
            throw new AppError(
                "we dont have the product your looking for anymore!",
                400
            );
        }
        //6.check the stock quantity we have greater than quantity inserted by user
        if (stock < quantity) {
            throw new AppError(`we only have ${stock} item of this product!`, 400);
        }

        //7.we look for user cart if he has one
        let userCart = await client.query(
            `select cart_id from carts
            where user_id=$1; 
            `, [userId]);
        //8.if he dont we create a cart for him and get its id
        if (userCart.rowCount === 0) {
            userCart = await client.query(
                `
            INSERT INTO carts(user_id)
            VALUES($1)
            RETURNING cart_id
            `,
                [userId]
            );
        }
        //9.check of product exists in cart_items
        const checkProductExistCartItems = await client.query(
            `
        SELECT quantity
        FROM cart_items
        WHERE cart_id=$1
        AND product_id=$2
        `, [userCart.rows[0].cart_id, productId]
        )
        //10.if not we insert the product in cart items
        let response;
        if (checkProductExistCartItems.rowCount === 0) {
            response = await client.query(
                `
            insert into cart_items(cart_id,product_id,quantity)
            values($1,$2,$3) RETURNING *
            `, [userCart.rows[0].cart_id, productId, quantity]
            )

        }
        //11.if it does exist we update quantity
        if (checkProductExistCartItems.rowCount > 0) {
            const newQuantity = Number(checkProductExistCartItems.rows[0].quantity) + quantity;
            //12.we make sure new quantity is still less or equal to what we have in stock
            if (newQuantity > stock) {
                throw new AppError(`we only have ${stock} item of the product your looking for!`, 400);
            }
            response = await client.query(
                `
            UPDATE cart_items
            SET quantity=$1
            WHERE cart_id=$2
            AND product_id=$3
            RETURNING *
            `, [newQuantity, userCart.rows[0].cart_id, productId]
            )
        }
        await client.query("COMMIT");
        return response.rows[0];
    } catch (error) {
        if (client) {
            await client.query("ROLLBACK");
        }
        throw error;
    } finally {
        if (client) {
            client.release();
        }
    }
}


exports.updateCartItems = async (cartItemId, quantity, userId) => {
    // 1. Validate quantity
    if (!(Number(quantity) > 0)) {
        throw new AppError("invalid quantity value", 400);
    }

    // 2. Make sure this cart item belongs to the current user
    const userCartItems = await pool.query(
        `
        SELECT ci.*
        FROM cart_items ci
        JOIN carts c ON c.cart_id = ci.cart_id
        WHERE ci.cart_item_id = $1
        AND c.user_id = $2
        `,
        [cartItemId, userId]
    );

    if (userCartItems.rowCount === 0) {
        throw new AppError("Cart item not found", 404);
    }

    // 3. Get the product's current stock and status
    const getProductStock = await pool.query(
        `
        SELECT stock_quantity, status
        FROM products
        WHERE product_id = $1
        `,
        [userCartItems.rows[0].product_id]
    );

    if (getProductStock.rowCount === 0) {
        throw new AppError("Product not found", 404);
    }

    const stock = Number(getProductStock.rows[0].stock_quantity);
    const status = getProductStock.rows[0].status;

    // 4. Make sure product is still active
    if (status !== "ACTIVE") {
        throw new AppError(
            "This product is no longer available",
            400
        );
    }

    // 5. PATCH replaces the quantity
    const newQuantity = Number(quantity);

    // 6. Make sure requested quantity is available
    if (newQuantity > stock) {
        throw new AppError(
            `We only have ${stock} items of this product!`,
            400
        );
    }

    // 7. Update cart item
    const result = await pool.query(
        `
        UPDATE cart_items
        SET quantity = $1
        WHERE cart_item_id = $2
        AND cart_id = $3
        AND product_id = $4
        RETURNING *
        `,
        [
            newQuantity,
            cartItemId,
            userCartItems.rows[0].cart_id,
            userCartItems.rows[0].product_id
        ]
    );

    return result.rows[0];
};


exports.deleteCartItem = async (cartItemId, userId) => {
    const result = await pool.query(
        `
        DELETE FROM cart_items ci
        USING carts c
        WHERE ci.cart_item_id = $1
        AND ci.cart_id = c.cart_id
        AND c.user_id = $2
        RETURNING ci.*;
        `,
        [cartItemId, userId]
    );

    if (result.rowCount === 0) {
        throw new AppError("Cart item not found", 404);
    }

    return result.rows[0];
};