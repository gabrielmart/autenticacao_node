const ApiError = require("./Api.error");
const StatusCode = require('http-status-codes')

class UnprocessableEntity extends ApiError {
    constructor(message) {
        super(StatusCode.UNPROCESSABLE_ENTITY, message)
    }
}

module.exports = UnprocessableEntity