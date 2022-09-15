const Joi = require('joi')

const userCreateSchema = Joi.object({
    name: Joi.string().alphanum().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(64).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required()
})


module.exports = {
    '/user': userCreateSchema
}