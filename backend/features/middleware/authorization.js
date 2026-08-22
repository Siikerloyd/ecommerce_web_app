const AppError = require('../../utils/AppError.js');

const verifyRole = (...allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user?.role;
        if (!userRole) {
            throw new AppError("Not authenticated", 401);
        }
        if (!allowedRoles.includes(userRole)) {
            throw new AppError("Forbidden", 403);
        }
        next();
    };

};

const updateAuth = (req, res, next) => {

    const endpointId = String(req.params.id);
    const currentId = String(req.user?.user_id);
    const userRole = req.user?.role;
    

    if (!userRole || !currentId) {
        throw new AppError("Not authenticated", 401);
    }

    if (userRole === "ADMIN") {
        return next();
    }

    if (endpointId !== currentId) {
        throw new AppError("Forbidden", 403);
    }

    next();
};

module.exports = { verifyRole, updateAuth };