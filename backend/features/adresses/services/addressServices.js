const pool = require('../../../config/connect_database.js');
const AppError = require('../../../utils/AppError.js');

exports.createAddress = async (userId, data) => {
    const value = data.is_default ?? false;

    const query = await pool.query(`
        INSERT INTO addresses
        (user_id, title, street, city, postal_code, country, phone_number, is_default)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
    `, [
        userId,
        data.title,
        data.street,
        data.city,
        data.postal_code,
        data.country,
        data.phone_number,
        value
    ]);

    return query.rows[0];
};


exports.getUserAddresses = async (userId) => {
    const query = await pool.query(
        `SELECT *
         FROM addresses
         WHERE user_id = $1
         ORDER BY is_default DESC, created_at DESC`,
        [userId]
    );
    return query.rows;
};

exports.getAddressById = async (userId, addressId) => {

    const query = await pool.query(`
        SELECT *
        FROM addresses
        WHERE address_id = $1
        AND user_id = $2
    `, [addressId, userId]);

    if (query.rowCount === 0) {
        throw new AppError('Address not found!', 404);
    }
    return query.rows[0];
};

exports.updateAddress = async (userId, addressId, data) => {
    const fields = Object.keys(data);
    const allowedFields = [
        'title', 'street', 'city', 'postal_code',
        'country', 'phone_number', 'is_default'
    ];

    if (fields.length === 0) {
        throw new AppError("No fields provided for update", 400);
    }

    let is_default = false;
    const setParts = [];
    const values = [];

    fields.forEach((key, index) => {
        if (!allowedFields.includes(key)) {
            throw new AppError(`Field ${key} cannot be updated`, 400);
        }
        if (key === 'is_default' && data[key] === true) {
            is_default = true;
        }
        setParts.push(`${key} = $${index + 1}`);
        values.push(data[key]);
    });

    const setClause = setParts.join(', ');
    let client;

    try {
        client = await pool.connect();
        await client.query('BEGIN');

        const existing = await client.query(
            `SELECT address_id FROM addresses
             WHERE address_id = $1 AND user_id = $2
             FOR UPDATE`,
            [addressId, userId]
        );

        if (existing.rowCount === 0) {
            throw new AppError("Address not found", 404);
        }

        if (is_default) {
            await client.query(
                `UPDATE addresses
                 SET is_default = false
                 WHERE user_id = $1 AND address_id != $2`,
                [userId, addressId]
            );
        }

        values.push(userId, addressId);
        const query = await client.query(
            `UPDATE addresses
             SET ${setClause}
             WHERE user_id = $${values.length - 1}
             AND address_id = $${values.length}
             RETURNING *`,
            values
        );

        await client.query('COMMIT');
        return query.rows[0];

    } catch (error) {
        if (client) await client.query('ROLLBACK');
        throw error;
    } finally {
        if (client) client.release();
    }
};