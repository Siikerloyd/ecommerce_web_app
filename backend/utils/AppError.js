//create error objsect to be used for all errors accross the sever side
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

module.exports = AppError;