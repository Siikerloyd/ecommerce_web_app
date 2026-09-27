const AppError = require('../../../utils/AppError.js');
const pool = require('../../../config/connect_database.js');
const generateOrderNumber = require("../../../utils/orderNumbers.js");


exports.getOrders = async (userId) => {
    const result = await pool.query(
        `
        SELECT *
        FROM orders
        WHERE user_id = $1
        ORDER BY created_at DESC
        `,
        [userId]
    );

    return result.rows;
};


exports.getOrderById = async (orderId, userId) => {
    try {
        const order = await pool.query(
            `
            SELECT *
            FROM orders
            WHERE order_id = $1
            AND user_id = $2
            `,
            [orderId, userId]
        );

        if (order.rowCount === 0) {
            throw new AppError("Order not found", 404);
        }

        const items = await pool.query(
            `
            SELECT *
            FROM order_items
            WHERE order_id = $1
            ORDER BY order_item_id ASC
            `,
            [orderId]
        );

        return {
            order: order.rows[0],
            items: items.rows
        };

    } catch (error) {
        if (error.code === "22P02") {
            throw new AppError("Invalid order ID", 400);
        }

        throw error;
    }
};


exports.createOrder = async (userId, data) => {
    //initialise client
    let client;
    try {
        //use client
        client = await pool.connect();
        //start transaction
        await client.query("BEGIN");
        //get cart items and product details using user id coming from jwt 
        const getCartItemsDetails = await client.query(
            `
            SELECT
                ci.product_id,
                ci.quantity,
                p.name,
                p.price,
                p.stock_quantity,
                p.status
            FROM carts c
            JOIN cart_items ci
                ON ci.cart_id = c.cart_id
            JOIN products p
                ON p.product_id = ci.product_id
            WHERE c.user_id = $1
            FOR UPDATE OF p;
            `,
            [userId]
        );
        //check if the user have a cart and that cart not empty
        if (getCartItemsDetails.rowCount === 0) {
            throw new AppError("Your cart is empty!", 400);
        }
        //get the total from the cartitems and product quantity*product_price
        const total = getCartItemsDetails.rows.reduce((sum, item) => {
            return sum + Number(item.price) * item.quantity;
        }, 0);
        //before creating order we get user address
        const checkAddress = await client.query(
            `
            select address_id from addresses
            where user_id=$1
            and address_id=$2
            `, [userId, data.address_id]);
        //check user put the right address
        if (checkAddress.rowCount === 0) {
            throw new AppError("Address not found", 404);
        }
        //get the last sequence used in database 
        const sequence = await client.query(
            `SELECT nextval('order_number_seq') AS number`
        );
        //pasing the sequence as a parameter so the helper dont generate repeated order number
        const orderNumber = generateOrderNumber(
            sequence.rows[0].number
        );
        //we create the new order
        const order = await client.query(`
            insert into orders(order_number,
            user_id,
            address_id,
            total_price)
            VALUES ($1, $2, $3, $4)
            RETURNING *`, [orderNumber, userId, data.address_id, total]);
        const orderId = order.rows[0].order_id;
        //after creating the order we create order items this way we can store the product price in that time even if it changes later in the future 
        for (const item of getCartItemsDetails.rows) {
            //we check each product status in cart_items
            if (item.status !== "ACTIVE") {
                throw new AppError(
                    `This product is no longer available: ${item.name}`,
                    400
                );
            }
            //the we check for each product in cartitems that we have in stock is more than the user requested
            if (item.quantity > item.stock_quantity) {
                throw new AppError(
                    `We only have ${item.stock_quantity} items of this product: ${item.name}`,
                    400
                );
            }
            //we create order items
            await client.query(
                `insert into order_items(order_id,product_id,product_name,quantity,price)
                values($1,$2,$3,$4,$5)`, [orderId, item.product_id, item.name, item.quantity, item.price]
            )
            //then we decrease stock according to the quantity requested for each product in cart items
            await client.query(
                `
                UPDATE products
                SET stock_quantity = stock_quantity - $1
                WHERE product_id = $2
                `,
                [item.quantity, item.product_id]
            );
        }
        //finally we clear cart 
        await client.query(
            `DELETE FROM cart_items
            WHERE cart_id = (
            SELECT cart_id
            FROM carts
            WHERE user_id = $1
            );`, [userId])
        //get the api response ready
        const orderItems = await client.query(
            `
            SELECT *
            FROM order_items
            WHERE order_id = $1
            ORDER BY order_item_id ASC
            `,
            [orderId]
        );
        //we commit transaction and all querries it contains 
        await client.query("COMMIT");
        //we return api response   
        return {
            order: order.rows[0],
            items: orderItems.rows
        };
    } catch (error) {
        //if client used and any querry fails or an error thrown we rollback
        if (client) {
            await client.query("ROLLBACK");
        }
        //we throw the error coming from postgrsql
        throw error;
    } finally {
        //finally we release connection if we used client
        if (client) {
            client.release();
        }
    }
};


exports.updateOrderStatus = async (orderId, data) => {
    const status = data.status;
    try {
        const checkOrder = await pool.query(
            `
        select status from orders where order_id=$1
        `, [orderId]
        )

        if (checkOrder.rowCount === 0) {
            throw new AppError("order does not exist!", 404);
        }

        const statusUpdate = await pool.query(
            `
            UPDATE orders
            SET status = $1
            WHERE order_id = $2
            AND (
            (status = 'PENDING' AND $1::order_status = 'CONFIRMED')
            OR
            (status = 'CONFIRMED' AND $1::order_status = 'PREPARING')
            OR
            (status = 'PREPARING' AND $1::order_status = 'SHIPPED')
            OR
            (status = 'SHIPPED' AND $1::order_status = 'OUT_FOR_DELIVERY')
            OR
            (status = 'OUT_FOR_DELIVERY' AND $1::order_status = 'DELIVERED')
            OR
            (status = 'PENDING' AND $1::order_status = 'CANCELLED')
            OR
            (status = 'CONFIRMED' AND $1::order_status = 'CANCELLED')
        )
            RETURNING *;
            `, [status, orderId]
        )
        if (statusUpdate.rowCount === 0) {
            throw new AppError("Invalid order status transition", 400);
        }
        return statusUpdate.rows[0];
    } catch (error) {
        if (error.code === "22P02") {
            throw new AppError("Invalid order ID", 400);
        }

        throw error;

    }

}