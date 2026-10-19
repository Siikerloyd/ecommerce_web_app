const jwt = require('jsonwebtoken');
const fs = require('fs');
const pool = require('../../config/connect_database.js');

const publicKey = fs.readFileSync(
    './keys/public.key',
    'utf8'
);

const authenticateToken = async (req, res, next) => {
    const token = req.cookies?.session;

    if (!token) {
        return res.status(401).json({
            message: 'Not authorized, no token'
        });
    }

    let decoded;

    try {
        decoded = jwt.verify(token, publicKey, {
            algorithms: ['RS256']
        });
    } catch (error) {
        return res.status(401).json({
            message: 'Not authorized, invalid or expired token'
        });
    }

    try {
        const result = await pool.query(
            `SELECT token_version FROM users WHERE user_id = $1`,
            [decoded.user_id]
        );

        if (result.rowCount === 0) {
            return res.status(401).json({
                message: 'Not authorized, user not found'
            });
        }

        const currentVersion = result.rows[0].token_version;

        if (
            !Number.isInteger(decoded.token_version) ||
            decoded.token_version !== currentVersion
        ) {
            return res.status(401).json({
                message: 'Not authorized, session revoked'
            });
        }

        req.user = decoded;
        next();
    } catch (error) {
        return next(error);
    }
};

module.exports = authenticateToken;