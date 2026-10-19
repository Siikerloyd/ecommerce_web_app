const authService = require('../services/authservice');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const pool = require('../../../config/connect_database.js');

const publicKey = fs.readFileSync(
    path.join(__dirname, '../../../keys/public.key'),
    'utf8'
);
const AppError=require('../../../utils/AppError.js');




//auth with error handling 

exports.login = async (req, res) => {

    const data = req.body;

    const auth = await authService.login(data);
    res.cookie("session", auth.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 1000,
        path: "/"
    });

     return res.status(200).json({
        message: "Welcome to our website",
        user: {
            user_id: auth.user.user_id,
            first_name: auth.user.first_name,
            last_name: auth.user.last_name,
            email: auth.user.email,
            phone_number: auth.user.phone_number,
            role: auth.user.role
        }
    });
};

exports.me=async(req,res)=>{
    const result=await authService.me(req.user);
    return res.status(200).json({message:"this is you",result});
}

exports.logout = async (req, res, next) => {
    const clearSessionCookie = () => {
        res.clearCookie("session", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/"
        });
    };

    try {
        const token = req.cookies?.session;

        // No cookie? Nothing to revoke.
        if (!token) {
            clearSessionCookie();

            return res.status(200).json({
                message: "Logged out successfully"
            });
        }

        let decoded;

        try {
            // Verify the signature, but allow an expired JWT
            // so the user can still log out.
            decoded = jwt.verify(token, publicKey, {
                algorithms: ['RS256'],
                ignoreExpiration: true
            });
        } catch (error) {
            // Invalid or tampered token: clear the cookie anyway.
            clearSessionCookie();

            return res.status(200).json({
                message: "Logged out successfully"
            });
        }

        // Only accept tokens containing the required claims.
        if (
            !Number.isInteger(decoded.user_id) ||
            !Number.isInteger(decoded.token_version)
        ) {
            clearSessionCookie();

            return res.status(200).json({
                message: "Logged out successfully"
            });
        }

        // Revoke only if this token still has the current version.
        // A previously revoked token cannot increment it again.
        await pool.query(
            `UPDATE users
             SET token_version = token_version + 1
             WHERE user_id = $1
               AND token_version = $2`,
            [decoded.user_id, decoded.token_version]
        );

        clearSessionCookie();

        return res.status(200).json({
            message: "Logged out successfully"
        });

    } catch (error) {
        // Clear the browser cookie even if PostgreSQL fails.
        clearSessionCookie();

        // Let the existing error middleware report the failure.
        return next(error);
    }
};