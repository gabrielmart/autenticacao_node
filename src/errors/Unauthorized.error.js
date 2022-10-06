const ApiError = require("./Api.error");
const StatusCode = require('http-status-codes')

class UnauthorizedError extends ApiError {
    constructor(message) {
        super(StatusCode.UNAUTHORIZED, message)
    }
}

module.exports = UnauthorizedError