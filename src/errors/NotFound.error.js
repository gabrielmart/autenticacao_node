const ApiError = require("./Api.error");
const StatusCode = require('http-status-codes')

class NotFoundError extends ApiError {
    constructor(path) {
        super(StatusCode.NOT_FOUND, `O path ${path} não existe!`)
    }
}

module.exports = NotFoundError