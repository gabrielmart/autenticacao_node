const _ = require('lodash')
const Schemas = require('../schemas')

// Joi validation options
const validationOptions = {
    abortEarly: false, // abort after the last validation error
    allowUnknown: true, // allow unknown keys that will be ignored
    stripUnknown: true // remove unknown keys from the validated data
};

const validationSchema = (req, res, next) => {
    const route = req.route.path

    if (_.has(Schemas, route)) {
        const schema = _.get(Schemas, route)
        const { value, error } = schema.validate(req.body, validationOptions)
        error ? res.status(422).json({msg: error.message}) : ''
    }

    next()
}

module.exports = validationSchema