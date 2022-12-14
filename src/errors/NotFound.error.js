const ApiError = require("./Api.error");
const StatusCode = require('http-status-codes')

class NotFoundError extends ApiError {
    constructor(message) {
        super(StatusCode.NOT_FOUND, message)
    }
}

module.exports = NotFoundError