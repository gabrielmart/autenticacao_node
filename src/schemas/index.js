const userCreateSchema = require('./userCreate.schema')
const loginSchema = require('./login.schema')

module.exports = {
    '/user': userCreateSchema,
    '/user/login': loginSchema
}