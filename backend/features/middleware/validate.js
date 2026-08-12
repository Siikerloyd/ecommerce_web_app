const validate = (schema) => {
    return (req, res, next) => {
        try {
            const parsedData = schema.parse(req.body);

            req.body = parsedData;

            next();
        } catch (error) {
            console.log(error);
            return res.status(400).json({
                message: "Validation failed",
                errors: error.errors
            });
        }
    };
};

module.exports = validate;