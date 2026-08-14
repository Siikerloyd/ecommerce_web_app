const pool = require('../../../config/connect_database.js');
const check = require('../../../utils/hash.js');
const jwt = require('../../../utils/jwt.js');
exports.login = async (data) => {
    const result = await pool.query
        (
            `
        select user_id,first_name,last_name,email,phone_number,password_hash,role
        from users
        where email=$1;
        `, [data.email]);


    if (
        result.rows.length !== 0 &&
        await check.CheckPassword(
            data.password,
            result.rows[0].password_hash
        )
    ) {
        await pool.query(
            `UPDATE users
         SET is_active = true,
             last_login = NOW()
         WHERE email = $1`,
            [data.email]
        );
        const user = result.rows[0];
        const safeUser = {
            user_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone_number: user.phone_number,
            role: user.role
        };
        const token = jwt.generateToken(safeUser);
        return { user: safeUser, token };
    }

    return null;

};