const authService = require('../services/authservice');
const AppError=require('../../../utils/AppError.js');
/*
exports.login = async (req, res) => {
    const data = req.body;

    try {
        const auth = await authService.login(data);

        if (auth) {
            res.json({
                message: 'Welcome to our website',
                user: {
                    user_id: auth.user.user_id,
                    first_name: auth.user.first_name,
                    last_name: auth.user.last_name,
                    email: auth.user.email,
                    phone_number: auth.user.phone_number,
                    role: auth.user.role
                },
                token: auth.token
            });
        } else {
            res.status(401).json({
                message: 'Make sure you entered the correct credentials'
            });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};*/


//auth with error handling 

exports.login = async (req, res) => {

    const data = req.body;

    const auth = await authService.login(data);

    res.json({
        message: 'Welcome to our website',
        user: {
            user_id: auth.user.user_id,
            first_name: auth.user.first_name,
            last_name: auth.user.last_name,
            email: auth.user.email,
            phone_number: auth.user.phone_number,
            role: auth.user.role
        },
        token: auth.token
    });
};



