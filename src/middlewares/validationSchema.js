const _ = require('lodash')
const StatusCode = require('http-status-codes')
const Schemas = require('../schemas')
const BadRequestError = require('../errors/BadRequest.error')

// Joi validation options
const validationOptions = {
    abortEarly: false, // abort after the last validation error
    allowUnknown: true, // allow unknown keys that will be ignored
    stripUnknown: true // remove unknown keys from the validated data
};

const validationSchema = (req, res, next) => {
    const route = req.originalUrl

    if (_.has(Schemas, route)) {
        const schema = _.get(Schemas, route)
        const { value, error } = schema.validate(req.body, validationOptions)

        if (!!error) throw new BadRequestError([...error.details])

        req.body = value
        next()
    }
}

module.exports = validationSchema