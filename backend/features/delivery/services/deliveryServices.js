const pool = require('../../../config/connect_database.js');
const AppError = require('../../../utils/AppError.js');
exports.allDelivery = async () => {
    const result = await pool.query(
        `
        SELECT
            u.user_id,
            u.first_name,
            u.last_name,
            u.email,
            u.phone_number,
            u.role,

            d.delivery_id,
            d.vehicle_type,
            d.license_number,
            d.status,

            a.street,
            a.city,
            a.postal_code,
            a.country,
            a.phone_number AS address_phone_number

        FROM users u

        LEFT JOIN addresses a
            ON a.user_id = u.user_id
            AND a.is_default = TRUE

        JOIN delivery_profiles d
            ON d.user_id = u.user_id

        ORDER BY d.delivery_id ASC
        `
    );

    return result.rows;
};

exports.getMyDeliveryProfile = async (userId) => {
    const result = await pool.query(
        `
        SELECT
            u.user_id,
            u.first_name,
            u.last_name,
            u.email,
            u.phone_number,
            u.role,

            d.delivery_id,
            d.vehicle_type,
            d.license_number,
            d.status,

            a.street,
            a.city,
            a.postal_code,
            a.country,
            a.phone_number AS address_phone_number

        FROM users u

        LEFT JOIN addresses a
            ON a.user_id = u.user_id
            AND a.is_default = TRUE

        JOIN delivery_profiles d
            ON d.user_id = u.user_id

        WHERE d.user_id = $1
        `,
        [userId]
    );

    if (result.rowCount === 0) {
        throw new AppError("Delivery profile not found", 404);
    }

    return result.rows[0];
};

exports.getDeliveryAssignedOrders = async (userId) => {
    const result = await pool.query(
        `
        SELECT
            o.order_id,
            o.order_number,
            o.status,
            o.total_price,
            o.created_at,

            u.user_id,
            u.first_name,
            u.last_name,
            u.phone_number,

            a.street,
            a.city,
            a.postal_code,
            a.country,
            a.phone_number,

            ot.product_id,
            ot.product_name,
            ot.quantity,
            ot.price

        FROM orders o

        JOIN users u
            ON o.user_id = u.user_id

        JOIN addresses a
            ON o.address_id = a.address_id

        JOIN order_items ot
            ON o.order_id = ot.order_id

        JOIN delivery_profiles d
            ON o.delivery_id = d.delivery_id

        WHERE d.user_id = $1;
        `, [userId]
    )
    return result.rows;
}

exports.whoAssignedToDeliver = async (orderId) => {


    try {

        const checkOrder = await pool.query(
            `
        select delivery_id from orders
        where order_id=$1
        `, [orderId]
        )

        if (checkOrder.rowCount === 0) {
            throw new AppError("order does not exist!", 404);

        }

        if (checkOrder.rows[0].delivery_id === null) {
            throw new AppError(
                "No delivery person assigned to this order",
                404
            );
        }
        const assignedDelivery = await pool.query(
            `
        SELECT
            o.order_id,
            o.order_number,

            d.delivery_id,
            d.vehicle_type,
            d.license_number,
            d.status,

            u.user_id,
            u.first_name,
            u.last_name,
            u.phone_number

        FROM orders o

        JOIN delivery_profiles d
            ON o.delivery_id = d.delivery_id

        JOIN users u
            ON d.user_id = u.user_id

        WHERE o.order_id = $1;
        `, [orderId]
        )

        return assignedDelivery.rows[0];
    } catch (error) {
        if (error.code === "22P02") {
            throw new AppError("Invalid order ID", 400);
        }
        throw error;

    }
}


exports.getmyassignedorder = async (orderId, userId) => {
    try {
        const checkOrder = await pool.query(
            `
            select order_id from orders
            where order_id=$1
            `, [orderId]
        )
        if (checkOrder.rowCount === 0) {
            throw new AppError("order does not exist", 404);
        }

        const getAsiggnedOrder = await pool.query(
            `
            SELECT
                o.order_id,
                o.order_number,
                o.status,
                o.total_price,
                o.created_at,

                u.user_id,
                u.first_name,
                u.last_name,
                u.email,
                u.phone_number,

                a.street,
                a.city,
                a.postal_code,
                a.country,
                a.phone_number AS address_phone_number,

                oi.product_id,
                oi.product_name,
                oi.quantity,
                oi.price

            FROM orders o

            JOIN users u
                ON o.user_id = u.user_id

            JOIN addresses a
                ON o.address_id = a.address_id

            JOIN order_items oi
                ON o.order_id = oi.order_id

            JOIN delivery_profiles d
                ON o.delivery_id = d.delivery_id

            WHERE d.user_id = $1
            AND o.order_id = $2;
            `, [userId, orderId]
        )
        if (getAsiggnedOrder.rowCount === 0) {
            throw new AppError("this order not assigned to you", 404)
        }

        return getAsiggnedOrder.rows;

    } catch (error) {
        if (error.code === "22P02") {
            throw new AppError("Invalid order ID", 400);
        }
        throw error;
    }

}


exports.manageaOrders = async (orderId, deliveryId) => {
    let client;
    try {
        client = await pool.connect();
        await client.query("BEGIN");
        //check if order exists
        const checkOrder = await client.query(
            `
            select delivery_id,status from orders
            where order_id=$1;
            `, [orderId]
        );
        if (checkOrder.rowCount === 0) {
            throw new AppError("order does not exist", 404);
        };
        
        //check if deliveryId actually provided 
        if (!deliveryId) {
            throw new AppError("delivery_id is required", 400);
        }
        //check if the delivery id valid
        const checkDelivery = await client.query(
            `
            select delivery_id from delivery_profiles 
            where delivery_id=$1;
            `, [deliveryId]
        )

        if (checkDelivery.rowCount === 0) {
            throw new AppError('delivery personnel not found!', 404);
        }
        //check if order status is shipped 
        if (checkOrder.rows[0].status !== 'SHIPPED') {
            throw new AppError("order status should be shipped in order to assigne delivey", 400);

        }
        //update the order 
        const updateorder = await client.query(
            `
            update orders
            set delivery_id=$1,status='OUT_FOR_DELIVERY'
            where order_id=$2
            returning *
            `, [deliveryId, orderId]
        );

        await client.query(
            `
            insert into order_status_history(order_id,status)
            values($1,'OUT_FOR_DELIVERY')`, [orderId]
        );

        await client.query("COMMIT");
        return updateorder.rows[0];
    } catch (error) {

        if (client) {
            await client.query("ROLLBACK");
        }


        if (error.code === "22P02") {
            throw new AppError("Invalid order ID", 400);
        }
        
        throw error;
    } finally {
        if (client) {
            client.release();
        }

    }
}


exports.updateMyStatus = async (userId, status) => {
    const result = await pool.query(
        `
        UPDATE delivery_profiles
        SET status = $1
        WHERE user_id = $2
        RETURNING *;
        `,
        [status, userId]
    );

    if (result.rowCount === 0) {
        throw new AppError("Delivery profile not found", 404);
    }

    return result.rows[0];
};

