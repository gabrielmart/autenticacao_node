const Joi = require('joi')

const createPasswordResetSchema = Joi.object({
    email: Joi.string().email().required(),
})

module.exports = createPasswordResetSchema