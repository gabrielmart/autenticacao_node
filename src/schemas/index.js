const userCreateSchema = require('./userCreate.schema')
const loginSchema = require('./login.schema')
const refreshTokenSchema = require('./refreshToken.schema')

module.exports = {
    '/user': userCreateSchema,
    '/auth/login': loginSchema,
    '/auth/refreshToken': refreshTokenSchema
}