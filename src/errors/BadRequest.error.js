const StatusCode = require('http-status-codes')
const ApiError = require('./Api.error')

class BadRequestError extends ApiError {
    constructor(inputs) {
        super(StatusCode.BAD_REQUEST, `Requisição invalida: ${concatMessages(inputs)}`)
    }
}

const concatMessages = (inputs) => {
    return inputs.reduce((previousMessage, { message }, index) => {
        return previousMessage + '\n' + '• ' + message + (index < inputs.length - 1 ? ', ' : '.') 
    }, '')
}

module.exports = BadRequestError