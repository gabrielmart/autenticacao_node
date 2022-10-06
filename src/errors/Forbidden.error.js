const ApiError = require("./Api.error");
const StatusCode = require('http-status-codes')

class ForbiddenError extends ApiError {
    constructor(message) {
        super(StatusCode.FORBIDDEN, message)
    }
}

module.exports = ForbiddenError